export interface StudioEvent {
  event_id: string;
  role: "dispatcher" | "researcher" | "writer" | "reviewer";
  title: string;
  summary: string;
  detail_markdown?: string | null;
  status: "done" | "running" | "pending";
  created_at: number;
}

export interface StudioTask {
  task_id: string;
  topic: string;
  target_platform: string;
  status: "queued" | "running";
  current_stage: "planning" | "research" | "drafting" | "review";
  assignee: "researcher" | "writer" | "reviewer";
  summary: string;
  events: StudioEvent[];
  created_at: number;
  updated_at: number;
}

export interface CreateStudioTaskRequest {
  topic: string;
  target_platform?: string;
}
