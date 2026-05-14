"use client";

import {
  ExternalLinkIcon,
  GlobeIcon,
  StarIcon,
  TrendingUpIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { EvidencePack, TopicReport } from "@/core/studio/types";

// ---------------------------------------------------------------------------
// Topic Report Card
// ---------------------------------------------------------------------------

export function TopicReportCard({ report }: { report: TopicReport }) {
  const scoreColor =
    report.value_score >= 80
      ? "text-green-500"
      : report.value_score >= 60
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4 py-0">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>选题评估</span>
          <span className={cn("text-lg font-bold", scoreColor)}>
            {report.value_score}
            <span className="text-muted-foreground text-xs font-normal">
              /100
            </span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 py-0">
        <div>
          <p className="text-muted-foreground text-xs font-medium">切入角度</p>
          <p className="mt-1 text-sm">{report.angle}</p>
        </div>
        {report.risks.length > 0 && (
          <div>
            <p className="text-muted-foreground text-xs font-medium">
              风险提示
            </p>
            <ul className="mt-1 space-y-1">
              {report.risks.map((risk, i) => (
                <li
                  key={i}
                  className="text-muted-foreground text-xs leading-relaxed"
                >
                  • {risk}
                </li>
              ))}
            </ul>
          </div>
        )}
        {report.recommended_queries.length > 0 && (
          <div>
            <p className="text-muted-foreground text-xs font-medium">
              搜索策略
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {report.recommended_queries.map((q, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {q}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Evidence List
// ---------------------------------------------------------------------------

function ScoreBar({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-muted-foreground w-8 text-xs">{label}</span>
      <Progress value={value * 100} className="h-1 flex-1" />
      <span className="text-muted-foreground w-8 text-right text-xs">
        {(value * 100).toFixed(0)}
      </span>
    </div>
  );
}

export function EvidenceList({ pack }: { pack: EvidencePack }) {
  if (!pack.evidence_items.length) {
    return (
      <div className="text-muted-foreground py-8 text-center text-sm">
        暂无证据数据
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-1">
        {/* Summary */}
        {pack.summary && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm leading-relaxed">{pack.summary}</p>
            {pack.weak_points.length > 0 && (
              <div className="mt-2 space-y-1">
                {pack.weak_points.map((wp, i) => (
                  <p key={i} className="text-xs text-amber-500">
                    ⚠ {wp}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Evidence items */}
        {pack.evidence_items.map((item, index) => (
          <div
            key={`${item.url}-${index}`}
            className="group rounded-lg border p-3 transition-colors hover:bg-accent/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <GlobeIcon className="text-muted-foreground size-3 shrink-0" />
                  <span className="text-muted-foreground truncate text-xs">
                    {item.site}
                  </span>
                  {item.source_type === "reference_url" && (
                    <Badge variant="outline" className="text-xs">
                      参考链接
                    </Badge>
                  )}
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 line-clamp-2 text-sm font-medium hover:underline"
                >
                  {item.title}
                  <ExternalLinkIcon className="ml-1 inline size-3" />
                </a>
                <p className="text-muted-foreground mt-1 line-clamp-3 text-xs leading-relaxed">
                  {item.snippet}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <StarIcon className="size-3 text-amber-400" />
                <span className="text-sm font-medium">
                  {(item.final_score * 100).toFixed(0)}
                </span>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="mt-2 space-y-1 opacity-0 transition-opacity group-hover:opacity-100">
              <ScoreBar label="相关" value={item.raw_score} />
              <ScoreBar label="时效" value={item.freshness_score} />
              <ScoreBar label="可信" value={item.credibility_score} />
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
