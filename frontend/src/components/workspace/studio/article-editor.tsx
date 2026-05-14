"use client";

import { SaveIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/workspace/messages/markdown-content";
import { useUpdateArticle } from "@/core/studio/hooks";

interface ArticleEditorProps {
  taskId: string;
  title: string | null;
  markdown: string | null;
  readOnly?: boolean;
}

export function ArticleEditor({
  taskId,
  title,
  markdown,
  readOnly = false,
}: ArticleEditorProps) {
  const [localTitle, setLocalTitle] = useState(title ?? "");
  const [localMarkdown, setLocalMarkdown] = useState(markdown ?? "");
  const [isDirty, setIsDirty] = useState(false);
  const { mutate: saveArticle, isPending: isSaving } =
    useUpdateArticle(taskId);

  // Sync props -> local state when task data changes externally
  useEffect(() => {
    setLocalTitle(title ?? "");
    setLocalMarkdown(markdown ?? "");
    setIsDirty(false);
  }, [title, markdown]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalTitle(e.target.value);
      setIsDirty(true);
    },
    [],
  );

  const handleMarkdownChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalMarkdown(e.target.value);
      setIsDirty(true);
    },
    [],
  );

  const handleSave = useCallback(() => {
    saveArticle(
      { title: localTitle, markdown: localMarkdown },
      { onSuccess: () => setIsDirty(false) },
    );
  }, [saveArticle, localTitle, localMarkdown]);

  if (!markdown && !title) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
        文章还未生成，请先运行内容流水线
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Title input */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Input
          value={localTitle}
          onChange={handleTitleChange}
          placeholder="文章标题"
          disabled={readOnly}
          className="border-none text-base font-semibold shadow-none focus-visible:ring-0"
        />
        {!readOnly && (
          <Button
            size="sm"
            variant={isDirty ? "default" : "ghost"}
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="shrink-0"
          >
            <SaveIcon className="mr-1 size-3.5" />
            {isSaving ? "保存中..." : "保存"}
          </Button>
        )}
      </div>

      {/* Editor / Preview tabs */}
      <Tabs defaultValue="edit" className="flex min-h-0 flex-1 flex-col">
        <TabsList variant="line" className="mx-4">
          <TabsTrigger value="edit">编辑</TabsTrigger>
          <TabsTrigger value="preview">预览</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="min-h-0 flex-1">
          <Textarea
            value={localMarkdown}
            onChange={handleMarkdownChange}
            readOnly={readOnly}
            placeholder="Markdown 正文..."
            className="h-full resize-none rounded-none border-none font-mono text-sm focus-visible:ring-0"
          />
        </TabsContent>

        <TabsContent value="preview" className="min-h-0 flex-1 overflow-auto p-4">
          <article className="prose prose-sm dark:prose-invert mx-auto max-w-none">
            <MarkdownContent
              content={localMarkdown}
              isLoading={false}
              rehypePlugins={[]}
            />
          </article>
        </TabsContent>
      </Tabs>
    </div>
  );
}
