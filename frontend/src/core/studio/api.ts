import { getBackendBaseURL } from "@/core/config";

import type { CreateStudioTaskRequest, StudioTask } from "./types";

export async function loadStudioTasks(): Promise<StudioTask[]> {
  const res = await fetch(`${getBackendBaseURL()}/api/studio/tasks`);
  if (!res.ok) {
    throw new Error(`Failed to load studio tasks: ${res.statusText}`);
  }
  const data = (await res.json()) as { tasks: StudioTask[] };
  return data.tasks;
}

export async function createStudioTask(
  request: CreateStudioTaskRequest,
): Promise<StudioTask> {
  const res = await fetch(`${getBackendBaseURL()}/api/studio/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(
      err.detail ?? `Failed to create studio task: ${res.statusText}`,
    );
  }
  return res.json() as Promise<StudioTask>;
}

export async function loadStudioTask(taskId: string): Promise<StudioTask> {
  const res = await fetch(`${getBackendBaseURL()}/api/studio/tasks/${taskId}`);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(
      err.detail ?? `Failed to load studio task: ${res.statusText}`,
    );
  }
  return res.json() as Promise<StudioTask>;
}
