from __future__ import annotations

import re
from urllib.parse import urlparse

from pydantic import BaseModel, Field

from deerflow.community.ddg_search.tools import _search_text

from .storage import load_hot_topics, save_hot_topics

TREND_QUERIES = [
    ("AI Agent productization", "cross-platform"),
    ("WeChat content automation", "wechat"),
    ("AI writing tools workflow", "content"),
    ("private knowledge base RAG", "knowledge-base"),
]

BLOCKED_TITLE_TOKENS = {
    "adult",
    "porn",
    "casino",
    "bet",
    "gambling",
    "doublefly",
}


class HotTopic(BaseModel):
    topic_id: str
    title: str
    platform: str
    heat_score: int = Field(ge=0, le=100)
    growth_score: int = Field(ge=0, le=100)
    predict_score: int = Field(ge=0, le=100)
    blackhorse: bool = False
    summary: str = ""
    recommended_angle: str = ""
    source_url: str | None = None
    source_site: str | None = None
    query: str = ""


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", text.strip()).strip("-").lower()
    return slug or "topic"


def _site_name(url: str | None) -> str | None:
    if not url:
        return None
    return urlparse(url).netloc.lower() or None


def _score_result(index: int, title: str, snippet: str) -> tuple[int, int, int]:
    title_len_bonus = min(12, len(title) // 6)
    snippet_bonus = min(18, len(snippet) // 20)
    heat = max(55, 88 - index * 7 + title_len_bonus)
    growth = max(50, 84 - index * 6 + snippet_bonus // 2)
    predict = min(97, (heat + growth) // 2 + 6)
    return heat, growth, predict


def _recommended_angle(title: str, query: str) -> str:
    return (
        f'Use "{title}" as an entry point to explain the product opportunity, '
        f'workflow shift, and practical implementation path behind "{query}".'
    )


def _is_quality_result(title: str, snippet: str) -> bool:
    haystack = f"{title} {snippet}".lower()
    if any(token in haystack for token in BLOCKED_TITLE_TOKENS):
        return False
    return len(title.strip()) >= 8


def refresh_hot_topics(max_results_per_query: int = 3) -> list[HotTopic]:
    topics: list[HotTopic] = []
    seen_urls: set[str] = set()

    for query, platform in TREND_QUERIES:
        results = _search_text(query=query, max_results=max_results_per_query)
        for index, item in enumerate(results):
            title = (item.get("title") or query).strip()
            url = (item.get("url") or "").strip() or None
            snippet = (item.get("content") or "").strip()

            if not _is_quality_result(title, snippet):
                continue
            if url and url in seen_urls:
                continue
            if url:
                seen_urls.add(url)

            heat, growth, predict = _score_result(index, title, snippet)
            topics.append(
                HotTopic(
                    topic_id=f"topic-{_slugify(title)}",
                    title=title,
                    platform=platform,
                    heat_score=heat,
                    growth_score=growth,
                    predict_score=predict,
                    blackhorse=predict >= 80 and heat < 80,
                    summary=snippet[:240] or f'Candidate trend captured for "{query}".',
                    recommended_angle=_recommended_angle(title, query),
                    source_url=url,
                    source_site=_site_name(url),
                    query=query,
                )
            )

    deduped = sorted(topics, key=lambda item: item.predict_score, reverse=True)[:12]
    save_hot_topics(deduped)
    return deduped


def list_hot_topics() -> list[HotTopic]:
    topics = load_hot_topics()
    if topics:
        return topics
    return refresh_hot_topics()
