"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { StudioTaskList } from "@/components/workspace/studio/studio-task-list";
import { WorkspaceContainer, WorkspaceHeader } from "@/components/workspace/workspace-container";

import { StudioEmptyState } from "./studio-empty-state";

export default function StudioPage() {
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
            <StudioEmptyState />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </WorkspaceContainer>
  );
}
