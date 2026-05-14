"use client";

import { SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateStudioTask } from "@/core/studio/hooks";

const EXAMPLE_TOPICS = [
  "AI Agent 2025 年产品化趋势解读",
  "苹果 WWDC 最新动态深度分析",
  "大模型降价潮对创业者的影响",
  "跨境电商新政策全面解析",
];

export function StudioEmptyState() {
  const router = useRouter();
  const { mutateAsync: createTask, isPending } = useCreateStudioTask();
  const [topic, setTopic] = useState("");

  const handleCreate = useCallback(
    async (topicText: string) => {
      if (!topicText.trim()) return;
      const task = await createTask({ topic: topicText.trim() });
      router.push(`/workspace/studio/${task.task_id}`);
    },
    [createTask, router],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      void handleCreate(topic);
    },
    [handleCreate, topic],
  );

  return (
    <div className="flex h-full items-center justify-center p-8">
      <Card className="w-full max-w-lg gap-4 py-6">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <SparklesIcon className="size-5" />
            内容工作台
          </CardTitle>
          <CardDescription>
            输入你感兴趣的话题，AI 将自动完成选题评估、素材搜索、文章撰写和事实核查
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="输入话题关键词..."
              disabled={isPending}
              className="flex-1"
            />
            <Button type="submit" disabled={!topic.trim() || isPending}>
              {isPending ? "创建中..." : "开始"}
            </Button>
          </form>

          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">
              或者试试这些话题：
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_TOPICS.map((t) => (
                <Button
                  key={t}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => void handleCreate(t)}
                  disabled={isPending}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
