from __future__ import annotations

import time
import uuid
from typing import Literal

from pydantic import BaseModel, Field

from .storage import load_studio_tasks, save_studio_tasks


class StudioTaskCreateRequest(BaseModel):
    topic: str
    target_platform: str = "wechat"


class StudioEvent(BaseModel):
    event_id: str
    role: Literal["dispatcher", "researcher", "writer", "reviewer"]
    title: str
    summary: str
    detail_markdown: str | None = None
    status: Literal["done", "running", "pending"] = "done"
    created_at: float


class StudioTask(BaseModel):
    task_id: str
    topic: str
    target_platform: str = "wechat"
    status: Literal["queued", "running"] = "queued"
    current_stage: Literal["planning", "research", "drafting", "review"] = "planning"
    assignee: Literal["researcher", "writer", "reviewer"] = "researcher"
    summary: str
    events: list[StudioEvent] = Field(default_factory=list)
    created_at: float
    updated_at: float


def _new_event(
    *,
    role: Literal["dispatcher", "researcher", "writer", "reviewer"],
    title: str,
    summary: str,
    created_at: float,
    detail_markdown: str | None = None,
    status: Literal["done", "running", "pending"] = "done",
) -> StudioEvent:
    return StudioEvent(
        event_id=f"evt-{uuid.uuid4().hex[:8]}",
        role=role,
        title=title,
        summary=summary,
        detail_markdown=detail_markdown,
        status=status,
        created_at=created_at,
    )


def _initial_events(topic: str, created_at: float) -> list[StudioEvent]:
    outline = "\n".join(
        [
            f"# {topic}",
            "",
            "1. 用一个最新现象引出主题",
            "2. 解释这件事为什么值得关注",
            "3. 给出 2-3 个支撑判断的案例或线索",
            "4. 收束到公众号读者可执行的建议",
        ]
    )
    return [
        _new_event(
            role="dispatcher",
            title="任务已进入 Studio",
            summary=f"内容任务《{topic}》已创建，接下来会按研究、写作、审校顺序推进。",
            created_at=created_at,
        ),
        _new_event(
            role="researcher",
            title="Researcher 正在整理背景",
            summary="先补齐主题背景和文章切入点，让 Writer 接手时不是空白开始。",
            detail_markdown="- 需要确认主题背景\n- 需要补充 2-3 条支撑线索\n- 需要给出一个明确切入角度",
            created_at=created_at + 1,
            status="running",
        ),
        _new_event(
            role="writer",
            title="Writer 已准备好大纲位",
            summary="Writer 会在拿到背景后，先产出一版可讨论的大纲。",
            detail_markdown=outline,
            created_at=created_at + 2,
            status="pending",
        ),
        _new_event(
            role="reviewer",
            title="Reviewer 等待初稿",
            summary="审校会在初稿出来后，重点看表达风险、事实风险和可发布性。",
            created_at=created_at + 3,
            status="pending",
        ),
    ]


def _demo_task() -> StudioTask:
    now = time.time()
    return StudioTask(
        task_id="task-demo",
        topic="AI Agent 产品化到底怎么落地",
        target_platform="wechat",
        status="running",
        current_stage="research",
        assignee="researcher",
        summary="这是一条示例任务，用来展示 Studio 应该像对话线程一样展开，而不是像后台表单。",
        events=_initial_events("AI Agent 产品化到底怎么落地", now),
        created_at=now,
        updated_at=now,
    )


def ensure_demo_task() -> None:
    tasks = load_studio_tasks()
    if tasks:
        return
    demo = _demo_task()
    tasks[demo.task_id] = demo
    save_studio_tasks(tasks)


def list_studio_tasks() -> list[StudioTask]:
    ensure_demo_task()
    return sorted(load_studio_tasks().values(), key=lambda item: item.updated_at, reverse=True)


def get_studio_task(task_id: str) -> StudioTask | None:
    ensure_demo_task()
    return load_studio_tasks().get(task_id)


def create_studio_task(body: StudioTaskCreateRequest) -> StudioTask:
    tasks = load_studio_tasks()
    now = time.time()
    task = StudioTask(
        task_id=f"task-{uuid.uuid4().hex[:8]}",
        topic=body.topic,
        target_platform=body.target_platform,
        status="queued",
        current_stage="planning",
        assignee="researcher",
        summary=f"围绕《{body.topic}》启动一个新的内容任务线程。",
        events=_initial_events(body.topic, now),
        created_at=now,
        updated_at=now,
    )
    tasks[task.task_id] = task
    save_studio_tasks(tasks)
    return task
