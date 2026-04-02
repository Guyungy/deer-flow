from __future__ import annotations

import time
import uuid

from pydantic import BaseModel, Field

from .storage import load_studio_tasks, save_studio_tasks


class StudioTaskCreateRequest(BaseModel):
    topic: str
    topic_id: str | None = None
    material_ids: list[str] = Field(default_factory=list)
    target_platform: str = "wechat"
    agent_name: str = "news-room"
    brief: str | None = None


class StudioTask(BaseModel):
    task_id: str
    topic: str
    topic_id: str | None = None
    material_ids: list[str] = Field(default_factory=list)
    target_platform: str = "wechat"
    agent_name: str = "news-room"
    status: str = "queued"
    current_stage: str = "planning"
    brief: str = ""
    stage_notes: list[str] = Field(default_factory=list)
    created_at: float
    updated_at: float


def create_studio_task(body: StudioTaskCreateRequest) -> StudioTask:
    tasks = load_studio_tasks()
    now = time.time()
    task = StudioTask(
        task_id=f"task-{uuid.uuid4().hex[:8]}",
        topic=body.topic,
        topic_id=body.topic_id,
        material_ids=body.material_ids,
        target_platform=body.target_platform,
        agent_name=body.agent_name,
        brief=body.brief or f"Create a content production task for '{body.topic}' and move it through the newsroom workflow.",
        stage_notes=[
            "Topic accepted into the newsroom queue.",
            "Waiting for material retrieval and outline generation.",
        ],
        created_at=now,
        updated_at=now,
    )
    tasks[task.task_id] = task
    save_studio_tasks(tasks)
    return task


def get_studio_task(task_id: str) -> StudioTask | None:
    return load_studio_tasks().get(task_id)


def list_studio_tasks() -> list[StudioTask]:
    return sorted(load_studio_tasks().values(), key=lambda item: item.updated_at, reverse=True)
