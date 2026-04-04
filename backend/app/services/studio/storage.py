from __future__ import annotations

import json
from pathlib import Path
from typing import TYPE_CHECKING

from deerflow.config.paths import get_paths

if TYPE_CHECKING:
    from .service import StudioTask

STUDIO_DIRNAME = "content-suite"
STUDIO_FILENAME = "studio_tasks.json"


def _studio_file() -> Path:
    path = get_paths().base_dir / STUDIO_DIRNAME
    path.mkdir(parents=True, exist_ok=True)
    return path / STUDIO_FILENAME


def load_studio_tasks() -> dict[str, "StudioTask"]:
    from .service import StudioTask

    file_path = _studio_file()
    if not file_path.exists():
        return {}
    raw = json.loads(file_path.read_text(encoding="utf-8"))
    return {item["task_id"]: StudioTask(**item) for item in raw}


def save_studio_tasks(tasks: dict[str, "StudioTask"]) -> None:
    file_path = _studio_file()
    payload = [task.model_dump() for task in tasks.values()]
    file_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
