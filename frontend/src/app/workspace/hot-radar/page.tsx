"use client";

import {
  ArrowUpRightIcon,
  FlameIcon,
  RocketIcon,
  TrendingUpIcon,
  ZapIcon,
  SparklesIcon,
  ExternalLinkIcon,
  BarChart3Icon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  WorkspaceBody,
  WorkspaceContainer,
  WorkspaceHeader,
} from "@/components/workspace/workspace-container";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Demo data — will be replaced by real API
// ---------------------------------------------------------------------------

interface HotTopic {
  id: string;
  title: string;
  platform: string;
  heat: number;
  trend: "rising" | "stable" | "falling";
  trendDelta: number;
  category: string;
  isBlackHorse: boolean;
  predictedPeakHours: number;
  sources: number;
}

const DEMO_TOPICS: HotTopic[] = [
  {
    id: "1",
    title: "GPT-5 发布日期曝光，性能提升10倍",
    platform: "微博",
    heat: 98,
    trend: "rising",
    trendDelta: 340,
    category: "科技",
    isBlackHorse: false,
    predictedPeakHours: 4,
    sources: 128,
  },
  {
    id: "2",
    title: "跨境电商新规7月实施，卖家如何应对",
    platform: "抖音",
    heat: 85,
    trend: "rising",
    trendDelta: 180,
    category: "财经",
    isBlackHorse: true,
    predictedPeakHours: 8,
    sources: 56,
  },
  {
    id: "3",
    title: "小红书电商GMV突破千亿，内容带货成主流",
    platform: "小红书",
    heat: 76,
    trend: "stable",
    trendDelta: 12,
    category: "电商",
    isBlackHorse: false,
    predictedPeakHours: 12,
    sources: 89,
  },
  {
    id: "4",
    title: "AI Agent 自动化办公场景大爆发",
    platform: "微博",
    heat: 72,
    trend: "rising",
    trendDelta: 520,
    category: "科技",
    isBlackHorse: true,
    predictedPeakHours: 3,
    sources: 34,
  },
  {
    id: "5",
    title: "年轻人涌入县城创业，新消费风口来了",
    platform: "抖音",
    heat: 68,
    trend: "rising",
    trendDelta: 95,
    category: "社会",
    isBlackHorse: false,
    predictedPeakHours: 18,
    sources: 72,
  },
  {
    id: "6",
    title: "苹果WWDC 2026亮点前瞻：AI贯穿全线",
    platform: "微博",
    heat: 62,
    trend: "stable",
    trendDelta: 8,
    category: "科技",
    isBlackHorse: false,
    predictedPeakHours: 24,
    sources: 45,
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TrendBadge({ trend, delta }: { trend: HotTopic["trend"]; delta: number }) {
  if (trend === "rising") {
    return (
      <Badge className="gap-0.5 bg-red-500/10 text-red-500 border-red-500/20">
        <TrendingUpIcon className="size-3" />
        +{delta}%
      </Badge>
    );
  }
  if (trend === "falling") {
    return (
      <Badge variant="secondary" className="gap-0.5">
        <TrendingUpIcon className="size-3 rotate-180" />
        -{delta}%
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-0.5 text-muted-foreground">
      ≈ {delta}%
    </Badge>
  );
}

function HeatBar({ heat }: { heat: number }) {
  return (
    <div className="flex items-center gap-2">
      <Progress
        value={heat}
        className={cn(
          "h-2 flex-1",
          heat >= 90
            ? "[&>div]:bg-red-500"
            : heat >= 70
              ? "[&>div]:bg-orange-500"
              : "[&>div]:bg-blue-500",
        )}
      />
      <span className="w-8 text-right text-xs font-semibold">{heat}</span>
    </div>
  );
}

function TopicCard({ topic }: { topic: HotTopic }) {
  return (
    <div className="group flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/30">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          {topic.isBlackHorse && (
            <Badge className="gap-0.5 bg-purple-500/10 border-purple-500/20 text-purple-500">
              <RocketIcon className="size-3" />
              黑马
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {topic.platform}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {topic.category}
          </Badge>
        </div>
        <h3 className="text-sm font-medium leading-snug">{topic.title}</h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{topic.sources} 篇相关文章</span>
          <span>预计 {topic.predictedPeakHours}h 后达到峰值</span>
        </div>
        <HeatBar heat={topic.heat} />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <TrendBadge trend={topic.trend} delta={topic.trendDelta} />
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 transition-opacity group-hover:opacity-100"
          asChild
        >
          <Link href="/workspace/studio">
            <SparklesIcon className="mr-1 size-3" />
            生成文章
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatsCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="flex flex-row items-center gap-2 px-4 py-0">
        <div className="rounded-md bg-muted p-1.5">{icon}</div>
        <CardDescription className="text-xs">{label}</CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-0">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HotRadarPage() {
  const [search, setSearch] = useState("");

  const filtered = DEMO_TOPICS.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  const blackHorses = DEMO_TOPICS.filter((t) => t.isBlackHorse);

  return (
    <WorkspaceContainer>
      <WorkspaceHeader />
      <WorkspaceBody>
        <div className="w-full max-w-5xl space-y-6 p-6">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4">
            <StatsCard
              icon={<FlameIcon className="size-4 text-red-500" />}
              label="监控话题"
              value={String(DEMO_TOPICS.length)}
              sub="实时跟踪中"
            />
            <StatsCard
              icon={<RocketIcon className="size-4 text-purple-500" />}
              label="黑马话题"
              value={String(blackHorses.length)}
              sub="即将爆发"
            />
            <StatsCard
              icon={<TrendingUpIcon className="size-4 text-green-500" />}
              label="上升趋势"
              value={String(DEMO_TOPICS.filter((t) => t.trend === "rising").length)}
              sub="过去6小时"
            />
            <StatsCard
              icon={<BarChart3Icon className="size-4 text-blue-500" />}
              label="平台覆盖"
              value="3"
              sub="微博/抖音/小红书"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">全部热点</TabsTrigger>
                <TabsTrigger value="blackhorse">
                  <RocketIcon className="mr-1 size-3" />
                  黑马预警
                </TabsTrigger>
                <TabsTrigger value="weibo">微博</TabsTrigger>
                <TabsTrigger value="douyin">抖音</TabsTrigger>
                <TabsTrigger value="xiaohongshu">小红书</TabsTrigger>
              </TabsList>
              <Input
                placeholder="搜索话题..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56"
              />
            </div>

            <TabsContent value="all" className="mt-4 space-y-3">
              {filtered.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </TabsContent>

            <TabsContent value="blackhorse" className="mt-4 space-y-3">
              {blackHorses.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
              {blackHorses.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  暂未发现黑马话题
                </div>
              )}
            </TabsContent>

            <TabsContent value="weibo" className="mt-4 space-y-3">
              {filtered
                .filter((t) => t.platform === "微博")
                .map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
            </TabsContent>

            <TabsContent value="douyin" className="mt-4 space-y-3">
              {filtered
                .filter((t) => t.platform === "抖音")
                .map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
            </TabsContent>

            <TabsContent value="xiaohongshu" className="mt-4 space-y-3">
              {filtered
                .filter((t) => t.platform === "小红书")
                .map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
            </TabsContent>
          </Tabs>
        </div>
      </WorkspaceBody>
    </WorkspaceContainer>
  );
}
