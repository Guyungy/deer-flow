"use client";

import { useRouter } from "next/navigation";

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
import { useCreateStudioTask } from "@/core/studio";

export function StudioEmptyState() {
  const router = useRouter();
  const createTask = useCreateStudioTask();

  const handleCreate = async (message: PromptInputMessage) => {
    const topic = message.text.trim();
    if (!topic) {
      return;
    }
    const created = await createTask.mutateAsync({ topic });
    router.replace(`/workspace/studio/${created.task_id}`);
  };

  return (
    <WorkspaceContainer>
      <WorkspaceHeader />
      <WorkspaceBody className="items-stretch overflow-hidden">
        <div className="flex h-full w-full items-center justify-center px-6">
          <div className="w-full max-w-(--container-width-md)">
            <PromptInput
              className="bg-background/85 rounded-2xl border backdrop-blur-sm *:data-[slot='input-group']:rounded-2xl"
              onSubmit={handleCreate}
            >
              <PromptInputTextarea
                autoFocus
                placeholder="Describe the content task you want to start..."
              />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit
                  disabled={createTask.isPending}
                  status={createTask.isPending ? "submitted" : "ready"}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </WorkspaceBody>
    </WorkspaceContainer>
  );
}
