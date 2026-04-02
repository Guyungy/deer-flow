from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.gateway.wechat_service import (
    ArticleManifest,
    ArtifactDescriptor,
    TemplateRecord,
    VerificationReport,
    WechatTaskResult,
    create_template,
    delete_template,
    get_template,
    list_articles,
    list_templates,
    list_thread_artifacts,
    read_article,
    read_verification,
    run_wechat_hot_writer,
    update_template,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["wechat"])


class WechatTaskCreateRequest(BaseModel):
    thread_id: str | None = Field(default=None, description="Optional existing DeerFlow thread id")
    topic: str = Field(..., min_length=1, description="Topic to research and draft")
    platform: str = Field(default="wechat", description="Publishing platform, defaults to wechat")
    reference_urls: list[str] = Field(default_factory=list, description="Optional reference URLs to enrich evidence")
    max_results_per_query: int = Field(default=3, ge=1, le=10, description="Max search candidates per query")


class WechatArtifactsResponse(BaseModel):
    thread_id: str
    artifacts: list[ArtifactDescriptor]


class WechatTemplateUpsertRequest(BaseModel):
    name: str
    body: str
    description: str = ""
    platform: str = "wechat"


class WechatArticleDetailResponse(ArticleManifest):
    markdown: str


@router.post("/wechat/tasks", response_model=WechatTaskResult, summary="Create a hot-topic drafting task")
async def create_wechat_task(body: WechatTaskCreateRequest) -> WechatTaskResult:
    try:
        return await run_wechat_hot_writer(
            topic=body.topic,
            platform=body.platform,
            reference_urls=body.reference_urls,
            thread_id=body.thread_id,
            max_results_per_query=body.max_results_per_query,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Wechat task failed")
        raise HTTPException(status_code=500, detail="Failed to create wechat task.") from exc


@router.get("/threads/{thread_id}/wechat-hot-writer/artifacts", response_model=WechatArtifactsResponse)
async def get_wechat_artifacts(thread_id: str) -> WechatArtifactsResponse:
    try:
        return WechatArtifactsResponse(thread_id=thread_id, artifacts=list_thread_artifacts(thread_id))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/threads/{thread_id}/wechat-hot-writer/article", response_model=WechatArticleDetailResponse)
async def get_wechat_article(thread_id: str) -> WechatArticleDetailResponse:
    try:
        return WechatArticleDetailResponse(**read_article(thread_id))
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/threads/{thread_id}/wechat-hot-writer/verification", response_model=VerificationReport)
async def get_wechat_verification(thread_id: str) -> VerificationReport:
    try:
        return read_verification(thread_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/wechat/templates", response_model=list[TemplateRecord])
async def get_templates() -> list[TemplateRecord]:
    return list_templates()


@router.post("/wechat/templates", response_model=TemplateRecord)
async def post_template(body: WechatTemplateUpsertRequest) -> TemplateRecord:
    return create_template(
        name=body.name,
        body=body.body,
        description=body.description,
        platform=body.platform,
    )


@router.get("/wechat/templates/{template_id}", response_model=TemplateRecord)
async def get_template_detail(template_id: str) -> TemplateRecord:
    try:
        return get_template(template_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.put("/wechat/templates/{template_id}", response_model=TemplateRecord)
async def put_template(template_id: str, body: WechatTemplateUpsertRequest) -> TemplateRecord:
    try:
        return update_template(
            template_id,
            name=body.name,
            body=body.body,
            description=body.description,
            platform=body.platform,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/wechat/templates/{template_id}", response_model=dict)
async def remove_template(template_id: str) -> dict:
    try:
        delete_template(template_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"success": True, "template_id": template_id}


@router.get("/wechat/articles", response_model=list[ArticleManifest])
async def get_articles() -> list[ArticleManifest]:
    return list_articles()


@router.get("/wechat/articles/{thread_id}", response_model=WechatArticleDetailResponse)
async def get_article_detail(thread_id: str) -> WechatArticleDetailResponse:
    try:
        return WechatArticleDetailResponse(**read_article(thread_id))
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
