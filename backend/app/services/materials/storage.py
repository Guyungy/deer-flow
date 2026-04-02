from __future__ import annotations

import json
from pathlib import Path
from typing import TYPE_CHECKING

from deerflow.config.paths import get_paths

if TYPE_CHECKING:
    from .service import Material

MATERIALS_DIRNAME = "content-suite"
MATERIALS_FILENAME = "materials.json"


def _materials_file() -> Path:
    path = get_paths().base_dir / MATERIALS_DIRNAME
    path.mkdir(parents=True, exist_ok=True)
    return path / MATERIALS_FILENAME


def load_materials() -> list["Material"]:
    from .service import Material

    file_path = _materials_file()
    if not file_path.exists():
        return []
    raw = json.loads(file_path.read_text(encoding="utf-8"))
    return [Material(**item) for item in raw]


def save_materials(materials: list["Material"]) -> None:
    file_path = _materials_file()
    payload = [material.model_dump() for material in materials]
    file_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
