"use client";

import {
  CheckCircleIcon,
  CircleDotIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDeleteStudioTask, useStudioTasks } from "@/core/studio/hooks";
import type { TaskStatus } from "@/core/studio/types";
import { cn } from "@/lib/utils";

function TaskStatusDot({ status }: { status: TaskStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircleIcon className="size-3.5 text-green-500" />;
    case "running":
      return <Loader2Icon className="size-3.5 animate-spin text-blue-500" />;
    case "failed":
      return <XCircleIcon className="size-3.5 text-red-500" />;
    default:
      return <CircleDotIcon className="text-muted-foreground size-3.5" />;
  }
}

export function StudioTaskList() {
  const { tasks, isLoading } = useStudioTasks();
  const { mutate: deleteTask } = useDeleteStudioTask();
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-medium">内容任务</span>
        <Button size="icon" variant="ghost" className="size-6" asChild>
          <Link href="/workspace/studio">
            <PlusIcon className="size-3.5" />
          </Link>
        </Button>
      </div>

      {/* Task list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2Icon className="text-muted-foreground size-4 animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-muted-foreground px-3 py-8 text-center text-xs">
            还没有任务
          </div>
        ) : (
          <div className="space-y-0.5 p-1">
            {tasks.map((task) => {
              const isActive = pathname?.includes(task.task_id);
              return (
                <Link
                  key={task.task_id}
                  href={`/workspace/studio/${task.task_id}`}
                  className={cn(
                    "group flex items-start gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50",
                  )}
                >
                  <TaskStatusDot status={task.status} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium">
                      {task.topic}
                    </div>
                    <div className="text-muted-foreground mt-0.5 text-xs">
                      {new Date(task.updated_at * 1000).toLocaleDateString(
                        "zh-CN",
                      )}
                    </div>
                  </div>
                  <button
                    className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteTask(task.task_id);
                    }}
                  >
                    <Trash2Icon className="text-muted-foreground size-3 hover:text-red-500" />
                  </button>
                </Link>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
