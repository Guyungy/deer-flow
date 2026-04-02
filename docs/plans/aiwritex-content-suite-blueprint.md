# AIWriteX Content Suite Blueprint

## Goal

Build a DeerFlow-based vertical content production suite for:

- hot topic discovery
- private material library ingestion and retrieval
- multi-agent writing workflows
- WeChat article drafting and publishing
- future multi-platform expansion

This plan is intentionally grounded in the current DeerFlow codebase instead of proposing a greenfield rewrite.

## Why DeerFlow

The current repository already provides reusable foundations:

- custom agent management via `backend/app/gateway/routers/agents.py`
- lead-agent orchestration via `backend/packages/harness/deerflow/agents/lead_agent/agent.py`
- thread, state, artifact, and run management via `backend/app/gateway/routers/threads.py`
- WeChat hot-topic drafting prototype via `backend/app/gateway/wechat_service.py`
- frontend application shell via `frontend/src/app`

The product direction is therefore:

1. keep DeerFlow as the agent runtime and workspace shell
2. add domain-specific services, routers, and pages
3. evolve the current WeChat drafting prototype into a full content pipeline

## Product Scope

### Phase 1

Minimum useful product:

- hot topic center
- material library ingestion and listing
- studio task shell for article generation
- DeerFlow-compatible news-room expansion pages

### Phase 2

Agentized workflow:

- hot-radar agent
- research agent
- topic-miner agent
- writer agent
- review agent
- layout agent

### Phase 3

Publishing system:

- WeChat account management
- draft publishing
- scheduled publishing
- publish history and retry

### Phase 4

Commercial-grade enhancements:

- trend prediction
- batch generation
- automation
- team permissions
- platform expansion

## Architecture

### Backend

Add service-oriented business modules under `backend/app/services/`:

- `hot_radar/`
- `materials/`
- `studio/`
- later: `publishers/`, `accounts/`

Expose them through Gateway routers:

- `backend/app/gateway/routers/hot_topics.py`
- `backend/app/gateway/routers/materials.py`
- `backend/app/gateway/routers/studio.py`

### Frontend

Add task-oriented application areas under `frontend/src/app/`:

- `hot-topics`
- `materials`
- `studio`

The current chat workspace remains available, but should become the advanced mode rather than the primary product surface.

## Data Model Direction

Recommended first-class entities:

- `topics`
- `material_sources`
- `materials`
- `material_chunks`
- `draft_tasks`
- `draft_versions`
- later: `publish_accounts`, `publish_jobs`

## Agent Strategy

Do not introduce a second orchestration framework for the main path yet.

Instead:

1. use DeerFlow custom agents as the runtime abstraction
2. represent newsroom roles as dedicated agents or subagents
3. reuse DeerFlow middleware, thread state, artifacts, and skills

## Phase 1 Deliverables

### Backend Deliverables

- hot topic listing endpoint
- material source ingestion endpoint
- material listing endpoint
- studio task creation endpoint
- studio task detail endpoint

### Frontend Deliverables

- hot topic page shell
- material library page shell
- studio page shell

### Non-Goals For Phase 1

- real WeChat official-account publishing
- full vector search
- complex trend prediction
- cross-platform account federation

## File Map

### New Backend Files

- `backend/app/services/hot_radar/__init__.py`
- `backend/app/services/hot_radar/service.py`
- `backend/app/services/materials/__init__.py`
- `backend/app/services/materials/service.py`
- `backend/app/services/studio/__init__.py`
- `backend/app/services/studio/service.py`
- `backend/app/gateway/routers/hot_topics.py`
- `backend/app/gateway/routers/materials.py`
- `backend/app/gateway/routers/studio.py`

### New Frontend Files

- `frontend/src/app/hot-topics/page.tsx`
- `frontend/src/app/materials/page.tsx`
- `frontend/src/app/studio/page.tsx`

## Execution Order

1. scaffold backend service and router structure
2. scaffold frontend route structure
3. connect frontend pages to backend query hooks
4. replace placeholder data with persisted storage
5. introduce newsroom-specific custom agents

## Current Execution Status

Started:

- blueprint recorded in repository
- Phase 1 backend skeleton in progress
- Phase 1 frontend shells in progress

Completed:

- Gateway routers added for hot topics, materials, and studio tasks
- frontend route shells connected to live Gateway APIs
- materials and studio task data persisted locally under `backend/.deer-flow/content-suite/`
- root app provider updated so non-workspace pages can use React Query
