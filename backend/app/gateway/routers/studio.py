"""Studio API router.

Provides CRUD for Studio tasks plus an SSE endpoint that runs the full
content pipeline and streams stage updates in real time.
"""

from __future__ import annotations

import asyncio
import json
import logging
import time

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services.studio import (
    StudioTask,
    StudioTaskCreateRequest,
    create_studio_task,
    delete_studio_task,
    get_studio_task,
    list_studio_tasks,
    run_studio_pipeline,
    update_studio_task,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/studio", tags=["studio"])


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------

class StudioTasksResponse(BaseModel):
    tasks: list[StudioTask]


# ---------------------------------------------------------------------------
# Task CRUD
# ---------------------------------------------------------------------------

@router.get("/tasks", response_model=StudioTasksResponse, summary="List studio tasks")
async def get_tasks() -> StudioTasksResponse:
    return StudioTasksResponse(tasks=list_studio_tasks())


@router.post("/tasks", response_model=StudioTask, summary="Create studio task")
async def post_task(body: StudioTaskCreateRequest) -> StudioTask:
    return create_studio_task(body)


@router.get("/tasks/{task_id}", response_model=StudioTask, summary="Get studio task")
async def get_task(task_id: str) -> StudioTask:
    task = get_studio_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Studio task '{task_id}' not found")
    return task


@router.delete("/tasks/{task_id}", summary="Delete studio task")
async def remove_task(task_id: str) -> dict:
    if not delete_studio_task(task_id):
        raise HTTPException(status_code=404, detail=f"Studio task '{task_id}' not found")
    return {"success": True, "task_id": task_id}


# ---------------------------------------------------------------------------
# SSE pipeline execution
# ---------------------------------------------------------------------------

@router.post(
    "/tasks/{task_id}/run",
    summary="Run the content pipeline (SSE stream)",
)
async def run_task_pipeline(task_id: str) -> StreamingResponse:
    """Launch the pipeline and stream stage completions as SSE events.

    The frontend can `EventSource` this endpoint to get real-time progress.
    Each SSE event has `event: stage` and `data: <StudioTask JSON>`.
    A final `event: done` is sent when the pipeline finishes.
    """
    task = get_studio_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Studio task '{task_id}' not found")

    async def _event_stream():
        try:
            # Run the pipeline in background — it updates storage at each stage
            pipeline_task = asyncio.create_task(run_studio_pipeline(task_id))

            # Poll for stage updates while pipeline is running
            last_snapshot = ""
            while not pipeline_task.done():
                await asyncio.sleep(0.5)
                current = get_studio_task(task_id)
                if current is None:
                    break
                snapshot = current.model_dump_json()
                if snapshot != last_snapshot:
                    last_snapshot = snapshot
                    yield f"event: stage\ndata: {snapshot}\n\n"

            # Wait for pipeline to finish and get final result
            try:
                final_task = await pipeline_task
                final_json = final_task.model_dump_json()
                yield f"event: done\ndata: {final_json}\n\n"
            except Exception as exc:
                error_data = json.dumps({"error": str(exc)})
                yield f"event: error\ndata: {error_data}\n\n"

        except Exception as exc:
            logger.exception("SSE stream failed for task %s", task_id)
            error_data = json.dumps({"error": str(exc)})
            yield f"event: error\ndata: {error_data}\n\n"

    return StreamingResponse(
        _event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ---------------------------------------------------------------------------
# Article content update (manual edit from frontend editor)
# ---------------------------------------------------------------------------

class ArticleUpdateRequest(BaseModel):
    title: str | None = None
    markdown: str | None = None


@router.patch(
    "/tasks/{task_id}/article",
    response_model=StudioTask,
    summary="Update article content",
)
async def patch_article(task_id: str, body: ArticleUpdateRequest) -> StudioTask:
    task = get_studio_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Studio task '{task_id}' not found")
    if body.title is not None:
        task.article_title = body.title
    if body.markdown is not None:
        task.article_markdown = body.markdown
    task.updated_at = time.time()
    update_studio_task(task)
    return task
