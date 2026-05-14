"use client";

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  KeyRoundIcon,
  LinkIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  SettingsIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UnlinkIcon,
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  WorkspaceBody,
  WorkspaceContainer,
  WorkspaceHeader,
} from "@/components/workspace/workspace-container";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types & demo data
// ---------------------------------------------------------------------------

type Platform = "wechat" | "xiaohongshu" | "douyin" | "weibo" | "zhihu";
type AuthStatus = "connected" | "expired" | "disconnected";

interface PlatformAccount {
  id: string;
  platform: Platform;
  accountName: string;
  displayName: string;
  avatar: string;
  followers: number;
  authStatus: AuthStatus;
  lastSyncAt: string | null;
  expiresAt: string | null;
  articlesPublished: number;
  features: string[];
}

const PLATFORM_META: Record<
  Platform,
  { label: string; color: string; icon: string; description: string }
> = {
  wechat: {
    label: "微信公众号",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: "💬",
    description: "图文消息、草稿箱、素材管理、粉丝管理",
  },
  xiaohongshu: {
    label: "小红书",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: "📕",
    description: "笔记发布、数据分析、评论管理",
  },
  douyin: {
    label: "抖音",
    color: "bg-gray-500/10 text-foreground border-gray-500/20",
    icon: "🎵",
    description: "图文/视频发布、热点话题、数据看板",
  },
  weibo: {
    label: "微博",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    icon: "🔥",
    description: "微博发布、话题参与、粉丝互动",
  },
  zhihu: {
    label: "知乎",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: "💡",
    description: "文章发布、问答参与、专栏管理",
  },
};

