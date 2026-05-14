import { getBackendBaseURL } from "@/core/config";

import type {
  CreateStudioTaskRequest,
  StudioTask,
  UpdateArticleRequest,
} from "./types";

// ---------------------------------------------------------------------------
// Task CRUD
// ---------------------------------------------------------------------------

export async function loadStudioTasks(): Promise<StudioTask[]> {
  const res = await fetch(`${getBackendBaseURL()}/api/studio/tasks`);
  if (!res.ok) throw new Error(`Failed to load studio tasks: ${res.status}`);
  const body = await res.json();
  return body.tasks;
}

export async function loadStudioTask(taskId: string): Promise<StudioTask> {
  const res = await fetch(`${getBackendBaseURL()}/api/studio/tasks/${taskId}`);
  if (!res.ok)
    throw new Error(`Failed to load studio task ${taskId}: ${res.status}`);
  return res.json();
}

export async function createStudioTask(
  request: CreateStudioTaskRequest,
): Promise<StudioTask> {
  const res = await fetch(`${getBackendBaseURL()}/api/studio/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`Failed to create studio task: ${res.status}`);
  return res.json();
}

export async function deleteStudioTask(taskId: string): Promise<void> {
  const res = await fetch(`${getBackendBaseURL()}/api/studio/tasks/${taskId}`, {
    method: "DELETE",
  });
  if (!res.ok)
    throw new Error(`Failed to delete studio task ${taskId}: ${res.status}`);
}

export async function updateArticle(
  taskId: string,
  body: UpdateArticleRequest,
): Promise<StudioTask> {
  const res = await fetch(
    `${getBackendBaseURL()}/api/studio/tasks/${taskId}/article`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok)
    throw new Error(`Failed to update article for ${taskId}: ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// SSE pipeline execution
// ---------------------------------------------------------------------------

export interface PipelineCallbacks {
  onStageUpdate?: (task: StudioTask) => void;
  onDone?: (task: StudioTask) => void;
  onError?: (error: string) => void;
}

/**
 * Start the content pipeline for a task via SSE.
 * Returns an AbortController so the caller can cancel.
 */
export function runStudioPipeline(
  taskId: string,
  callbacks: PipelineCallbacks,
): AbortController {
  const controller = new AbortController();
  const url = `${getBackendBaseURL()}/api/studio/tasks/${taskId}/run`;

  fetch(url, {
    method: "POST",
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok || !res.body) {
        callbacks.onError?.(`Pipeline request failed: ${res.status}`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let eventType = "";
        let dataLines: string[] = [];

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            dataLines.push(line.slice(6));
          } else if (line === "") {
            // End of one SSE event
            if (dataLines.length > 0) {
              const data = dataLines.join("\n");
              try {
                const parsed = JSON.parse(data);
                if (eventType === "stage") {
                  callbacks.onStageUpdate?.(parsed as StudioTask);
                } else if (eventType === "done") {
                  callbacks.onDone?.(parsed as StudioTask);
                } else if (eventType === "error") {
                  callbacks.onError?.(parsed.error || "Unknown error");
                }
              } catch {
                // Ignore parse errors for partial data
              }
            }
            eventType = "";
            dataLines = [];
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        callbacks.onError?.(String(err));
      }
    });

  return controller;
}
