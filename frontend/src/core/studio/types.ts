// ---------------------------------------------------------------------------
// Studio data types — mirrors backend Pydantic models
// ---------------------------------------------------------------------------

export type StageKind =
  | "planning"
  | "research"
  | "writing"
  | "verification"
  | "publishing";

export type StageStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

export type TaskStatus = "queued" | "running" | "completed" | "failed";

/** One pipeline stage within a Studio task. */
export interface StudioStage {
  stage_id: string;
  kind: StageKind;
  label: string;
  status: StageStatus;
  started_at: number | null;
  ended_at: number | null;
  duration_ms: number | null;
  summary: string | null;
  error: string | null;
  data: Record<string, unknown> | null;
}

/** Evidence item from the research stage. */
export interface EvidenceItem {
  query: string;
  title: string;
  url: string;
  site: string;
  snippet: string;
  source_type: string;
  raw_score: number;
  freshness_score: number;
  credibility_score: number;
  final_score: number;
}

/** Topic evaluation report. */
export interface TopicReport {
  topic: string;
  value_score: number;
  angle: string;
  risks: string[];
  recommended_queries: string[];
}

/** Evidence collection from research. */
export interface EvidencePack {
  queries: string[];
  evidence_items: EvidenceItem[];
  summary: string;
  weak_points: string[];
}

/** Fact-check verification report. */
export interface VerificationReport {
  verdict: string;
  supported_claims: VerificationClaim[];
  weak_claims: VerificationClaim[];
  unsupported_claims: VerificationClaim[];
}

export interface VerificationClaim {
  claim: string;
  evidence_urls: string[];
  note: string;
}

/** Top-level Studio task. */
export interface StudioTask {
  task_id: string;
  topic: string;
  target_platform: string;
  status: TaskStatus;
  current_stage: StageKind;

  stages: StudioStage[];

  topic_report: TopicReport | null;
  evidence_pack: EvidencePack | null;
  article_markdown: string | null;
  article_title: string | null;
  verification_report: VerificationReport | null;
  template_id: string | null;

  thread_id: string | null;
  artifact_paths: Record<string, string>;

  created_at: number;
  updated_at: number;
}

/** Request body for POST /api/studio/tasks. */
export interface CreateStudioTaskRequest {
  topic: string;
  target_platform?: string;
  reference_urls?: string[];
  template_id?: string;
  max_results_per_query?: number;
}

/** Request body for PATCH /api/studio/tasks/:id/article. */
export interface UpdateArticleRequest {
  title?: string;
  markdown?: string;
}

// Legacy compat (kept for existing SubtaskCard mapping)
export interface StudioEvent {
  event_id: string;
  role: "dispatcher" | "researcher" | "writer" | "reviewer";
  title: string;
  summary: string;
  detail_markdown: string | null;
  status: "done" | "running" | "pending";
  created_at: number;
}