const DEMO_ACCOUNTS: PlatformAccount[] = [
  {
    id: "acc-1",
    platform: "wechat",
    accountName: "gh_abc123",
    displayName: "AI前沿日报",
    avatar: "🤖",
    followers: 12500,
    authStatus: "connected",
    lastSyncAt: "2025-04-05 10:30",
    expiresAt: "2025-05-05",
    articlesPublished: 86,
    features: ["图文发布", "草稿箱", "素材库", "粉丝管理", "数据统计"],
  },
  {
    id: "acc-2",
    platform: "wechat",
    accountName: "gh_def456",
    displayName: "科技观察站",
    avatar: "🔬",
    followers: 5800,
    authStatus: "connected",
    lastSyncAt: "2025-04-05 08:15",
    expiresAt: "2025-04-20",
    articlesPublished: 42,
    features: ["图文发布", "草稿箱", "素材库"],
  },
  {
    id: "acc-3",
    platform: "xiaohongshu",
    accountName: "xhs_content_lab",
    displayName: "内容研究所",
    avatar: "📝",
    followers: 8200,
    authStatus: "connected",
    lastSyncAt: "2025-04-04 22:00",
    expiresAt: "2025-06-01",
    articlesPublished: 35,
    features: ["笔记发布", "数据分析"],
  },
  {
    id: "acc-4",
    platform: "douyin",
    accountName: "dy_techfast",
    displayName: "科技快评",
    avatar: "⚡",
    followers: 35000,
    authStatus: "expired",
    lastSyncAt: "2025-03-28 14:00",
    expiresAt: "2025-04-01",
    articlesPublished: 18,
    features: ["图文发布", "视频发布"],
  },
  {
    id: "acc-5",
    platform: "weibo",
    accountName: "weibo_aiwriter",
    displayName: "AI写手联盟",
    avatar: "✍️",
    followers: 22000,
    authStatus: "disconnected",
    lastSyncAt: null,
    expiresAt: null,
    articlesPublished: 0,
    features: [],
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AuthStatusBadge({ status }: { status: AuthStatus }) {
  const config: Record<
    AuthStatus,
    { label: string; icon: React.ReactNode; className: string }
  > = {
    connected: {
      label: "已授权",
      icon: <CheckCircle2Icon className="size-3" />,
      className: "border-green-500/30 bg-green-500/10 text-green-500",
    },
    expired: {
      label: "已过期",
      icon: <AlertTriangleIcon className="size-3" />,
      className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600",
    },
    disconnected: {
      label: "未连接",
      icon: <XCircleIcon className="size-3" />,
      className: "border-red-500/30 bg-red-500/10 text-red-500",
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

function AccountDetailCard({ account }: { account: PlatformAccount }) {
  const meta = PLATFORM_META[account.platform];
  const isExpiringSoon =
    account.expiresAt &&
    new Date(account.expiresAt).getTime() - Date.now() < 15 * 86400000;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      {/* Header */}
      <CardHeader
        className={cn(
          "flex flex-row items-center gap-3 border-b px-4 py-3",
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xl">
          {account.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="truncate text-sm">
              {account.displayName}
            </CardTitle>
            <Badge
              variant="outline"
              className={cn("shrink-0 text-xs", meta.color)}
            >
              {meta.label}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {account.accountName}
          </CardDescription>
        </div>
        <AuthStatusBadge status={account.authStatus} />
      </CardHeader>

      {/* Stats */}
      <CardContent className="space-y-3 px-4 py-3">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold">
              {account.followers.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">粉丝</div>
          </div>
          <div>
            <div className="text-lg font-bold">
              {account.articlesPublished}
            </div>
            <div className="text-xs text-muted-foreground">已发布</div>
          </div>
          <div>
            <div className="text-lg font-bold">
              {account.features.length}
            </div>
            <div className="text-xs text-muted-foreground">功能</div>
          </div>
        </div>

        {/* Features */}
        {account.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {account.features.map((f) => (
              <Badge key={f} variant="secondary" className="text-xs">
                {f}
              </Badge>
            ))}
          </div>
        )}

        {/* Sync & Expiry info */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {account.lastSyncAt && (
            <div className="flex items-center gap-1">
              <RefreshCwIcon className="size-3" />
              上次同步：{account.lastSyncAt}
            </div>
          )}
          {account.expiresAt && (
            <div
              className={cn(
                "flex items-center gap-1",
                isExpiringSoon && "text-yellow-600",
              )}
            >
              <KeyRoundIcon className="size-3" />
              授权过期：{account.expiresAt}
              {isExpiringSoon && " (即将过期)"}
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {account.authStatus === "connected" && (
            <>
              <Button size="sm" variant="outline" className="flex-1 text-xs">
                <RefreshCwIcon className="mr-1 size-3" />
                同步数据
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs">
                <SettingsIcon className="mr-1 size-3" />
                设置
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 shrink-0 text-red-500"
              >
                <UnlinkIcon className="size-3.5" />
              </Button>
            </>
          )}
          {account.authStatus === "expired" && (
            <Button size="sm" className="w-full text-xs">
              <RefreshCwIcon className="mr-1 size-3" />
              重新授权
            </Button>
          )}
          {account.authStatus === "disconnected" && (
            <Button size="sm" className="w-full text-xs">
              <LinkIcon className="mr-1 size-3" />
              授权连接
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PlatformConnectCard({ platform }: { platform: Platform }) {
  const meta = PLATFORM_META[platform];
  const existingCount = DEMO_ACCOUNTS.filter(
    (a) => a.platform === platform,
  ).length;

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="flex flex-row items-center gap-3 px-4 py-0">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xl">
          {meta.icon}
        </div>
        <div className="flex-1">
          <CardTitle className="text-sm">{meta.label}</CardTitle>
          <CardDescription className="text-xs">
            {meta.description}
          </CardDescription>
        </div>
        {existingCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {existingCount} 个账号
          </Badge>
        )}
      </CardHeader>
      <CardContent className="px-4 py-0">
        <Button size="sm" variant="outline" className="w-full text-xs">
          <PlusIcon className="mr-1 size-3" />
          添加{meta.label}账号
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AccountsPage() {
  const connectedCount = DEMO_ACCOUNTS.filter(
    (a) => a.authStatus === "connected",
  ).length;
  const expiredCount = DEMO_ACCOUNTS.filter(
    (a) => a.authStatus === "expired",
  ).length;
  const totalFollowers = DEMO_ACCOUNTS.reduce(
    (sum, a) => sum + a.followers,
    0,
  );

  return (
    <WorkspaceContainer>
      <WorkspaceHeader />
      <WorkspaceBody>
        <div className="w-full max-w-5xl space-y-6 p-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-semibold">
                <KeyRoundIcon className="size-5" />
                账号管理
              </h1>
              <p className="text-sm text-muted-foreground">
                管理你的多平台发布账号，一处授权，全局可用
              </p>
            </div>
            <Button>
              <PlusIcon className="mr-1 size-4" />
              添加账号
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="gap-1 px-4 py-3">
              <p className="text-xs text-muted-foreground">已连接账号</p>
              <p className="text-2xl font-bold text-green-500">
                {connectedCount}
              </p>
            </Card>
            <Card className="gap-1 px-4 py-3">
              <p className="text-xs text-muted-foreground">授权过期</p>
              <p className="text-2xl font-bold text-yellow-500">
                {expiredCount}
              </p>
            </Card>
            <Card className="gap-1 px-4 py-3">
              <p className="text-xs text-muted-foreground">总粉丝数</p>
              <p className="text-2xl font-bold">
                {totalFollowers.toLocaleString()}
              </p>
            </Card>
            <Card className="gap-1 px-4 py-3">
              <p className="text-xs text-muted-foreground">覆盖平台</p>
              <p className="text-2xl font-bold">
                {new Set(DEMO_ACCOUNTS.map((a) => a.platform)).size}
              </p>
            </Card>
          </div>

          <Tabs defaultValue="accounts">
            <TabsList>
              <TabsTrigger value="accounts">我的账号</TabsTrigger>
              <TabsTrigger value="platforms">平台管理</TabsTrigger>
              <TabsTrigger value="security">安全设置</TabsTrigger>
            </TabsList>

            {/* My Accounts */}
            <TabsContent value="accounts" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                {DEMO_ACCOUNTS.map((account) => (
                  <AccountDetailCard key={account.id} account={account} />
                ))}
              </div>
            </TabsContent>

            {/* Platforms */}
            <TabsContent value="platforms" className="mt-4">
              <div className="grid grid-cols-3 gap-4">
                {(
                  Object.keys(PLATFORM_META) as Platform[]
                ).map((platform) => (
                  <PlatformConnectCard key={platform} platform={platform} />
                ))}
              </div>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="mt-4">
              <Card className="gap-4 py-6">
                <CardHeader className="items-center">
                  <ShieldCheckIcon className="size-10 text-muted-foreground/30" />
                  <CardTitle className="text-base">安全与权限</CardTitle>
                  <CardDescription>
                    所有平台授权令牌均加密存储于本地，不经过第三方服务器
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Token 加密存储
                        </p>
                        <p className="text-xs text-muted-foreground">
                          使用 AES-256 加密所有平台 access_token
                        </p>
                      </div>
                      <Badge className="border-green-500/30 bg-green-500/10 text-green-500">
                        已启用
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          自动续期提醒
                        </p>
                        <p className="text-xs text-muted-foreground">
                          授权过期前 7 天自动发送提醒通知
                        </p>
                      </div>
                      <Badge className="border-green-500/30 bg-green-500/10 text-green-500">
                        已启用
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">操作日志</p>
                        <p className="text-xs text-muted-foreground">
                          记录所有发布和授权操作的审计日志
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">
                        查看日志
                      </Button>
                    </div>
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
