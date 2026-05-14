"use client";

import {
  FileTextIcon,
  LayoutDashboardIcon,
  PlayIcon,
  SearchIcon,
  ShieldCheckIcon,
  Loader2Icon,
  StopCircleIcon,
} from "lucide-react";
import { useEffect, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudioPipeline, useStudioTask } from "@/core/studio/hooks";
import type { StudioTask } from "@/core/studio/types";

import { ArticleEditor } from "./article-editor";
import { EvidenceList, TopicReportCard } from "./evidence-panel";
import { StageTimeline } from "./stage-timeline";
import { VerificationPanel } from "./verification-panel";

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function TaskStatusBadge({ status }: { status: StudioTask["status"] }) {
  const config: Record<
    string,
    { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
  > = {
    queued: { label: "排队中", variant: "secondary" },
    running: { label: "执行中", variant: "default" },
    completed: { label: "已完成", variant: "outline" },
    failed: { label: "失败", variant: "destructive" },
  };
  const c = config[status] ?? config.queued!;
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------

function OverviewTab({ task }: { task: StudioTask }) {
  const completedStages = task.stages.filter((s) => s.status === "completed").length;

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        {/* Task header card */}
        <Card className="gap-3 py-4">
          <CardHeader className="px-4 py-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{task.topic}</CardTitle>
              <TaskStatusBadge status={task.status} />
            </div>
            <CardDescription className="text-xs">
              平台：{task.target_platform} · 创建于{" "}
              {new Date(task.created_at * 1000).toLocaleString("zh-CN")}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-0">
            <div className="bg-muted/50 flex items-center gap-4 rounded-lg p-3">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {completedStages}/{task.stages.length}
                </div>
                <div className="text-muted-foreground text-xs">阶段完成</div>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {task.evidence_pack?.evidence_items?.length ?? 0}
                </div>
                <div className="text-muted-foreground text-xs">证据条数</div>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {task.verification_report?.verdict ?? "—"}
                </div>
                <div className="text-muted-foreground text-xs">核查结论</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topic report */}
        {task.topic_report && (
          <TopicReportCard report={task.topic_report} />
        )}

        {/* Stage timeline */}
        <div>
          <h3 className="mb-3 text-sm font-medium">执行进度</h3>
          <StageTimeline stages={task.stages} />
        </div>
      </div>
    </ScrollArea>
  );
}

// ---------------------------------------------------------------------------
// Research tab
// ---------------------------------------------------------------------------

function ResearchTab({ task }: { task: StudioTask }) {
  if (!task.evidence_pack) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
        研究阶段尚未完成
      </div>
    );
  }
  return (
    <div className="h-full p-4">
      <EvidenceList pack={task.evidence_pack} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Verification tab
// ---------------------------------------------------------------------------

function VerificationTab({ task }: { task: StudioTask }) {
  if (!task.verification_report) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
        核查阶段尚未完成
      </div>
    );
  }
  return (
    <div className="h-full p-4">
      <VerificationPanel report={task.verification_report} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main workbench
// ---------------------------------------------------------------------------

export function StudioWorkbench({ taskId }: { taskId: string }) {
  const { task, isLoading } = useStudioTask(taskId);
  const { start, cancel, isRunning, error } = useStudioPipeline(taskId);

  // Auto-start pipeline when entering a queued task
  useEffect(() => {
    if (task && task.status === "queued" && !isRunning) {
      start();
    }
  }, [task?.task_id, task?.status]);

  const activeTab = useMemo(() => {
    if (!task) return "overview";
    switch (task.current_stage) {
      case "research":
        return "research";
      case "writing":
        return "article";
      case "verification":
        return "verification";
      default:
        return "overview";
    }
  }, [task?.current_stage]);

  if (isLoading || !task) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <h2 className="max-w-md truncate text-sm font-semibold">
            {task.topic}
          </h2>
          <TaskStatusBadge status={task.status} />
        </div>
        <div className="flex items-center gap-2">
          {task.status === "queued" && !isRunning && (
            <Button size="sm" onClick={start}>
              <PlayIcon className="mr-1 size-3.5" />
              开始生成
            </Button>
          )}
          {isRunning && (
            <Button size="sm" variant="destructive" onClick={cancel}>
              <StopCircleIcon className="mr-1 size-3.5" />
              停止
            </Button>
          )}
          {error && (
            <span className="text-xs text-red-500">{error}</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab} className="flex min-h-0 flex-1 flex-col">
        <TabsList variant="line" className="mx-4">
          <TabsTrigger value="overview" className="gap-1">
            <LayoutDashboardIcon className="size-3.5" />
            概览
          </TabsTrigger>
          <TabsTrigger value="research" className="gap-1">
            <SearchIcon className="size-3.5" />
            研究
          </TabsTrigger>
          <TabsTrigger value="article" className="gap-1">
            <FileTextIcon className="size-3.5" />
            文章
          </TabsTrigger>
          <TabsTrigger value="verification" className="gap-1">
            <ShieldCheckIcon className="size-3.5" />
            审校
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="min-h-0 flex-1">
          <OverviewTab task={task} />
        </TabsContent>

        <TabsContent value="research" className="min-h-0 flex-1">
          <ResearchTab task={task} />
        </TabsContent>

        <TabsContent value="article" className="min-h-0 flex-1">
          <ArticleEditor
            taskId={task.task_id}
            title={task.article_title}
            markdown={task.article_markdown}
            readOnly={task.status === "running"}
          />
        </TabsContent>

        <TabsContent value="verification" className="min-h-0 flex-1">
          <VerificationTab task={task} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
