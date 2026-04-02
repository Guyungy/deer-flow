from __future__ import annotations

import time
import uuid

from pydantic import BaseModel, Field, model_validator

from deerflow.community.jina_ai.tools import web_fetch_tool

from .storage import load_materials, save_materials


class MaterialSourceRequest(BaseModel):
    source_type: str = Field(description="wechat|web|file|manual")
    title: str | None = None
    url: str | None = None
    author: str | None = None
    content_markdown: str = ""
    content_html: str = ""
    tags: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_payload(self) -> "MaterialSourceRequest":
        if self.title or self.url or self.content_markdown or self.content_html:
            return self
        raise ValueError(
            "At least one of title, url, content_markdown, or content_html is required."
        )


class Material(BaseModel):
    material_id: str
    source_type: str
    title: str
    url: str | None = None
    author: str | None = None
    content_markdown: str = ""
    content_html: str = ""
    tags: list[str] = Field(default_factory=list)
    created_at: float


def _normalize_title(body: MaterialSourceRequest) -> str:
    if body.title and body.title.strip():
        return body.title.strip()

    if body.content_markdown.strip():
        for line in body.content_markdown.splitlines():
            cleaned = line.strip().lstrip("#").strip()
            if cleaned:
                return cleaned[:120]

    if body.url:
        return body.url

    return "Untitled Material"


def add_material_source(body: MaterialSourceRequest) -> Material:
    materials = load_materials()
    material = Material(
        material_id=f"mat-{uuid.uuid4().hex[:8]}",
        source_type=body.source_type,
        title=_normalize_title(body),
        url=body.url,
        author=body.author,
        content_markdown=body.content_markdown,
        content_html=body.content_html,
        tags=body.tags,
        created_at=time.time(),
    )
    materials.insert(0, material)
    save_materials(materials)
    return material


async def collect_material_from_url(
    *,
    url: str,
    source_type: str = "web",
    title: str | None = None,
    tags: list[str] | None = None,
    author: str | None = None,
) -> Material:
    markdown = await web_fetch_tool.ainvoke(url)
    if isinstance(markdown, str) and markdown.startswith("Error:"):
        if "Jina API returned status 401" in markdown:
            raise ValueError(
                "URL 采集失败：当前 JINA_API_KEY 无效或已过期，请更新后再试。"
            )
        raise ValueError(f"URL 采集失败：{markdown.removeprefix('Error: ').strip()}")

    request = MaterialSourceRequest(
        source_type=source_type,
        title=title,
        url=url,
        author=author,
        content_markdown=str(markdown).strip(),
        tags=tags or [],
    )
    return add_material_source(request)


def list_materials() -> list[Material]:
    return load_materials()


def get_material(material_id: str) -> Material | None:
    materials = load_materials()
    return next((material for material in materials if material.material_id == material_id), None)
