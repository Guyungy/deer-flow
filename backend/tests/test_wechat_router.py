from __future__ import annotations

from pathlib import Path
from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.gateway.routers import wechat
from deerflow.config.paths import Paths


def _make_paths(base_dir: Path) -> Paths:
    return Paths(base_dir=base_dir)


def _build_app() -> FastAPI:
    app = FastAPI()
    app.include_router(wechat.router)
    return app


def test_create_wechat_task_writes_expected_artifacts(tmp_path):
    app = _build_app()
    paths = _make_paths(tmp_path)

    fake_results = [
        {"title": "热点最新进展", "url": "https://news.example.com/latest", "content": "2026年最新动态与官方口径。"},
        {"title": "官方回应汇总", "url": "https://gov.example.com/statement", "content": "2026 官方回应与背景数据。"},
    ]

    async def fake_reference(url: str):
        from app.gateway.wechat_service import EvidenceItem

        return EvidenceItem(
            query="reference_url",
            title="参考链接",
            url=url,
            site="example.com",
            snippet="参考正文，包含2026年背景和影响分析。",
            source_type="reference_url",
            raw_score=0.8,
            freshness_score=0.9,
            credibility_score=0.7,
            final_score=0.79,
        )

    with patch("app.gateway.wechat_service.get_paths", return_value=paths):
        with patch("app.gateway.wechat_service._search_text", side_effect=lambda query, max_results: fake_results):
            with patch("app.gateway.wechat_service._fetch_reference_item", side_effect=fake_reference):
                with TestClient(app) as client:
                    response = client.post(
                        "/api/wechat/tasks",
                        json={
                            "thread_id": "wechat-thread",
                            "topic": "AI Agent 热门趋势",
                            "reference_urls": ["https://example.com/reference"],
                        },
                    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["thread_id"] == "wechat-thread"
    assert payload["verification_report"]["verdict"] == "PASS"
    artifact_names = {item["name"] for item in payload["artifacts"]}
    assert {"topic_report.json", "evidence_pack.json", "article.md", "verification_report.json"} <= artifact_names

    output_dir = paths.sandbox_outputs_dir("wechat-thread") / "wechat_hot_writer"
    assert (output_dir / "topic_report.json").exists()
    assert (output_dir / "evidence_pack.json").exists()
    assert (output_dir / "article.md").exists()
    assert (output_dir / "verification_report.json").exists()


def test_list_artifacts_and_read_article(tmp_path):
    app = _build_app()
    paths = _make_paths(tmp_path)
    output_dir = paths.sandbox_outputs_dir("thread-one") / "wechat_hot_writer"
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "article.md").write_text("# Draft\n\nhello", encoding="utf-8")
    (output_dir / "verification_report.json").write_text(
        '{"verdict":"PARTIAL","supported_claims":[],"weak_claims":[],"unsupported_claims":[]}',
        encoding="utf-8",
    )
    (output_dir / "article_manifest.json").write_text(
        '{"thread_id":"thread-one","topic":"测试话题","platform":"wechat","title":"测试标题","template_id":null,"created_at":1,"updated_at":2,"verification_verdict":"PARTIAL","artifact_paths":{"article":"mnt/user-data/outputs/wechat_hot_writer/article.md"}}',
        encoding="utf-8",
    )

    with patch("app.gateway.wechat_service.get_paths", return_value=paths):
        with TestClient(app) as client:
            artifacts_response = client.get("/api/threads/thread-one/wechat-hot-writer/artifacts")
            article_response = client.get("/api/threads/thread-one/wechat-hot-writer/article")
            verification_response = client.get("/api/threads/thread-one/wechat-hot-writer/verification")

    assert artifacts_response.status_code == 200
    assert article_response.status_code == 200
    assert verification_response.status_code == 200
    assert article_response.json()["title"] == "测试标题"
    assert verification_response.json()["verdict"] == "PARTIAL"


def test_template_crud_and_article_listing(tmp_path):
    app = _build_app()
    paths = _make_paths(tmp_path)

    article_dir = paths.sandbox_outputs_dir("thread-two") / "wechat_hot_writer"
    article_dir.mkdir(parents=True, exist_ok=True)
    (article_dir / "article.md").write_text("# 标题", encoding="utf-8")
    (article_dir / "article_manifest.json").write_text(
        '{"thread_id":"thread-two","topic":"迁移计划","platform":"wechat","title":"迁移计划稿件","template_id":null,"created_at":10,"updated_at":20,"verification_verdict":"PASS","artifact_paths":{"article":"mnt/user-data/outputs/wechat_hot_writer/article.md"}}',
        encoding="utf-8",
    )

    with patch("app.gateway.wechat_service.get_paths", return_value=paths):
        with TestClient(app) as client:
            create_response = client.post(
                "/api/wechat/templates",
                json={"name": "默认模板", "body": "<article>{{content}}</article>", "description": "测试模板"},
            )
            assert create_response.status_code == 200
            template_id = create_response.json()["template_id"]

            list_response = client.get("/api/wechat/templates")
            detail_response = client.get(f"/api/wechat/templates/{template_id}")
            update_response = client.put(
                f"/api/wechat/templates/{template_id}",
                json={"name": "更新模板", "body": "<main>{{content}}</main>", "description": "已更新"},
            )
            articles_response = client.get("/api/wechat/articles")
            article_detail_response = client.get("/api/wechat/articles/thread-two")
            delete_response = client.delete(f"/api/wechat/templates/{template_id}")

    assert list_response.status_code == 200
    assert detail_response.status_code == 200
    assert update_response.status_code == 200
    assert delete_response.status_code == 200
    assert articles_response.status_code == 200
    assert article_detail_response.status_code == 200
    assert articles_response.json()[0]["thread_id"] == "thread-two"
    assert article_detail_response.json()["markdown"] == "# 标题"
