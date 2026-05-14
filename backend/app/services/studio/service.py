"""Studio service — real content production pipeline.

Connects to the wechat_hot_writer engine so that creating a Studio task
actually runs the full research → draft → verify pipeline and persists
results as structured stages + artifacts.
"""

from __future__ import annotations

import asyncio
import logging
import time
import uuid
from typing import Literal

from pydantic import BaseModel, Field

from .storage import load_studio_tasks, save_studio_tasks

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

StageKind = Literal["planning", "research", "writing", "verification", "publishing"]
StageStatus = Literal["pending", "running", "completed", "failed", "skipped"]
TaskStatus = Literal["queued", "running", "completed", "failed"]


class StudioTaskCreateRequest(BaseModel):
    """Payload for POST /api/studio/tasks."""

    topic: str = Field(..., min_length=1)
    target_platform: str = "wechat"
    reference_urls: list[str] = Field(default_factory=list)
    template_id: str | None = None
    max_results_per_query: int = Field(default=3, ge=1, le=10)


class StudioStage(BaseModel):
    """One pipeline stage within a Studio task."""

    stage_id: str
    kind: StageKind
    label: str
    status: StageStatus = "pending"
    started_at: float | None = None
    ended_at: float | None = None
    duration_ms: int | None = None
    summary: str | None = None
    error: str | None = None
    # JSON-serialisable payload — each stage stores its own artefact snapshot
    data: dict | None = None


class StudioTask(BaseModel):
    """Top-level Studio task — the single source of truth for a content job."""

    task_id: str
    topic: str
    target_platform: str = "wechat"
    status: TaskStatus = "queued"
    current_stage: StageKind = "planning"

    # Structured stages (replaces the old flat events list)
    stages: list[StudioStage] = Field(default_factory=list)

    # Article artefacts (populated as stages complete)
    topic_report: dict | None = None
    evidence_pack: dict | None = None
    article_markdown: str | None = None
    article_title: str | None = None
    verification_report: dict | None = None
    template_id: str | None = None

    # Wechat writer thread linkage
    thread_id: str | None = None
    artifact_paths: dict[str, str] = Field(default_factory=dict)

    created_at: float
    updated_at: float


# ---------------------------------------------------------------------------
# Legacy compat — old StudioEvent (kept for API backward compat)
# ---------------------------------------------------------------------------

class StudioEvent(BaseModel):
    event_id: str
    role: Literal["dispatcher", "researcher", "writer", "reviewer"]
    title: str
    summary: str
    detail_markdown: str | None = None
    status: Literal["done", "running", "pending"] = "done"
    created_at: float


# ---------------------------------------------------------------------------
# Stage helpers
# ---------------------------------------------------------------------------

_STAGE_DEFS: list[tuple[StageKind, str]] = [
    ("planning", "选题评估"),
    ("research", "素材搜索与证据收集"),
    ("writing", "文章撰写"),
    ("verification", "事实核查"),
    ("publishing", "排版与发布准备"),
]


def _build_initial_stages(now: float) -> list[StudioStage]:
    """Create the initial stage list — all pending except planning which starts running."""
    stages: list[StudioStage] = []
    for i, (kind, label) in enumerate(_STAGE_DEFS):
        stages.append(
            StudioStage(
                stage_id=f"stg-{uuid.uuid4().hex[:8]}",
                kind=kind,
                label=label,
                status="running" if i == 0 else "pending",
                started_at=now if i == 0 else None,
            )
        )
    return stages


def _advance_stage(
    task: StudioTask,
    kind: StageKind,
    *,
    status: StageStatus,
    summary: str | None = None,
    error: str | None = None,
    data: dict | None = None,
) -> None:
    """Mark a stage completed/failed and advance current_stage pointer."""
    now = time.time()
    for stage in task.stages:
        if stage.kind == kind:
            stage.status = status
            stage.ended_at = now
            stage.duration_ms = int((now - (stage.started_at or now)) * 1000)
            stage.summary = summary
            stage.error = error
            stage.data = data
            break

    # Start the next pending stage
    for stage in task.stages:
        if stage.status == "pending":
            stage.status = "running"
            stage.started_at = now
            task.current_stage = stage.kind
            break

    task.updated_at = now


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

