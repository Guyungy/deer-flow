export interface StudioTask {
  task_id: string;
  topic: string;
  topic_id?: string | null;
  material_ids: string[];
  target_platform: string;
  agent_name: string;
  status: string;
  current_stage: string;
  brief: string;
  stage_notes: string[];
  created_at: number;
  updated_at: number;
}

export interface CreateStudioTaskRequest {
  topic: string;
  topic_id?: string;
  material_ids?: string[];
  target_platform?: string;
  agent_name?: string;
  brief?: string;
}
