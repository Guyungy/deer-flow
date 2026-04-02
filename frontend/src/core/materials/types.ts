export interface Material {
  material_id: string;
  source_type: string;
  title: string;
  url?: string | null;
  author?: string | null;
  content_markdown: string;
  content_html: string;
  tags: string[];
  created_at: number;
}

export interface CreateMaterialRequest {
  source_type: string;
  title?: string;
  url?: string;
  author?: string;
  content_markdown?: string;
  content_html?: string;
  tags?: string[];
}
