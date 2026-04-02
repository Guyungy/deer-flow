from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from pathlib import Path
from urllib.parse import urlparse

from pydantic import BaseModel, Field

from deerflow.community.ddg_search.tools import _search_text
from deerflow.community.jina_ai.tools import web_fetch_tool
from deerflow.config.paths import Paths, get_paths

logger = logging.getLogger(__name__)

WECHAT_OUTPUT_DIRNAME = "wechat_hot_writer"
WECHAT_DATA_DIRNAME = "wechat"
TEMPLATES_DIRNAME = "templates"


class StageRecord(BaseModel):
    stage: str
    status: str
    started_at: float
    ended_at: float | None = None
    duration_ms: int | None = None
    summary: str | None = None
    error: str | None = None


class TopicReport(BaseModel):
    topic: str
    value_score: int
    angle: str
    risks: list[str] = Field(default_factory=list)
    recommended_queries: list[str] = Field(default_factory=list)


class EvidenceItem(BaseModel):
    query: str
    title: str
    url: str
    site: str
    pub_time: str | None = None
    snippet: str
    source_type: str
    raw_score: float = 0.0
    freshness_score: float = 0.0
    credibility_score: float = 0.0
    final_score: float = 0.0


class EvidencePack(BaseModel):
    queries: list[str] = Field(default_factory=list)
    evidence_items: list[EvidenceItem] = Field(default_factory=list)
    summary: str = ""
    weak_points: list[str] = Field(default_factory=list)


class ArticleDraft(BaseModel):
    title: str
    markdown: str
    html: str | None = None
    template_id: str | None = None


class VerificationClaim(BaseModel):
    claim: str
    evidence_urls: list[str] = Field(default_factory=list)
    note: str = ""


class VerificationReport(BaseModel):
    verdict: str
    supported_claims: list[VerificationClaim] = Field(default_factory=list)
    weak_claims: list[VerificationClaim] = Field(default_factory=list)
    unsupported_claims: list[VerificationClaim] = Field(default_factory=list)


class ArtifactDescriptor(BaseModel):
    name: str
    path: str
    size_bytes: int


class TemplateRecord(BaseModel):
    template_id: str
    name: str
    description: str = ""
    platform: str = "wechat"
    body: str
    created_at: float
    updated_at: float


class ArticleManifest(BaseModel):
    thread_id: str
    topic: str
    platform: str
    title: str
    template_id: str | None = None
    created_at: float
    updated_at: float
    verification_verdict: str
    artifact_paths: dict[str, str]


class WechatTaskResult(BaseModel):
    thread_id: str
    topic_report: TopicReport
    evidence_pack: EvidencePack
    article: ArticleDraft
    verification_report: VerificationReport
    artifacts: list[ArtifactDescriptor]
    stages: list[StageRecord]


class StageTracker:
    def __init__(self) -> None:
        self._stages: list[StageRecord] = []

    def start(self, stage: str) -> StageRecord:
        record = StageRecord(stage=stage, status="running", started_at=time.time())
        self._stages.append(record)
        return record

    def complete(self, record: StageRecord, summary: str | None = None) -> None:
        record.status = "completed"
        record.ended_at = time.time()
        record.duration_ms = int((record.ended_at - record.started_at) * 1000)
        record.summary = summary

    def fail(self, record: StageRecord, error: str) -> None:
        record.status = "failed"
        record.ended_at = time.time()
        record.duration_ms = int((record.ended_at - record.started_at) * 1000)
        record.error = error

    @property
    def stages(self) -> list[StageRecord]:
        return self._stages


def build_topic_report(topic: str, platform: str) -> TopicReport:
    risk_pool = [
        "时间敏感信息可能快速过期，需要在正文中明确时间点。",
        "热点信息容易被单一来源带偏，需要至少引用两个不同来源。",
    ]
    angle = f"围绕“{topic}”做一篇适合{platform}发布的热点解释型文章，兼顾最新进展、背景和实际影响。"
    queries = [
        f"{topic} 最新进展",
        f"{topic} 官方回应",
        f"{topic} 背景 数据",
        f"{topic} 行业 影响 解读",
    ]
    score = min(95, 70 + min(len(topic), 10) * 2)
    return TopicReport(
        topic=topic,
        value_score=score,
        angle=angle,
        risks=risk_pool,
        recommended_queries=queries,
    )


