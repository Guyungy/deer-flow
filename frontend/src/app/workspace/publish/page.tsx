"use client";

import {
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  Edit3Icon,
  ExternalLinkIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PlusIcon,
  SendIcon,
  SettingsIcon,
  SmartphoneIcon,
  UserCircle2Icon,
  XCircleIcon,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  WorkspaceBody,
  WorkspaceContainer,
  WorkspaceHeader,
} from "@/components/workspace/workspace-container";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

type PublishStatus = "draft" | "scheduled" | "publishing" | "published" | "failed";
type Platform = "wechat" | "xiaohongshu" | "douyin";

interface PublishTask {
  id: string;
  title: string;
  platform: Platform;
  account: string;
  status: PublishStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  wordCount: number;
  error: string | null;
}

interface AccountInfo {
  id: string;
  platform: Platform;
  name: string;
  avatar: string;
  followers: number;
  connected: boolean;
}

const DEMO_TASKS: PublishTask[] = [
  {
    id: "p1",
    title: "深度解读：AI Agent 发展趋势的现在与未来",
    platform: "wechat",
    account: "AI前沿日报",
    status: "published",
    scheduledAt: null,
    publishedAt: "2025-04-04 20:00",
    wordCount: 3200,
    error: null,
  },
  {
    id: "p2",
    title: "跨境电商新规解析：7月新政对卖家的影响",
    platform: "wechat",
    account: "AI前沿日报",
    status: "scheduled",
    scheduledAt: "2025-04-06 09:00",
    publishedAt: null,
    wordCount: 4100,
    error: null,
  },
  {
    id: "p3",
    title: "小红书爆款笔记公式揭秘",
    platform: "xiaohongshu",
    account: "内容研究所",
    status: "draft",
    scheduledAt: null,
    publishedAt: null,
    wordCount: 1800,
    error: null,
  },
  {
    id: "p4",
    title: "3分钟看懂大模型降价潮",
    platform: "douyin",
    account: "科技快评",
    status: "failed",
    scheduledAt: "2025-04-03 18:00",
    publishedAt: null,
    wordCount: 800,
    error: "发布失败：access_token 已过期，请重新授权",
  },
];

