"use client";

import {
  BookOpenIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FolderOpenIcon,
  ImageIcon,
  ImportIcon,
  LinkIcon,
  SearchIcon,
  TagIcon,
  Trash2Icon,
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
// Demo data
// ---------------------------------------------------------------------------

interface MaterialItem {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  type: "article" | "image" | "video" | "document";
  tags: string[];
  summary: string;
  savedAt: string;
  wordCount: number;
  hasImages: boolean;
}

const DEMO_MATERIALS: MaterialItem[] = [
  {
    id: "m1",
    title: "2025年AI写作工具全面评测：10款工具横向对比",
    source: "AI前沿观察",
    sourceUrl: "https://example.com",
    type: "article",
    tags: ["AI写作", "工具评测", "效率"],
    summary:
      "本文对市面上主流的10款AI写作工具进行了全面对比，从生成质量、速度、价格、中文能力等多个维度进行评分...",
    savedAt: "2025-04-03",
    wordCount: 5200,
    hasImages: true,
  },
  {
    id: "m2",
    title: "公众号爆文结构拆解：为什么这篇文章能10万+",
    source: "新媒体研究所",
    sourceUrl: "https://example.com",
    type: "article",
    tags: ["爆文", "公众号", "写作技巧"],
    summary:
      "通过对100篇10万+公众号文章的结构拆解，总结出爆文的5大共性特征：悬念标题、痛点开头、金句密度...",
    savedAt: "2025-04-02",
    wordCount: 3800,
    hasImages: false,
  },
  {
    id: "m3",
    title: "小红书爆款笔记封面设计模板合集",
    source: "设计师小李",
    sourceUrl: "https://example.com",
    type: "image",
    tags: ["小红书", "封面设计", "模板"],
    summary: "精选50款小红书爆款笔记封面模板，涵盖美妆、穿搭、美食、旅行等品类...",
    savedAt: "2025-04-01",
    wordCount: 0,
    hasImages: true,
  },
  {
    id: "m4",
    title: "跨境电商选品方法论：从0到月销百万的实战指南",
    source: "跨境老王",
    sourceUrl: "https://example.com",
    type: "article",
    tags: ["跨境电商", "选品", "实战"],
    summary:
      "系统梳理了跨境电商选品的全流程方法论，包括市场调研、竞品分析、利润测算、供应商筛选等关键环节...",
    savedAt: "2025-03-30",
    wordCount: 8500,
    hasImages: true,
  },
  {
    id: "m5",
    title: "短视频脚本写作万能公式：3分钟让观众看到最后",
    source: "短视频学院",
    sourceUrl: "https://example.com",
    type: "document",
    tags: ["短视频", "脚本", "抖音"],
    summary:
      "揭秘短视频脚本的黄金结构：3秒钩子 + 痛点放大 + 解决方案 + 行动号召。附带20个行业模板...",
    savedAt: "2025-03-28",
    wordCount: 4200,
    hasImages: false,
  },
];

const ALL_TAGS = Array.from(new Set(DEMO_MATERIALS.flatMap((m) => m.tags)));

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TypeIcon({ type }: { type: MaterialItem["type"] }) {
  switch (type) {
    case "article":
      return <FileTextIcon className="size-4 text-blue-500" />;
    case "image":
      return <ImageIcon className="size-4 text-green-500" />;
    case "document":
      return <BookOpenIcon className="size-4 text-orange-500" />;
    default:
      return <FileTextIcon className="size-4" />;
  }
}

function MaterialCard({ item }: { item: MaterialItem }) {
  return (
    <div className="group rounded-lg border p-4 transition-colors hover:bg-accent/30">
      <div className="flex items-start gap-3">
        <div className="mt-1 rounded-md bg-muted p-2">
          <TypeIcon type={item.type} />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium">{item.title}</h3>
          </div>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {item.summary}
          </p>
          <div className="flex items-center gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <LinkIcon className="size-3" />
              {item.source}
            </span>
            {item.wordCount > 0 && <span>{item.wordCount} 字</span>}
            <span>{item.savedAt}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="icon" variant="ghost" className="size-7">
            <ExternalLinkIcon className="size-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="size-7">
            <DownloadIcon className="size-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="size-7 text-red-500">
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MaterialsPage() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filtered = DEMO_MATERIALS.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchTag = !selectedTag || m.tags.includes(selectedTag);
    return matchSearch && matchTag;
  });

  return (
    <WorkspaceContainer>
      <WorkspaceHeader />
      <WorkspaceBody>
        <div className="w-full max-w-5xl space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">素材文库</h1>
              <p className="text-sm text-muted-foreground">
                你的私有化内容资产管理系统，共{" "}
                {DEMO_MATERIALS.length} 篇素材
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ImportIcon className="mr-1 size-3.5" />
                采集公众号文章
              </Button>
              <Button size="sm">
                <FolderOpenIcon className="mr-1 size-3.5" />
                导入本地文件
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="语义搜索素材（不只是关键词匹配）..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Tag filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedTag === null ? "default" : "outline"}
              className="text-xs"
              onClick={() => setSelectedTag(null)}
            >
              全部
            </Button>
            {ALL_TAGS.map((tag) => (
              <Button
                key={tag}
                size="sm"
                variant={selectedTag === tag ? "default" : "outline"}
                className="text-xs"
                onClick={() =>
                  setSelectedTag(selectedTag === tag ? null : tag)
                }
              >
                <TagIcon className="mr-1 size-3" />
                {tag}
              </Button>
            ))}
          </div>

          <Separator />

          {/* Material list */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                <FolderOpenIcon className="mx-auto mb-3 size-8 opacity-50" />
                没有找到匹配的素材
              </div>
            ) : (
              filtered.map((item) => (
                <MaterialCard key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      </WorkspaceBody>
    </WorkspaceContainer>
  );
}
