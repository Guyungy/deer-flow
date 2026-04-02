from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.studio import StudioTask, StudioTaskCreateRequest, create_studio_task, get_studio_task, list_studio_tasks

router = APIRouter(prefix="/api/studio/tasks", tags=["studio"])


class StudioTasksResponse(BaseModel):
    tasks: list[StudioTask]


@router.get("", response_model=StudioTasksResponse, summary="List newsroom studio tasks")
async def get_tasks() -> StudioTasksResponse:
    return StudioTasksResponse(tasks=list_studio_tasks())


@router.post("", response_model=StudioTask, summary="Create a newsroom studio task")
async def post_task(body: StudioTaskCreateRequest) -> StudioTask:
    return create_studio_task(body)


@router.get("/{task_id}", response_model=StudioTask, summary="Get a newsroom studio task")
async def get_task(task_id: str) -> StudioTask:
    task = get_studio_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Studio task '{task_id}' not found")
    return task
