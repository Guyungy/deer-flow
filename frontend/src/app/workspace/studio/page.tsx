import fs from "fs";
import path from "path";

import { redirect } from "next/navigation";

import { StudioEmptyState } from "./studio-empty-state";

interface StoredStudioTask {
  task_id: string;
}

function readStudioTasks(): StoredStudioTask[] {
  const filePath = path.resolve(
    process.cwd(),
    "..",
    "backend",
    ".deer-flow",
    "content-suite",
    "studio_tasks.json",
  );

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as StoredStudioTask[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default function WorkspaceStudioPage() {
  const tasks = readStudioTasks();

  if (tasks.length > 0) {
    redirect(`/workspace/studio/${tasks[0]!.task_id}`);
  }

  return <StudioEmptyState />;
}
