"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  WorkspaceBody,
  WorkspaceContainer,
  WorkspaceHeader,
} from "@/components/workspace/workspace-container";
import { MarkdownContent } from "@/components/workspace/messages/markdown-content";
import { SubtaskCard } from "@/components/workspace/messages/subtask-card";
import { useRehypeSplitWordsIntoSpans } from "@/core/rehype";
import { useCreateStudioTask, useStudioTask, useStudioTasks } from "@/core/studio";
import { SubtasksProvider } from "@/core/tasks/context";
import type { Subtask } from "@/core/tasks/types";

const roleLabel = {
  dispatcher: "Dispatcher",
  researcher: "Researcher",
  writer: "Writer",
  reviewer: "Reviewer",
} as const;

export default function WorkspaceStudioTaskPage() {
  const params = useParams<{ task_id: string }>();
  return <WorkspaceStudioTaskClient taskId={params.task_id} />;
}

function WorkspaceStudioTaskClient({ taskId }: { taskId: string }) {
  const router = useRouter();
  const { task, isLoading, error } = useStudioTask(taskId);
  const { tasks } = useStudioTasks();
  const createTask = useCreateStudioTask();
  const rehypePlugins = useRehypeSplitWordsIntoSpans(false);

  const subtasks = useMemo<Record<string, Subtask>>(() => {
    if (!task) return {};

    return Object.fromEntries(
      task.events
        .filter((event) => event.role !== "dispatcher")
        .map((event) => [
          event.event_id,
          {
            id: event.event_id,
            subagent_type: event.role,
            description: event.title,
            prompt: event.summary,
            status:
              event.status === "done"
                ? "completed"
                : event.status === "running" || event.status === "pending"
                  ? "in_progress"
                  : "failed",
            result:
              event.status === "done"
                ? event.detail_markdown ?? undefined
                : undefined,
          } satisfies Subtask,
        ]),
    );
  }, [task]);

  const dispatcherSummary = task?.events.find(
    (event) => event.role === "dispatcher",
  )?.summary;

  const handleCreate = async (message: PromptInputMessage) => {
    const topic = message.text.trim();
    if (!topic) {
      return;
    }
    const created = await createTask.mutateAsync({ topic });
    router.push(`/workspace/studio/${created.task_id}`);
  };

  return (
    <WorkspaceContainer>
      <WorkspaceHeader />
      <WorkspaceBody className="items-stretch overflow-hidden">
        <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[192px_minmax(0,1fr)]">
          <aside className="border-r bg-card/20 px-2 py-3">
            <div className="px-3 pb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Tasks
            </div>
            <div className="space-y-0.5">
              {tasks.map((item) => (
                <Link
                  key={item.task_id}
                  href={`/workspace/studio/${item.task_id}`}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                    item.task_id === taskId
                      ? "bg-muted/80 text-foreground"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  <div className="truncate font-medium">{item.topic}</div>
                  <div className="mt-1 truncate text-[11px] uppercase tracking-[0.14em] opacity-70">
                    {item.current_stage}
                  </div>
                </Link>
              ))}
            </div>
          </aside>

          <main className="min-h-0 overflow-hidden">
            {isLoading ? (
              <div className="p-6 text-sm text-muted-foreground">
                Loading task thread...
              </div>
            ) : error ? (
              <div className="p-6 text-sm text-red-500">
                Failed to load task thread: {error.message}
              </div>
            ) : !task ? (
              <div className="p-6 text-sm text-muted-foreground">
                Task not found.
              </div>
            ) : (
              <SubtasksProvider initialTasks={subtasks}>
                <div className="relative flex h-full min-h-0 flex-col">
                  <StudioThread
                    dispatcherSummary={dispatcherSummary}
                    rehypePlugins={rehypePlugins}
                    subtasks={subtasks}
                    summary={task.summary}
                    title={task.topic}
                  />
                  <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 flex justify-center px-4 pb-4">
                    <div className="pointer-events-auto w-full max-w-(--container-width-md)">
                      <PromptInput
                        className="bg-background/90 w-full rounded-2xl border shadow-sm backdrop-blur-sm *:data-[slot='input-group']:rounded-2xl"
                        onSubmit={handleCreate}
                      >
                        <PromptInputTextarea placeholder="Start a new content task..." />
                        <PromptInputFooter className="justify-end">
                          <PromptInputSubmit
                            disabled={createTask.isPending}
                            status={createTask.isPending ? "submitted" : "ready"}
                          />
                        </PromptInputFooter>
                      </PromptInput>
                    </div>
                  </div>
                </div>
              </SubtasksProvider>
            )}
          </main>
        </div>
      </WorkspaceBody>
    </WorkspaceContainer>
  );
}

function StudioThread({
  dispatcherSummary,
  title,
  summary,
  subtasks,
  rehypePlugins,
}: {
  dispatcherSummary?: string;
  title: string;
  summary: string;
  subtasks: Record<string, Subtask>;
  rehypePlugins: ReturnType<typeof useRehypeSplitWordsIntoSpans>;
}) {
  const entries = Object.values(subtasks);

  return (
    <Conversation className="min-h-0 flex-1">
      <ConversationContent className="mx-auto w-full max-w-(--container-width-md) gap-8 px-4 pt-10 pb-40">
        <Message from="assistant">
          <MessageContent className="w-full">
            <MarkdownContent
              content={`# ${title}\n\n${summary}`}
              isLoading={false}
              rehypePlugins={rehypePlugins}
            />
          </MessageContent>
        </Message>

        {dispatcherSummary ? (
          <Message from="assistant">
            <MessageContent>
              <p className="text-muted-foreground text-sm leading-7">
                {dispatcherSummary}
              </p>
            </MessageContent>
          </Message>
        ) : null}

        {entries.map((subtask) => (
          <Message key={subtask.id} from="assistant">
            <div className="text-muted-foreground mb-2 text-xs uppercase tracking-[0.18em]">
              {roleLabel[subtask.subagent_type as keyof typeof roleLabel] ??
                subtask.subagent_type}
            </div>
            <MessageContent className="w-full">
              <SubtaskCard
                taskId={subtask.id}
                isLoading={subtask.status === "in_progress"}
              />
            </MessageContent>
          </Message>
        ))}
      </ConversationContent>
    </Conversation>
  );
}