const DEMO_ACCOUNTS: AccountInfo[] = [
  {
    id: "a1",
    platform: "wechat",
    name: "AI前沿日报",
    avatar: "🤖",
    followers: 12500,
    connected: true,
  },
  {
    id: "a2",
    platform: "xiaohongshu",
    name: "内容研究所",
    avatar: "📝",
    followers: 8200,
    connected: true,
  },
  {
    id: "a3",
    platform: "douyin",
    name: "科技快评",
    avatar: "⚡",
    followers: 35000,
    connected: false,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PLATFORM_LABELS: Record<Platform, string> = {
  wechat: "微信公众号",
  xiaohongshu: "小红书",
  douyin: "抖音",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  wechat: "bg-green-500/10 text-green-600 border-green-500/20",
  xiaohongshu: "bg-red-500/10 text-red-500 border-red-500/20",
  douyin: "bg-black/10 text-foreground border-black/20",
};

function StatusBadge({ status }: { status: PublishStatus }) {
  const config: Record<
    PublishStatus,
    { label: string; icon: React.ReactNode; className: string }
  > = {
    draft: {
      label: "草稿",
      icon: <Edit3Icon className="size-3" />,
      className: "bg-muted text-muted-foreground",
    },
    scheduled: {
      label: "定时发布",
      icon: <ClockIcon className="size-3" />,
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    publishing: {
      label: "发布中",
      icon: <Loader2Icon className="size-3 animate-spin" />,
      className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    },
    published: {
      label: "已发布",
      icon: <CheckCircle2Icon className="size-3" />,
      className: "bg-green-500/10 text-green-500 border-green-500/20",
    },
    failed: {
      label: "发布失败",
      icon: <XCircleIcon className="size-3" />,
      className: "bg-red-500/10 text-red-500 border-red-500/20",
    },
  };
  const c = config[status];
  return (
    <Badge variant="outline" className={cn("gap-1", c.className)}>
      {c.icon}
      {c.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PublishTaskCard({ task }: { task: PublishTask }) {
  return (
    <div className="group flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/30">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", PLATFORM_COLORS[task.platform])}>
            {PLATFORM_LABELS[task.platform]}
          </Badge>
          <StatusBadge status={task.status} />
        </div>
        <h3 className="text-sm font-medium">{task.title}</h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <UserCircle2Icon className="size-3" />
            {task.account}
          </span>
          <span>{task.wordCount} 字</span>
          {task.scheduledAt && (
            <span className="inline-flex items-center gap-1">
              <CalendarIcon className="size-3" />
              计划 {task.scheduledAt}
            </span>
          )}
          {task.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <CheckCircle2Icon className="size-3" />
              已发布 {task.publishedAt}
            </span>
          )}
        </div>
        {task.error && (
          <p className="text-xs text-red-500">{task.error}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {task.status === "draft" && (
          <Button size="sm" variant="default">
            <SendIcon className="mr-1 size-3" />
            发布
          </Button>
        )}
        {task.status === "failed" && (
          <Button size="sm" variant="outline">
            重试
          </Button>
        )}
        <Button size="icon" variant="ghost" className="size-8">
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function AccountCard({ account }: { account: AccountInfo }) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="flex flex-row items-center gap-3 px-4 py-0">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xl">
          {account.avatar}
        </div>
        <div className="flex-1">
          <CardTitle className="text-sm">{account.name}</CardTitle>
          <CardDescription className="text-xs">
            {PLATFORM_LABELS[account.platform]} ·{" "}
            {account.followers.toLocaleString()} 粉丝
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            account.connected
              ? "border-green-500/30 text-green-500"
              : "border-red-500/30 text-red-500",
          )}
        >
          {account.connected ? "已连接" : "未连接"}
        </Badge>
      </CardHeader>
      <CardContent className="px-4 py-0">
        <Button
          size="sm"
          variant={account.connected ? "outline" : "default"}
          className="w-full text-xs"
        >
          {account.connected ? (
            <>
              <SettingsIcon className="mr-1 size-3" />
              管理
            </>
          ) : (
            <>
              <PlusIcon className="mr-1 size-3" />
              授权连接
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PublishPage() {
  return (
    <WorkspaceContainer>
      <WorkspaceHeader />
      <WorkspaceBody>
        <div className="w-full max-w-5xl space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-semibold">
                <SendIcon className="size-5" />
                发布中心
              </h1>
              <p className="text-sm text-muted-foreground">
                一键发布到微信公众号、小红书、抖音，支持定时发布和多账号管理
              </p>
            </div>
            <Button>
              <PlusIcon className="mr-1 size-4" />
              新建发布任务
            </Button>
          </div>

          <Tabs defaultValue="tasks">
            <TabsList>
              <TabsTrigger value="tasks">发布任务</TabsTrigger>
              <TabsTrigger value="accounts">账号管理</TabsTrigger>
              <TabsTrigger value="schedule">定时计划</TabsTrigger>
            </TabsList>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="mt-4">
              {/* Stats */}
              <div className="mb-4 grid grid-cols-4 gap-3">
                <Card className="gap-1 px-4 py-3">
                  <p className="text-xs text-muted-foreground">草稿</p>
                  <p className="text-2xl font-bold">
                    {DEMO_TASKS.filter((t) => t.status === "draft").length}
                  </p>
                </Card>
                <Card className="gap-1 px-4 py-3">
                  <p className="text-xs text-muted-foreground">待发布</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {DEMO_TASKS.filter((t) => t.status === "scheduled").length}
                  </p>
                </Card>
                <Card className="gap-1 px-4 py-3">
                  <p className="text-xs text-muted-foreground">已发布</p>
                  <p className="text-2xl font-bold text-green-500">
                    {DEMO_TASKS.filter((t) => t.status === "published").length}
                  </p>
                </Card>
                <Card className="gap-1 px-4 py-3">
                  <p className="text-xs text-muted-foreground">失败</p>
                  <p className="text-2xl font-bold text-red-500">
                    {DEMO_TASKS.filter((t) => t.status === "failed").length}
                  </p>
                </Card>
              </div>

              <div className="space-y-3">
                {DEMO_TASKS.map((task) => (
                  <PublishTaskCard key={task.id} task={task} />
                ))}
              </div>
            </TabsContent>

            {/* Accounts Tab */}
            <TabsContent value="accounts" className="mt-4">
              <div className="grid grid-cols-3 gap-4">
                {DEMO_ACCOUNTS.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
                <Card className="flex items-center justify-center gap-2 border-dashed py-8">
                  <Button variant="ghost" className="text-muted-foreground">
                    <PlusIcon className="mr-1 size-4" />
                    添加账号
                  </Button>
                </Card>
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="mt-4">
              <Card className="gap-4 py-6">
                <CardHeader className="items-center">
                  <CalendarIcon className="size-10 text-muted-foreground/30" />
                  <CardTitle className="text-base">定时发布计划</CardTitle>
                  <CardDescription>
                    设置每周自动发布计划，选择最佳发布时间，让内容按时触达读者
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-3">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ClockIcon className="size-5 text-blue-500" />
                          <div className="text-left">
                            <p className="text-sm font-medium">
                              每周一三五 · 20:00
                            </p>
                            <p className="text-xs text-muted-foreground">
                              自动发布到「AI前沿日报」
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-green-500/30 text-green-500">
                          运行中
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <PlusIcon className="mr-1 size-4" />
                      新增定时计划
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </WorkspaceBody>
    </WorkspaceContainer>
  );
}
