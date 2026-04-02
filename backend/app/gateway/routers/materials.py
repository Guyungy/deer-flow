from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.materials import (
    Material,
    MaterialSourceRequest,
    add_material_source,
    collect_material_from_url,
    get_material,
    list_materials,
)

router = APIRouter(prefix="/api/materials", tags=["materials"])


class MaterialsResponse(BaseModel):
    materials: list[Material]


@router.get(
    "",
    response_model=MaterialsResponse,
    summary="List materials in the local content library",
)
async def get_materials() -> MaterialsResponse:
    return MaterialsResponse(materials=list_materials())


@router.get(
    "/{material_id}",
    response_model=Material,
    summary="Get a single material from the local content library",
)
async def get_material_detail(material_id: str) -> Material:
    material = get_material(material_id)
    if material is None:
        raise HTTPException(status_code=404, detail=f"Material '{material_id}' not found")
    return material


@router.post(
    "/collect",
    response_model=Material,
    summary="Add a material source into the local content library",
)
async def collect_material(body: MaterialSourceRequest) -> Material:
    if body.url and not body.content_markdown.strip() and not body.content_html.strip():
        try:
            return await collect_material_from_url(
                url=body.url,
                source_type=body.source_type,
                title=body.title,
                tags=body.tags,
                author=body.author,
            )
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500, detail="Failed to collect material from URL."
            ) from exc

    try:
        return add_material_source(body)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
