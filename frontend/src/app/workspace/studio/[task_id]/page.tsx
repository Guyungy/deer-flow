"use client";

import { useParams } from "next/navigation";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { StudioTaskList } from "@/components/workspace/studio/studio-task-list";
import { StudioWorkbench } from "@/components/workspace/studio/studio-workbench";
import { WorkspaceContainer, WorkspaceHeader } from "@/components/workspace/workspace-container";

export default function StudioTaskPage() {
  const params = useParams();
  const taskId = params?.task_id as string;

  return (
    <WorkspaceContainer>
      <WorkspaceHeader />
      <div className="relative flex min-h-0 w-full flex-1">
        <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="border-r">
            <StudioTaskList />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            <StudioWorkbench taskId={taskId} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </WorkspaceContainer>
  );
}
