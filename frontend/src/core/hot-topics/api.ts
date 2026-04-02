import { getBackendBaseURL } from "@/core/config";

import type { HotTopic } from "./types";

export async function loadHotTopics(): Promise<HotTopic[]> {
  const res = await fetch(`${getBackendBaseURL()}/api/hot-topics`);
  if (!res.ok) {
    throw new Error(`Failed to load hot topics: ${res.statusText}`);
  }
  const data = (await res.json()) as { topics: HotTopic[] };
  return data.topics;
}

export async function refreshHotTopics(): Promise<HotTopic[]> {
  const res = await fetch(`${getBackendBaseURL()}/api/hot-topics/refresh`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Failed to refresh hot topics: ${res.statusText}`);
  }
  const data = (await res.json()) as { topics: HotTopic[] };
  return data.topics;
}
