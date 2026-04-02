from __future__ import annotations

import json
from pathlib import Path
from typing import TYPE_CHECKING

from deerflow.config.paths import get_paths

if TYPE_CHECKING:
    from .service import HotTopic

HOT_RADAR_DIRNAME = "content-suite"
HOT_TOPICS_FILENAME = "hot_topics.json"


def _hot_topics_file() -> Path:
    path = get_paths().base_dir / HOT_RADAR_DIRNAME
    path.mkdir(parents=True, exist_ok=True)
    return path / HOT_TOPICS_FILENAME


def load_hot_topics() -> list["HotTopic"]:
    from .service import HotTopic

    file_path = _hot_topics_file()
    if not file_path.exists():
        return []
    raw = json.loads(file_path.read_text(encoding="utf-8"))
    return [HotTopic(**item) for item in raw]


def save_hot_topics(topics: list["HotTopic"]) -> None:
    file_path = _hot_topics_file()
    payload = [topic.model_dump() for topic in topics]
    file_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