def _site_from_url(url: str) -> str:
    host = urlparse(url).netloc.lower()
    return host or "unknown"


def _credibility_for_site(site: str) -> float:
    if site.endswith(".gov.cn") or site.endswith(".gov"):
        return 1.0
    if site.endswith(".edu") or site.endswith(".edu.cn"):
        return 0.9
    if any(token in site for token in ("xinhua", "people", "gov", "cctv")):
        return 0.88
    if site == "unknown":
        return 0.35
    return 0.65


def _freshness_for_text(text: str) -> float:
    current_year = time.gmtime().tm_year
    if str(current_year) in text:
        return 0.9
    if str(current_year - 1) in text:
        return 0.6
    return 0.45


def _build_search_item(query: str, raw: dict) -> EvidenceItem:
    title = raw.get("title", "").strip() or query
    url = raw.get("url", "").strip() or f"https://example.com/search/{uuid.uuid4().hex[:8]}"
    snippet = raw.get("content", "").strip() or f"围绕“{query}”检索到的结果摘要不足，建议补充抓取正文。"
    site = _site_from_url(url)
    raw_score = min(1.0, 0.5 + len(snippet) / 600)
    freshness_score = _freshness_for_text(f"{title} {snippet}")
    credibility_score = _credibility_for_site(site)
    final_score = round(raw_score * 0.4 + freshness_score * 0.25 + credibility_score * 0.35, 4)
    return EvidenceItem(
        query=query,
        title=title,
        url=url,
        site=site,
        snippet=snippet,
        source_type="web_search",
        raw_score=round(raw_score, 4),
        freshness_score=round(freshness_score, 4),
        credibility_score=round(credibility_score, 4),
        final_score=final_score,
    )


async def _fetch_reference_item(url: str) -> EvidenceItem:
    fetched = await web_fetch_tool.ainvoke(url)
    if isinstance(fetched, str) and fetched.startswith("Error:"):
        snippet = f"参考链接抓取失败：{fetched}"
    else:
        snippet = str(fetched).strip()[:500]
    site = _site_from_url(url)
    credibility_score = _credibility_for_site(site)
    freshness_score = _freshness_for_text(snippet)
    raw_score = min(1.0, 0.55 + len(snippet) / 1000)
    final_score = round(raw_score * 0.35 + freshness_score * 0.2 + credibility_score * 0.45, 4)
    return EvidenceItem(
        query="reference_url",
        title=f"参考链接：{site}",
        url=url,
        site=site,
        snippet=snippet or "未能提取正文。",
        source_type="reference_url",
        raw_score=round(raw_score, 4),
        freshness_score=round(freshness_score, 4),
        credibility_score=round(credibility_score, 4),
        final_score=final_score,
    )


async def _search_query(query: str, max_results: int, tracker: StageTracker, index: int) -> list[EvidenceItem]:
    stage = tracker.start(f"SEARCH_QUERY_{index}")
    try:
        results = await asyncio.to_thread(_search_text, query, max_results)
        items = [_build_search_item(query, raw) for raw in results]
        tracker.complete(stage, f"Collected {len(items)} candidate results for query '{query}'.")
        return items
    except Exception as exc:
        logger.exception("Search query failed: %s", query)
        tracker.fail(stage, str(exc))
        return []


def _dedupe_evidence(items: list[EvidenceItem]) -> list[EvidenceItem]:
    deduped: dict[tuple[str, str], EvidenceItem] = {}
    for item in items:
        key = (item.url.lower().strip(), item.title.lower().strip())
        existing = deduped.get(key)
        if existing is None or item.final_score > existing.final_score:
            deduped[key] = item
    return sorted(deduped.values(), key=lambda value: value.final_score, reverse=True)


