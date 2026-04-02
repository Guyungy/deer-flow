"use client";

import Link from "next/link";
import { useState } from "react";

import { useCreateMaterial, useMaterials } from "@/core/materials";

export default function MaterialsPage() {
  const { materials, isLoading, error } = useMaterials();
  const createMaterial = useCreateMaterial();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [sourceType, setSourceType] = useState("manual");
  const [tags, setTags] = useState("");

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-8 py-10 text-[#171717]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-[#51606b]">
            Local Knowledge Base
          </p>
          <h1 className="mt-3 text-4xl font-semibold">素材文库</h1>
          <p className="mt-3 max-w-3xl text-base text-[#525252]">
            第一阶段已经打通本地素材落盘、列表读取和详情预览。现在支持手动录入和链接采集，下一步继续补正文清洗、标签增强和语义检索。
          </p>
        </div>

        <section className="mb-8 rounded-3xl border border-[#d8d8d2] bg-white p-6">
          <h2 className="text-xl font-medium">快速录入素材</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="素材标题，可选"
              className="rounded-2xl border border-[#d8d8d2] px-4 py-3 outline-none"
            />
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="文章链接，可选"
              className="rounded-2xl border border-[#d8d8d2] px-4 py-3 outline-none"
            />
            <input
              value={sourceType}
              onChange={(event) => setSourceType(event.target.value)}
              placeholder="来源类型，例如 manual / web / wechat"
              className="rounded-2xl border border-[#d8d8d2] px-4 py-3 outline-none"
            />
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="标签，逗号分隔"
              className="rounded-2xl border border-[#d8d8d2] px-4 py-3 outline-none"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-[#1c1c1c] px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={
                (!title.trim() && !url.trim()) || createMaterial.isPending
              }
              onClick={() => {
                void createMaterial.mutateAsync({
                  title: title.trim() || undefined,
                  url: url.trim() || undefined,
                  source_type: sourceType.trim() || "manual",
                  tags: tags
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                });
                setTitle("");
                setUrl("");
                setTags("");
              }}
            >
              {createMaterial.isPending ? "保存中..." : "写入素材库"}
            </button>
            <p className="self-center text-sm text-[#6b6b6b]">
              输入链接时会尝试自动抓取正文并保存 Markdown。
            </p>
          </div>
          {createMaterial.error ? (
            <p className="mt-3 text-sm text-[#8f3f3f]">
              写入失败: {createMaterial.error.message}
            </p>
          ) : null}
        </section>

        {isLoading ? (
          <p className="text-sm text-[#6b6b6b]">正在加载素材...</p>
        ) : error ? (
          <p className="text-sm text-[#8f3f3f]">素材加载失败: {error.message}</p>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-[#d8d8d2] bg-white">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-[#ece9e1] px-6 py-4 text-sm text-[#6b6b6b]">
              <span>标题</span>
              <span>来源</span>
              <span>链接</span>
              <span>标签</span>
            </div>
            {materials.length === 0 ? (
              <div className="px-6 py-8 text-sm text-[#6b6b6b]">
                暂无素材，先录入一条或抓取一篇文章试试。
              </div>
            ) : (
              materials.map((item) => (
                <div
                  key={item.material_id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-5 text-sm"
                >
                  <span className="font-medium text-[#1f1f1f]">
                    <Link
                      href={`/materials/${item.material_id}`}
                      className="underline decoration-dotted underline-offset-4"
                    >
                      {item.title}
                    </Link>
                  </span>
                  <span className="text-[#575757]">{item.source_type}</span>
                  <span className="truncate text-[#575757]">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-dotted underline-offset-4"
                      >
                        查看链接
                      </a>
                    ) : (
                      "-"
                    )}
                  </span>
                  <span className="text-[#575757]">
                    {item.tags.join(", ") || "-"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
