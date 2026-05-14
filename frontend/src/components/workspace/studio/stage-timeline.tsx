"use client";

import {
  CheckCircleIcon,
  CircleDotIcon,
  ClockIcon,
  Loader2Icon,
  SearchIcon,
  FileTextIcon,
  ShieldCheckIcon,
  SendIcon,
  XCircleIcon,
} from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StudioStage, StageKind } from "@/core/studio/types";

const STAGE_ICONS: Record<StageKind, React.ReactNode> = {
  planning: <ClockIcon className="size-4" />,
  research: <SearchIcon className="size-4" />,
  writing: <FileTextIcon className="size-4" />,
  verification: <ShieldCheckIcon className="size-4" />,
  publishing: <SendIcon className="size-4" />,
};

function StageStatusIcon({ status }: { status: StudioStage["status"] }) {
  switch (status) {
    case "completed":
      return <CheckCircleIcon className="size-4 text-green-500" />;
    case "running":
      return <Loader2Icon className="size-4 animate-spin text-blue-500" />;
    case "failed":
      return <XCircleIcon className="size-4 text-red-500" />;
    case "skipped":
      return <CircleDotIcon className="size-4 text-muted-foreground" />;
    default:
      return <CircleDotIcon className="size-4 text-muted-foreground/40" />;
  }
}

function formatDuration(ms: number | null | undefined): string {
  if (!ms) return "";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function StageTimeline({ stages }: { stages: StudioStage[] }) {
  return (
    <div className="flex flex-col gap-1">
      {stages.map((stage, index) => (
        <div key={stage.stage_id} className="flex items-start gap-3">
          {/* Vertical connector line */}
          <div className="flex flex-col items-center">
            <StageStatusIcon status={stage.status} />
            {index < stages.length - 1 && (
              <div
                className={cn(
                  "mt-1 h-8 w-px",
                  stage.status === "completed"
                    ? "bg-green-500/30"
                    : "bg-border",
                )}
              />
            )}
          </div>

          {/* Stage content */}
          <div className="flex-1 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {STAGE_ICONS[stage.kind]}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  stage.status === "pending"
                    ? "text-muted-foreground/60"
                    : "text-foreground",
                  stage.status === "running" && "text-blue-500",
                )}
              >
                {stage.label}
              </span>
              {stage.status === "running" && (
                <Badge
                  variant="outline"
                  className="border-blue-500/30 text-blue-500 text-xs"
                >
                  进行中
                </Badge>
              )}
              {stage.duration_ms != null && stage.status === "completed" && (
                <span className="text-muted-foreground text-xs">
                  {formatDuration(stage.duration_ms)}
                </span>
              )}
            </div>
            {stage.summary && (
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {stage.summary}
              </p>
            )}
            {stage.error && (
              <p className="mt-1 text-xs leading-relaxed text-red-500">
                {stage.error}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
