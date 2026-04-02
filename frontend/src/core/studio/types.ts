import type { HotTopic } from "@/core/hot-topics";

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

export interface StudioMaterialContext {
  material_id: string;
  title: string;
  source_type: string;
  url?: string | null;
  tags: string[];
  excerpt: string;
  relevance_score: number;
  relation: string;
}

export interface StudioTaskDetail extends StudioTask {
  source_topic?: HotTopic | null;
  referenced_materials: StudioMaterialContext[];
  suggested_materials: StudioMaterialContext[];
}

export interface CreateStudioTaskRequest {
  topic: string;
  topic_id?: string;
  material_ids?: string[];
  target_platform?: string;
  agent_name?: string;
  brief?: string;
}