def build_evidence_summary(items: list[EvidenceItem], topic: str) -> str:
    if not items:
        return f"关于“{topic}”暂未拿到足够的实时证据，建议保守写作并明确不确定性。"
    top_titles = "；".join(item.title for item in items[:3])
    return f"围绕“{topic}”的证据主要集中在：{top_titles}。写作时优先引用高可信来源，并区分事实与观点。"


def build_article(topic_report: TopicReport, evidence_pack: EvidencePack) -> ArticleDraft:
    lead = evidence_pack.evidence_items[:3]
    title = f"{topic_report.topic}：最新进展、关键信息与影响梳理"
    lead_section = "\n".join(
        f"- {item.title}（{item.site}）：{item.snippet[:120]} [来源]({item.url})" for item in lead
    )
    if not lead_section:
        lead_section = "- 当前证据不足，以下内容以背景解释和保守判断为主。"

    markdown = "\n".join(
        [
            f"# {title}",
            "",
            "## 为什么值得关注",
            topic_report.angle,
            "",
            "## 当前可确认的信息",
            lead_section,
            "",
            "## 背景与影响",
            evidence_pack.summary,
            "",
            "## 写作提示",
            "- 本文优先采用已检索到的公开证据，不对未证实信息做强结论。",
            "- 如后续出现官方更新，建议刷新证据池后再发布最终稿。",
        ]
    )
    return ArticleDraft(title=title, markdown=markdown)


def build_verification_report(article: ArticleDraft, evidence_pack: EvidencePack) -> VerificationReport:
    claims = [
        f"{article.title}适合以解释型热点稿发布。",
        evidence_pack.summary,
    ]
    top_urls = [item.url for item in evidence_pack.evidence_items[:3]]
    if len(evidence_pack.evidence_items) >= 3:
        supported = [
            VerificationClaim(claim=claim, evidence_urls=top_urls, note="可由证据包中的高分来源支撑。")
            for claim in claims
        ]
        return VerificationReport(verdict="PASS", supported_claims=supported)
    if evidence_pack.evidence_items:
        weak = [
            VerificationClaim(
                claim=claim,
                evidence_urls=top_urls,
                note="证据数量有限，建议发布前再补充一轮搜索。",
            )
            for claim in claims
        ]
        return VerificationReport(verdict="PARTIAL", weak_claims=weak)
    unsupported = [
        VerificationClaim(
            claim=claim,
            note="当前没有足够证据支持该说法。",
        )
        for claim in claims
    ]
    return VerificationReport(verdict="FAIL", unsupported_claims=unsupported)


def _wechat_root(paths: Paths) -> Path:
    return paths.base_dir / WECHAT_DATA_DIRNAME


def _templates_dir(paths: Paths) -> Path:
    return _wechat_root(paths) / TEMPLATES_DIRNAME


def _output_dir(paths: Paths, thread_id: str) -> Path:
    return paths.sandbox_outputs_dir(thread_id) / WECHAT_OUTPUT_DIRNAME


def _artifact_virtual_path(thread_id: str, filename: str) -> str:
    return f"mnt/user-data/outputs/{WECHAT_OUTPUT_DIRNAME}/{filename}"


def _write_json(path: Path, data: BaseModel | dict) -> None:
    payload = data.model_dump() if isinstance(data, BaseModel) else data
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _artifact_descriptors(thread_id: str, output_dir: Path) -> list[ArtifactDescriptor]:
    descriptors: list[ArtifactDescriptor] = []
    for item in sorted(output_dir.iterdir()):
        if item.is_file():
            descriptors.append(
                ArtifactDescriptor(
                    name=item.name,
                    path=_artifact_virtual_path(thread_id, item.name),
                    size_bytes=item.stat().st_size,
                )
            )
    return descriptors


