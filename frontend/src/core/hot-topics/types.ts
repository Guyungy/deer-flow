export interface HotTopic {
  topic_id: string;
  title: string;
  platform: string;
  heat_score: number;
  growth_score: number;
  predict_score: number;
  blackhorse: boolean;
  summary: string;
  recommended_angle: string;
  source_url?: string | null;
  source_site?: string | null;
  query: string;
}
