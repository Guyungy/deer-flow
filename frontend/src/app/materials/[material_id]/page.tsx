"use client";

import Link from "next/link";

import { useMaterial } from "@/core/materials";

type MaterialDetailPageProps = {
  params: Promise<{
    material_id: string;
  }>;
};

export default async function MaterialDetailPage({
  params,
}: MaterialDetailPageProps) {
  const { material_id } = await params;
  return <MaterialDetailClient materialId={material_id} />;
}

function MaterialDetailClient({ materialId }: { materialId: string }) {
  const { material, isLoading, error } = useMaterial(materialId);

  return (
    <main className="min-h-screen bg-[#f6f2ea] px-8 py-10 text-[#1a1714]">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/materials"
          className="text-sm text-[#7c6b59] underline decoration-dotted underline-offset-4"
        >
          返回素材文库
        </Link>

        {isLoading ? (
          <p className="mt-6 text-sm text-[#6b6259]">正在加载素材详情...</p>
        ) : error ? (
          <p className="mt-6 text-sm text-[#8f3f3f]">
            素材详情加载失败: {error.message}
          </p>
        ) : !material ? (
          <p className="mt-6 text-sm text-[#6b6259]">素材不存在。</p>
        ) : (
          <>
            <header className="mt-6 rounded-3xl border border-[#dfd4c6] bg-white p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-[#9a7a5b]">
                {material.source_type}
              </p>
              <h1 className="mt-3 text-4xl font-semibold">{material.title}</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {material.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#f1e6d9] px-3 py-1 text-xs text-[#7d5c40]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {material.url ? (
                <a
                  href={material.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block text-sm text-[#7c6b59] underline decoration-dotted underline-offset-4"
                >
                  查看原始链接
                </a>
              ) : null}
            </header>

            <section className="mt-6 rounded-3xl border border-[#dfd4c6] bg-white p-8">
              <h2 className="text-xl font-medium">Markdown 正文</h2>
              <pre className="mt-5 overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-[#4a443d]">
                {material.content_markdown || "暂无正文内容。"}
              </pre>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