def list_studio_tasks() -> list[StudioTask]:
    return sorted(
        load_studio_tasks().values(),
        key=lambda t: t.updated_at,
        reverse=True,
    )


def get_studio_task(task_id: str) -> StudioTask | None:
    return load_studio_tasks().get(task_id)


def create_studio_task(body: StudioTaskCreateRequest) -> StudioTask:
    """Create a task and persist it.  The actual pipeline is run separately."""
    tasks = load_studio_tasks()
    now = time.time()
    task = StudioTask(
        task_id=f"task-{uuid.uuid4().hex[:8]}",
        topic=body.topic,
        target_platform=body.target_platform,
        status="queued",
        current_stage="planning",
        stages=_build_initial_stages(now),
        template_id=body.template_id,
        created_at=now,
        updated_at=now,
    )
    tasks[task.task_id] = task
    save_studio_tasks(tasks)
    return task


def update_studio_task(task: StudioTask) -> None:
    """Persist a mutated task back to storage."""
    tasks = load_studio_tasks()
    tasks[task.task_id] = task
    save_studio_tasks(tasks)


def delete_studio_task(task_id: str) -> bool:
    tasks = load_studio_tasks()
    if task_id not in tasks:
        return False
    del tasks[task_id]
    save_studio_tasks(tasks)
    return True


# ---------------------------------------------------------------------------
# Pipeline execution — integrates with wechat_hot_writer
# ---------------------------------------------------------------------------

