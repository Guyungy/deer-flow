from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.hot_radar import HotTopic, list_hot_topics, refresh_hot_topics

router = APIRouter(prefix="/api/hot-topics", tags=["hot-topics"])


class HotTopicsResponse(BaseModel):
    topics: list[HotTopic]


@router.get("", response_model=HotTopicsResponse, summary="List hot topics for the newsroom suite")
async def get_hot_topics() -> HotTopicsResponse:
    return HotTopicsResponse(topics=list_hot_topics())


@router.post(
    "/refresh",
    response_model=HotTopicsResponse,
    summary="Refresh hot topics for the newsroom suite",
)
async def post_refresh_hot_topics() -> HotTopicsResponse:
    return HotTopicsResponse(topics=refresh_hot_topics())