async def run_wechat_hot_writer(
    topic: str,
    platform: str = "wechat",
    reference_urls: list[str] | None = None,
    thread_id: str | None = None,
    max_results_per_query: int = 3,
    paths: Paths | None = None,
) -> WechatTaskResult:
    path_manager = paths or get_paths()
    actual_thread_id = thread_id or f"wechat-{uuid.uuid4().hex[:8]}"
    path_manager.ensure_thread_dirs(actual_thread_id)
    output_dir = _output_dir(path_manager, actual_thread_id)
    output_dir.mkdir(parents=True, exist_ok=True)

    tracker = StageTracker()

    eval_stage = tracker.start("TOPIC_EVAL")
    topic_report = build_topic_report(topic, platform)
    tracker.complete(eval_stage, f"Generated topic brief with {len(topic_report.recommended_queries)} recommended queries.")

    plan_stage = tracker.start("SEARCH_PLAN")
    queries = topic_report.recommended_queries
    tracker.complete(plan_stage, f"Prepared {len(queries)} search queries.")

    search_tasks = [_search_query(query, max_results_per_query, tracker, index + 1) for index, query in enumerate(queries)]
    search_results = await asyncio.gather(*search_tasks)
    evidence_items = [item for batch in search_results for item in batch]

    reference_urls = reference_urls or []
    if reference_urls:
        ref_stage = tracker.start("REFERENCE_EXTRACTION")
        ref_results = await asyncio.gather(*[_fetch_reference_item(url) for url in reference_urls], return_exceptions=True)
        for result in ref_results:
            if isinstance(result, Exception):
                logger.exception("Reference extraction failed")
            else:
                evidence_items.append(result)
        tracker.complete(ref_stage, f"Processed {len(reference_urls)} reference URLs.")

    rank_stage = tracker.start("EVIDENCE_RANK")
    ranked_items = _dedupe_evidence(evidence_items)[:8]
    weak_points: list[str] = []
    if not ranked_items:
        weak_points.append("未检索到可靠结果，建议人工补充来源或降低断言强度。")
    elif len(ranked_items) < 3:
        weak_points.append("证据池偏小，适合先生成保守版草稿。")
    evidence_pack = EvidencePack(
        queries=queries,
        evidence_items=ranked_items,
        summary=build_evidence_summary(ranked_items, topic),
        weak_points=weak_points,
    )
    tracker.complete(rank_stage, f"Ranked {len(ranked_items)} evidence items.")

    writing_stage = tracker.start("WRITING")
    article = build_article(topic_report, evidence_pack)
    tracker.complete(writing_stage, f"Drafted article '{article.title}'.")

    verify_stage = tracker.start("VERIFY")
    verification_report = build_verification_report(article, evidence_pack)
    tracker.complete(verify_stage, f"Verification verdict: {verification_report.verdict}.")

    manifest = ArticleManifest(
        thread_id=actual_thread_id,
        topic=topic,
        platform=platform,
        title=article.title,
        created_at=time.time(),
        updated_at=time.time(),
        verification_verdict=verification_report.verdict,
        artifact_paths={
            "topic_report": _artifact_virtual_path(actual_thread_id, "topic_report.json"),
            "evidence_pack": _artifact_virtual_path(actual_thread_id, "evidence_pack.json"),
            "article": _artifact_virtual_path(actual_thread_id, "article.md"),
            "verification_report": _artifact_virtual_path(actual_thread_id, "verification_report.json"),
            "run_status": _artifact_virtual_path(actual_thread_id, "run_status.json"),
            "article_manifest": _artifact_virtual_path(actual_thread_id, "article_manifest.json"),
        },
    )

    _write_json(output_dir / "topic_report.json", topic_report)
    _write_json(output_dir / "evidence_pack.json", evidence_pack)
    (output_dir / "article.md").write_text(article.markdown, encoding="utf-8")
    _write_json(output_dir / "verification_report.json", verification_report)
    _write_json(output_dir / "run_status.json", {"thread_id": actual_thread_id, "stages": [stage.model_dump() for stage in tracker.stages]})
    _write_json(output_dir / "article_manifest.json", manifest)

    return WechatTaskResult(
        thread_id=actual_thread_id,
        topic_report=topic_report,
        evidence_pack=evidence_pack,
        article=article,
        verification_report=verification_report,
        artifacts=_artifact_descriptors(actual_thread_id, output_dir),
        stages=tracker.stages,
    )


