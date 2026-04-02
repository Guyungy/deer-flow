---
name: wechat-hot-writer
description: Run a DeerFlow-native hot-topic publishing workflow for WeChat style content, producing structured artifacts for topic evaluation, evidence, article drafting, and verification.
license: Apache-2.0
---

# WeChat Hot Writer

Use this skill when the task is to turn a hot topic into a publishable WeChat-style article with explicit evidence and verification artifacts.

## Workflow

1. `topic_evaluator`
   Produce `topic_report.json` with:
   - `topic`
   - `value_score`
   - `angle`
   - `risks`
   - `recommended_queries`

2. `search_planner`
   Expand the topic into multiple complementary search queries:
   - latest developments
   - official response
   - factual background
   - impact or commentary

3. `writer`
   Consume only the evidence pack, not raw noisy search logs.
   Output `article.md`.

4. `verifier`
   Check whether the main claims in the article are supported by the evidence pack.
   Output `verification_report.json`.

## Artifact Contract

Store artifacts under the thread outputs directory:

- `topic_report.json`
- `evidence_pack.json`
- `article.md`
- `verification_report.json`

## Guardrails

- Do not invent dates, numbers, or quotations.
- Separate facts from commentary.
- Prefer official, institutional, or otherwise traceable sources.
- If the evidence pool is thin, produce a conservative draft and mark the verification verdict as partial or fail.
