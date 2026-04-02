from __future__ import annotations

import re
import time
import uuid

from pydantic import BaseModel, Field

from app.services.hot_radar import HotTopic, list_hot_topics
from app.services.materials import Material, get_material, list_materials

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


class StudioMaterialContext(BaseModel):
    material_id: str
    title: str
    source_type: str
    url: str | None = None
    tags: list[str] = Field(default_factory=list)
    excerpt: str = ""
    relevance_score: int = Field(default=0, ge=0, le=100)
    relation: str = ""


class StudioTaskDetail(StudioTask):
    source_topic: HotTopic | None = None
    referenced_materials: list[StudioMaterialContext] = Field(default_factory=list)
    suggested_materials: list[StudioMaterialContext] = Field(default_factory=list)


def _tokenize(text: str) -> set[str]:
    return {
        token
        for token in re.findall(r"[a-zA-Z0-9\u4e00-\u9fff]+", text.lower())
        if len(token) >= 2
    }


def _material_excerpt(material: Material) -> str:
    content = (material.content_markdown or material.content_html or "").strip()
    return content.replace("\n", " ")[:180]


def _score_material(material: Material, topic: str, source_topic: HotTopic | None) -> int:
    topic_tokens = _tokenize(topic)
    query_tokens = _tokenize(source_topic.query if source_topic else "")
    title_tokens = _tokenize(source_topic.title if source_topic else "")
    material_tokens = _tokenize(
        " ".join(
            [
                material.title,
                " ".join(material.tags),
                material.content_markdown[:400],
                material.content_html[:200],
            ]
        )
    )

    overlap = len(material_tokens & (topic_tokens | query_tokens | title_tokens))
    if overlap == 0:
        return 0

    score = min(95, 42 + overlap * 14 + min(12, len(material.tags) * 3))
    if source_topic and source_topic.platform == "wechat" and material.source_type == "wechat":
        score = min(100, score + 8)
    return score


def _build_material_context(
    material: Material, *, relevance_score: int, relation: str
) -> StudioMaterialContext:
    return StudioMaterialContext(
        material_id=material.material_id,
        title=material.title,
        source_type=material.source_type,
        url=material.url,
        tags=material.tags,
        excerpt=_material_excerpt(material),
        relevance_score=relevance_score,
        relation=relation,
    )


def _find_source_topic(task: StudioTask) -> HotTopic | None:
    topics = list_hot_topics()
    if task.topic_id:
        match = next((item for item in topics if item.topic_id == task.topic_id), None)
        if match:
            return match

    normalized_topic = task.topic.strip().lower()
    return next((item for item in topics if item.title.strip().lower() == normalized_topic), None)


def create_studio_task(body: StudioTaskCreateRequest) -> StudioTask:
    tasks = load_studio_tasks()
    now = time.time()
    stage_notes = ["Topic accepted into the newsroom queue."]
    if body.topic_id:
        stage_notes.append("Hot topic context attached and ready for briefing.")
    if body.material_ids:
        stage_notes.append(f"{len(body.material_ids)} source material(s) linked to the task.")
    stage_notes.append("Waiting for material retrieval and outline generation.")
    task = StudioTask(
        task_id=f"task-{uuid.uuid4().hex[:8]}",
        topic=body.topic,
        topic_id=body.topic_id,
        material_ids=body.material_ids,
        target_platform=body.target_platform,
        agent_name=body.agent_name,
        brief=body.brief or f"Create a content production task for '{body.topic}' and move it through the newsroom workflow.",
        stage_notes=stage_notes,
        created_at=now,
        updated_at=now,
    )
    tasks[task.task_id] = task
    save_studio_tasks(tasks)
    return task


def get_studio_task(task_id: str) -> StudioTask | None:
    return load_studio_tasks().get(task_id)


def get_studio_task_detail(task_id: str) -> StudioTaskDetail | None:
    task = get_studio_task(task_id)
    if task is None:
        return None

    source_topic = _find_source_topic(task)
    referenced_materials: list[StudioMaterialContext] = []
    referenced_ids = set(task.material_ids)

    for material_id in task.material_ids:
        material = get_material(material_id)
        if material is None:
            continue
        referenced_materials.append(
            _build_material_context(
                material,
                relevance_score=100,
                relation="Referenced directly by this studio task.",
            )
        )

    suggestions: list[tuple[int, Material]] = []
    for material in list_materials():
        if material.material_id in referenced_ids:
            continue
        score = _score_material(material, task.topic, source_topic)
        if score <= 0:
            continue
        suggestions.append((score, material))

    suggestions.sort(key=lambda item: item[0], reverse=True)
    if not suggestions:
        suggestions = [
            (36, material)
            for material in list_materials()
            if material.material_id not in referenced_ids
        ]

    suggested_materials = [
        _build_material_context(
            material,
            relevance_score=score,
            relation=(
                "Suggested from the local material library based on topic overlap."
                if score > 36
                else "Suggested as a recent library material for manual review."
            ),
        )
        for score, material in suggestions[:3]
    ]

    return StudioTaskDetail(
        **task.model_dump(),
        source_topic=source_topic,
        referenced_materials=referenced_materials,
        suggested_materials=suggested_materials,
    )


def list_studio_tasks() -> list[StudioTask]:
    return sorted(load_studio_tasks().values(), key=lambda item: item.updated_at, reverse=True)
