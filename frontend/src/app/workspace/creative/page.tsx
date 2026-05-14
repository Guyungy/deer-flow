"use client";

import {
  BookOpenIcon,
  ClockIcon,
  GlobeIcon,
  PenLineIcon,
  ShuffleIcon,
  SparklesIcon,
  UserIcon,
  WandSparklesIcon,
  CopyIcon,
  RefreshCwIcon,
} from "lucide-react";
import { useCallback, useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspaceBody,
  WorkspaceContainer,
  WorkspaceHeader,
} from "@/components/workspace/workspace-container";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Dimension types
// ---------------------------------------------------------------------------

interface Dimension {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  options: DimensionOption[];
}

interface DimensionOption {
  id: string;
  label: string;
  example: string;
}

const DIMENSIONS: Dimension[] = [
  {
    id: "style",
    icon: <PenLineIcon className="size-4" />,
    label: "文体转换",
    description: "改变文章的写作风格和文体",
    options: [
      { id: "news", label: "新闻通稿", example: "正式客观的新闻报道风格" },
      { id: "essay", label: "散文随笔", example: "优美抒情的散文风格" },
      { id: "speech", label: "演讲稿", example: "激情澎湃的演讲风格" },
      { id: "letter", label: "书信体", example: "温暖真诚的书信风格" },
      { id: "fairy", label: "童话故事", example: "充满想象的童话风格" },
      { id: "academic", label: "学术论文", example: "严谨规范的学术风格" },
    ],
  },
  {
    id: "perspective",
    icon: <GlobeIcon className="size-4" />,
    label: "视角切换",
    description: "从不同身份和立场重新解读",
    options: [
      { id: "investor", label: "投资人视角", example: "关注商业价值和回报率" },
      { id: "user", label: "用户视角", example: "关注体验和实用性" },
      { id: "critic", label: "评论家视角", example: "客观分析利弊得失" },
      { id: "teacher", label: "教育者视角", example: "深入浅出、循循善诱" },
      { id: "child", label: "孩子视角", example: "好奇天真的观察角度" },
    ],
  },
  {
    id: "spacetime",
    icon: <ClockIcon className="size-4" />,
    label: "时空穿越",
    description: "放到不同的时代和地点重新讲述",
    options: [
      { id: "ancient", label: "古代中国", example: "用文言文或古风叙述" },
      { id: "future", label: "2050年", example: "科幻未来视角" },
      { id: "medieval", label: "中世纪欧洲", example: "骑士与城堡的年代" },
      { id: "80s", label: "80年代", example: "改革开放初期的时代感" },
    ],
  },
  {
    id: "character",
    icon: <UserIcon className="size-4" />,
    label: "角色扮演",
    description: "以特定角色的口吻重新创作",
    options: [
      { id: "libai", label: "李白", example: "豪放浪漫的诗仙" },
      { id: "luxun", label: "鲁迅", example: "辛辣讽刺的文风" },
      { id: "jobs", label: "乔布斯", example: "极简主义的产品思维" },
      { id: "musk", label: "马斯克", example: "颠覆传统的第一性原理" },
      { id: "grandma", label: "邻居奶奶", example: "朴实温暖的生活智慧" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Demo output
// ---------------------------------------------------------------------------

const DEMO_OUTPUT = `## 致诸位看官的一封家书

列位乡亲父老，展信安好！

老朽李太白，自长安城中云游归来，听闻坊间有一奇物，名曰"人工智能"。此物非金非玉，却能吟诗作对、挥毫泼墨，当真是奇哉怪也！

想当年，老朽斗酒诗百篇，长安街上醉颠狂。如今这"AI"竟也能七步成诗，虽说韵律尚可，但终究少了几分酒气和仙气。

不过话说回来，这玩意儿帮忙写奏折、拟公文倒是一把好手。若是早有此物，老朽何须在翰林院里苦熬那些个应酬文章，早就骑着白鹿去名山大川逍遥快活去了！

此致，敬上。
太白 醉笔`;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CreativePage() {
  const [inputText, setInputText] = useState("");
  const [selectedDimension, setSelectedDimension] = useState<string>("style");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentDimension = DIMENSIONS.find((d) => d.id === selectedDimension);

  const handleGenerate = useCallback(() => {
    if (!inputText.trim() || !selectedOption) return;
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setOutput(DEMO_OUTPUT);
      setIsGenerating(false);
    }, 2000);
  }, [inputText, selectedOption]);

  return (
    <WorkspaceContainer>
      <WorkspaceHeader />
      <WorkspaceBody>
        <div className="w-full max-w-6xl p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <WandSparklesIcon className="size-5" />
              创意变换
            </h1>
            <p className="text-sm text-muted-foreground">
              同一素材，瞬间变身多种风格。突破AI创作边界，释放无限创意。
            </p>
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-6">
            {/* Left: Input side */}
            <div className="space-y-4">
              {/* Dimension selector */}
              <Card className="gap-3 py-4">
                <CardHeader className="px-4 py-0">
                  <CardTitle className="text-sm">选择变换维度</CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-0">
                  <div className="grid grid-cols-2 gap-2">
                    {DIMENSIONS.map((dim) => (
                      <button
                        key={dim.id}
                        onClick={() => {
                          setSelectedDimension(dim.id);
                          setSelectedOption(null);
                        }}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border p-3 text-left transition-colors",
                          selectedDimension === dim.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-accent/50",
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-md p-1.5",
                            selectedDimension === dim.id
                              ? "bg-primary/10 text-primary"
                              : "bg-muted",
                          )}
                        >
                          {dim.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{dim.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {dim.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Options */}
              {currentDimension && (
                <Card className="gap-3 py-4">
                  <CardHeader className="px-4 py-0">
                    <CardTitle className="text-sm">
                      {currentDimension.label}选项
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-0">
                    <div className="flex flex-wrap gap-2">
                      {currentDimension.options.map((opt) => (
                        <Button
                          key={opt.id}
                          size="sm"
                          variant={
                            selectedOption === opt.id ? "default" : "outline"
                          }
                          className="text-xs"
                          onClick={() => setSelectedOption(opt.id)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                    {selectedOption && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {
                          currentDimension.options.find(
                            (o) => o.id === selectedOption,
                          )?.example
                        }
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Text input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">原始素材</label>
                <Textarea
                  placeholder="粘贴你想要变换的文章内容..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={!inputText.trim() || !selectedOption || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <ShuffleIcon className="mr-1 size-4 animate-spin" />
                    创意变换中...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="mr-1 size-4" />
                    开始变换
                  </>
                )}
              </Button>
            </div>

            {/* Right: Output side */}
            <div className="space-y-4">
              <Card className="flex h-full flex-col gap-0 py-0">
                <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
                  <CardTitle className="text-sm">变换结果</CardTitle>
                  {output && (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="size-7">
                        <CopyIcon className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={handleGenerate}
                      >
                        <RefreshCwIcon className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <Separator />
                <CardContent className="flex-1 px-4 py-4">
                  {output ? (
                    <ScrollArea className="h-full">
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {output}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                      <WandSparklesIcon className="size-10 opacity-30" />
                      <div className="text-center text-sm">
                        <p>选择变换维度和选项</p>
                        <p>输入素材后点击"开始变换"</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </WorkspaceBody>
    </WorkspaceContainer>
  );
}