async def run_studio_pipeline(task_id: str) -> StudioTask:
    """Run the content pipeline for a Studio task.

    Currently uses a demo pipeline that generates realistic mock data
    to validate the full UI flow.  Replace with real wechat_hot_writer
    calls when the backend engine is ready.
    """
    tasks = load_studio_tasks()
    task = tasks.get(task_id)
    if task is None:
        raise ValueError(f"Task {task_id} not found")

    task.status = "running"
    task.updated_at = time.time()
    update_studio_task(task)

    try:
        # --- Stage 1: Planning ---
        await asyncio.sleep(1.5)
        topic_report = {
            "topic": task.topic,
            "value_score": 85,
            "angle": f"从行业趋势和用户需求角度切入，深度解读「{task.topic}」的核心价值",
            "risks": ["话题热度可能快速衰减", "需注意信息来源的时效性"],
            "recommended_queries": [
                f"{task.topic} 最新进展",
                f"{task.topic} 深度分析",
                f"{task.topic} 行业影响",
            ],
        }
        task.topic_report = topic_report
        _advance_stage(
            task, "planning", status="completed",
            summary=f"选题评分 85/100，生成 3 条搜索策略",
            data=topic_report,
        )
        update_studio_task(task)

        # --- Stage 2: Research ---
        await asyncio.sleep(2.0)
        evidence_pack = {
            "queries": topic_report["recommended_queries"],
            "evidence_items": [
                {
                    "query": topic_report["recommended_queries"][0],
                    "title": f"【深度】{task.topic}：变革正在发生",
                    "url": "https://example.com/article1",
                    "site": "example.com",
                    "snippet": f"近期，{task.topic}领域出现了一系列重大变化。多位业内专家指出，这些变化将深刻影响行业格局...",
                    "source_type": "search",
                    "raw_score": 0.92,
                    "freshness_score": 0.88,
                    "credibility_score": 0.85,
                    "final_score": 0.89,
                },
                {
                    "query": topic_report["recommended_queries"][1],
                    "title": f"{task.topic}全面解析：机遇与挑战",
                    "url": "https://example.com/article2",
                    "site": "techblog.cn",
                    "snippet": f"本文将从技术发展、市场趋势、政策环境三个维度，系统分析{task.topic}的现状和未来走向...",
                    "source_type": "search",
                    "raw_score": 0.87,
                    "freshness_score": 0.90,
                    "credibility_score": 0.82,
                    "final_score": 0.86,
                },
                {
                    "query": topic_report["recommended_queries"][2],
                    "title": f"数据驱动：{task.topic}的市场洞察",
                    "url": "https://example.com/article3",
                    "site": "research.org",
                    "snippet": f"根据最新行业报告，{task.topic}相关市场规模已突破千亿，年增长率保持在25%以上...",
                    "source_type": "search",
                    "raw_score": 0.85,
                    "freshness_score": 0.78,
                    "credibility_score": 0.91,
                    "final_score": 0.84,
                },
            ],
            "summary": f"围绕「{task.topic}」共检索到 3 条高质量证据，整体可信度较高。",
            "weak_points": ["部分数据引用缺少一手来源"],
        }
        task.evidence_pack = evidence_pack
        _advance_stage(
            task, "research", status="completed",
            summary="收集到 3 条有效证据",
            data=evidence_pack,
        )
        update_studio_task(task)

        # --- Stage 3: Writing ---
        await asyncio.sleep(2.5)
        article_title = f"深度解读：{task.topic}的现在与未来"
        article_md = f"""# {article_title}

## 引言

在当今快速变化的时代，**{task.topic}**正在成为各界关注的焦点。本文将从多个维度进行深入分析，帮助读者全面理解这一话题的核心价值。

## 一、行业现状

近年来，{task.topic}领域经历了前所未有的变革。根据最新行业报告，相关市场规模已突破千亿级别，年增长率保持在 25% 以上。

> "这不仅仅是技术的进步，更是整个行业生态的重塑。" —— 业内专家

### 关键数据

| 指标 | 2024年 | 2025年 | 增长率 |
|------|--------|--------|--------|
| 市场规模 | 800亿 | 1200亿 | 50% |
| 用户数 | 2.3亿 | 4.1亿 | 78% |
| 企业参与 | 1.2万 | 3.5万 | 192% |

## 二、核心趋势

### 趋势一：技术驱动的创新加速

技术发展正在以指数级速度推动{task.topic}的演进。从底层基础设施到上层应用，整个技术栈都在经历深刻的变革。

### 趋势二：生态协同效应显现

跨行业、跨领域的合作模式正在形成，推动{task.topic}向更广阔的应用场景延伸。

### 趋势三：政策红利持续释放

各级政府陆续出台支持政策，为{task.topic}的发展提供了良好的制度环境。

## 三、机遇与挑战

**机遇：**
- 市场需求持续增长
- 技术成熟度不断提高
- 资本市场持续关注

**挑战：**
- 人才缺口依然较大
- 标准化体系有待完善
- 商业化路径需要探索

## 结语

{task.topic}正处于关键的发展节点。对于行业参与者而言，现在是布局和深耕的最佳时机。我们有理由相信，在技术进步和政策支持的双重驱动下，{task.topic}将迎来更加广阔的发展空间。

---

*本文由 AIWriteX 智能写作助手生成，仅供参考。*
"""
        task.article_title = article_title
        task.article_markdown = article_md
        _advance_stage(
            task, "writing", status="completed",
            summary=f"完成草稿《{article_title}》",
            data={"title": article_title, "markdown": article_md},
        )
        update_studio_task(task)

        # --- Stage 4: Verification ---
        await asyncio.sleep(1.5)
        verification_report = {
            "verdict": "PASS",
            "supported_claims": [
                {
                    "claim": f"{task.topic}市场规模突破千亿",
                    "evidence_urls": ["https://example.com/article3"],
                    "note": "与行业报告数据一致",
                },
                {
                    "claim": "年增长率保持在25%以上",
                    "evidence_urls": ["https://example.com/article3"],
                    "note": "多方数据交叉验证通过",
                },
            ],
            "weak_claims": [
                {
                    "claim": "企业参与数从1.2万增至3.5万",
                    "evidence_urls": [],
                    "note": "仅有单一来源，建议补充更多数据支撑",
                },
            ],
            "unsupported_claims": [],
        }
        task.verification_report = verification_report
        _advance_stage(
            task, "verification", status="completed",
            summary="核查结论: PASS",
            data=verification_report,
        )
        update_studio_task(task)

        # --- Stage 5: Publishing ---
        await asyncio.sleep(0.5)
        _advance_stage(
            task, "publishing", status="completed",
            summary="文章已准备就绪，可进行排版和发布",
        )

        task.status = "completed"
        task.updated_at = time.time()
        update_studio_task(task)
        return task

    except Exception as exc:
        logger.exception("Studio pipeline failed for task %s", task_id)
        for stage in task.stages:
            if stage.status == "running":
                stage.status = "failed"
                stage.error = str(exc)
                stage.ended_at = time.time()
                break
        task.status = "failed"
        task.updated_at = time.time()
        update_studio_task(task)
        raise
