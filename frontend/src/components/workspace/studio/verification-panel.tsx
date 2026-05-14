"use client";

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { VerificationClaim, VerificationReport } from "@/core/studio/types";

// ---------------------------------------------------------------------------
// Verdict badge
// ---------------------------------------------------------------------------

function VerdictBadge({ verdict }: { verdict: string }) {
  const config: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
    PASS: {
      icon: <ShieldCheckIcon className="size-4" />,
      className: "border-green-500/30 bg-green-500/10 text-green-500",
      label: "核查通过",
    },
    PARTIAL: {
      icon: <AlertTriangleIcon className="size-4" />,
      className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
      label: "部分通过",
    },
    FAIL: {
      icon: <ShieldAlertIcon className="size-4" />,
      className: "border-red-500/30 bg-red-500/10 text-red-500",
      label: "核查未通过",
    },
  };

  const c = config[verdict] || config.FAIL!;

  return (
    <Badge variant="outline" className={cn("gap-1 text-sm", c.className)}>
      {c.icon}
      {c.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Claim card
// ---------------------------------------------------------------------------

function ClaimCard({
  claim,
  type,
}: {
  claim: VerificationClaim;
  type: "supported" | "weak" | "unsupported";
}) {
  const typeConfig = {
    supported: {
      icon: <CheckCircle2Icon className="size-4 text-green-500" />,
      borderClass: "border-l-green-500",
    },
    weak: {
      icon: <AlertTriangleIcon className="size-4 text-yellow-500" />,
      borderClass: "border-l-yellow-500",
    },
    unsupported: {
      icon: <XCircleIcon className="size-4 text-red-500" />,
      borderClass: "border-l-red-500",
    },
  };

  const cfg = typeConfig[type];

  return (
    <div className={cn("rounded-r-md border border-l-2 p-3", cfg.borderClass)}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0">{cfg.icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed">{claim.claim}</p>
          {claim.note && (
            <p className="text-muted-foreground mt-1 text-xs">{claim.note}</p>
          )}
          {claim.evidence_urls.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {claim.evidence_urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground inline-flex items-center gap-0.5 text-xs hover:underline"
                >
                  <ExternalLinkIcon className="size-3" />
                  来源 {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function VerificationPanel({ report }: { report: VerificationReport }) {
  const sections = [
    { title: "已验证论点", claims: report.supported_claims, type: "supported" as const },
    { title: "待补充论点", claims: report.weak_claims, type: "weak" as const },
    { title: "未验证论点", claims: report.unsupported_claims, type: "unsupported" as const },
  ].filter((s) => s.claims.length > 0);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-1">
        <Card className="gap-3 py-4">
          <CardHeader className="px-4 py-0">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>事实核查结论</span>
              <VerdictBadge verdict={report.verdict} />
            </CardTitle>
          </CardHeader>
        </Card>

        {sections.map((section) => (
          <div key={section.type}>
            <h4 className="text-muted-foreground mb-2 text-xs font-medium">
              {section.title} ({section.claims.length})
            </h4>
            <div className="space-y-2">
              {section.claims.map((claim, i) => (
                <ClaimCard key={i} claim={claim} type={section.type} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