def list_thread_artifacts(thread_id: str, paths: Paths | None = None) -> list[ArtifactDescriptor]:
    path_manager = paths or get_paths()
    output_dir = _output_dir(path_manager, thread_id)
    if not output_dir.exists():
        return []
    return _artifact_descriptors(thread_id, output_dir)


def read_article(thread_id: str, paths: Paths | None = None) -> dict:
    path_manager = paths or get_paths()
    output_dir = _output_dir(path_manager, thread_id)
    manifest_path = output_dir / "article_manifest.json"
    article_path = output_dir / "article.md"
    if not manifest_path.exists() or not article_path.exists():
        raise FileNotFoundError(f"No article draft found for thread {thread_id}")
    manifest = ArticleManifest(**_read_json(manifest_path))
    return {
        **manifest.model_dump(),
        "markdown": article_path.read_text(encoding="utf-8"),
    }


def read_verification(thread_id: str, paths: Paths | None = None) -> VerificationReport:
    path_manager = paths or get_paths()
    report_path = _output_dir(path_manager, thread_id) / "verification_report.json"
    if not report_path.exists():
        raise FileNotFoundError(f"No verification report found for thread {thread_id}")
    return VerificationReport(**_read_json(report_path))


def list_articles(paths: Paths | None = None) -> list[ArticleManifest]:
    path_manager = paths or get_paths()
    threads_root = path_manager.base_dir / "threads"
    if not threads_root.exists():
        return []
    manifests: list[ArticleManifest] = []
    for manifest_path in threads_root.glob(f"*/user-data/outputs/{WECHAT_OUTPUT_DIRNAME}/article_manifest.json"):
        manifests.append(ArticleManifest(**_read_json(manifest_path)))
    return sorted(manifests, key=lambda manifest: manifest.updated_at, reverse=True)


def create_template(name: str, body: str, description: str = "", platform: str = "wechat", paths: Paths | None = None) -> TemplateRecord:
    path_manager = paths or get_paths()
    templates_dir = _templates_dir(path_manager)
    templates_dir.mkdir(parents=True, exist_ok=True)
    timestamp = time.time()
    template = TemplateRecord(
        template_id=f"tpl-{uuid.uuid4().hex[:8]}",
        name=name,
        description=description,
        platform=platform,
        body=body,
        created_at=timestamp,
        updated_at=timestamp,
    )
    _write_json(templates_dir / f"{template.template_id}.json", template)
    return template


def list_templates(paths: Paths | None = None) -> list[TemplateRecord]:
    path_manager = paths or get_paths()
    templates_dir = _templates_dir(path_manager)
    if not templates_dir.exists():
        return []
    items = [TemplateRecord(**_read_json(path)) for path in templates_dir.glob("*.json")]
    return sorted(items, key=lambda record: record.updated_at, reverse=True)


def get_template(template_id: str, paths: Paths | None = None) -> TemplateRecord:
    path_manager = paths or get_paths()
    template_path = _templates_dir(path_manager) / f"{template_id}.json"
    if not template_path.exists():
        raise FileNotFoundError(f"Template '{template_id}' not found")
    return TemplateRecord(**_read_json(template_path))


def update_template(template_id: str, *, name: str, body: str, description: str = "", platform: str = "wechat", paths: Paths | None = None) -> TemplateRecord:
    current = get_template(template_id, paths=paths)
    updated = current.model_copy(
        update={
            "name": name,
            "body": body,
            "description": description,
            "platform": platform,
            "updated_at": time.time(),
        }
    )
    path_manager = paths or get_paths()
    template_path = _templates_dir(path_manager) / f"{template_id}.json"
    _write_json(template_path, updated)
    return updated


def delete_template(template_id: str, paths: Paths | None = None) -> None:
    path_manager = paths or get_paths()
    template_path = _templates_dir(path_manager) / f"{template_id}.json"
    if not template_path.exists():
        raise FileNotFoundError(f"Template '{template_id}' not found")
    template_path.unlink()
