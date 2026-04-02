"use client";

import Link from "next/link";

import { useStudioTask } from "@/core/studio";

type StudioTaskDetailPageProps = {
  params: Promise<{
    task_id: string;
  }>;
};

export default async function StudioTaskDetailPage({
  params,
}: StudioTaskDetailPageProps) {
  const { task_id } = await params;
  return <StudioTaskDetailClient taskId={task_id} />;
}

function StudioTaskDetailClient({ taskId }: { taskId: string }) {
  const { task, isLoading, error } = useStudioTask(taskId);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#0f0f10_0%,#17120f_100%)] px-8 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/studio"
          className="text-sm text-[#d8c0ac] underline decoration-dotted underline-offset-4"
        >
          返回创作工作台
        </Link>

        {isLoading ? (
          <p className="mt-6 text-sm text-[#d3cdc7]">正在加载任务详情...</p>
        ) : error ? (
          <p className="mt-6 text-sm text-[#f0a8a8]">
            任务详情加载失败: {error.message}
          </p>
        ) : !task ? (
          <p className="mt-6 text-sm text-[#d3cdc7]">任务不存在。</p>
        ) : (
          <>
            <header className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-[#d6a77a]">
                {task.agent_name}
              </p>
              <h1 className="mt-3 text-4xl font-semibold">{task.topic}</h1>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#ddd5cd]">
                <span>状态: {task.status}</span>
                <span>阶段: {task.current_stage}</span>
                <span>平台: {task.target_platform}</span>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-[#d3cdc7]">
                {task.brief}
              </p>
            </header>

            <section className="mt-6 rounded-3xl border border-white/10 bg-[#f5efe6] p-8 text-[#1c1814]">
              <h2 className="text-xl font-medium">阶段说明</h2>
              <div className="mt-5 space-y-3">
                {task.stage_notes.map((note, index) => (
                  <div
                    key={`${task.task_id}-note-${index}`}
                    className="rounded-2xl bg-white px-5 py-4 text-sm leading-7 shadow-[0_20px_40px_rgba(43,31,19,0.08)]"
                  >
                    {note}
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-xl font-medium">任务上下文</h2>
              <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <dt className="text-[#d6a77a]">Topic ID</dt>
                  <dd className="mt-2 text-[#f2ece5]">{task.topic_id || "-"}</dd>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <dt className="text-[#d6a77a]">Material IDs</dt>
                  <dd className="mt-2 text-[#f2ece5]">
                    {task.material_ids.length > 0
                      ? task.material_ids.join(", ")
                      : "暂无引用素材"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <dt className="text-[#d6a77a]">Created At</dt>
                  <dd className="mt-2 text-[#f2ece5]">
                    {new Date(task.created_at * 1000).toLocaleString()}
                  </dd>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <dt className="text-[#d6a77a]">Updated At</dt>
                  <dd className="mt-2 text-[#f2ece5]">
                    {new Date(task.updated_at * 1000).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
              <div className="rounded-3xl border border-white/10 bg-[#f5efe6] p-8 text-[#1c1814]">
                <h2 className="text-xl font-medium">来源热点</h2>
                {task.source_topic ? (
                  <div className="mt-5 rounded-2xl bg-white p-5 shadow-[0_20px_40px_rgba(43,31,19,0.08)]">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#8e6848]">
                      <span className="rounded-full bg-[#f4e4d3] px-3 py-1">
                        {task.source_topic.platform}
                      </span>
                      <span>热度 {task.source_topic.heat_score}</span>
                      <span>预测 {task.source_topic.predict_score}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">
                      {task.source_topic.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#5d534b]">
                      {task.source_topic.summary}
                    </p>
                    <p className="mt-4 rounded-2xl bg-[#faf4ec] p-4 text-sm leading-7 text-[#5f4a38]">
                      {task.source_topic.recommended_angle}
                    </p>
                    {task.source_topic.source_url ? (
                      <a
                        href={task.source_topic.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-block text-sm underline decoration-dotted underline-offset-4"
                      >
                        查看原始来源
                      </a>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-7 text-[#5d534b]">
                    当前任务还没有绑定热点来源。后续可以从热点中心直接推进任务，自动带入事件上下文。
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <h2 className="text-xl font-medium">素材上下文</h2>

                <div className="mt-5">
                  <h3 className="text-sm uppercase tracking-[0.18em] text-[#d6a77a]">
                    已引用素材
                  </h3>
                  {task.referenced_materials.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {task.referenced_materials.map((material) => (
                        <MaterialCard
                          key={material.material_id}
                          material={material}
                          href={`/materials/${material.material_id}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-[#d3cdc7]">
                      这个任务还没有显式绑定素材，可以稍后从素材文库补充参考文章。
                    </p>
                  )}
                </div>

                <div className="mt-8">
                  <h3 className="text-sm uppercase tracking-[0.18em] text-[#d6a77a]">
                    推荐素材
                  </h3>
                  {task.suggested_materials.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {task.suggested_materials.map((material) => (
                        <MaterialCard
                          key={material.material_id}
                          material={material}
                          href={`/materials/${material.material_id}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-[#d3cdc7]">
                      本地素材库里暂时没有明显相关的文章。把更多素材采集进来后，这里会自动给出推荐。
                    </p>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

type MaterialCardProps = {
  href: string;
  material: {
    material_id: string;
    title: string;
    source_type: string;
    tags: string[];
    excerpt: string;
    relevance_score: number;
    relation: string;
    url?: string | null;
  };
};

function MaterialCard({ href, material }: MaterialCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/15 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-base font-semibold text-[#f2ece5]">
          <Link
            href={href}
            className="underline decoration-dotted underline-offset-4"
          >
            {material.title}
          </Link>
        </h4>
        <span className="rounded-full bg-[#f4e4d3] px-3 py-1 text-xs text-[#8e6848]">
          相关度 {material.relevance_score}
        </span>
      </div>
      <p className="mt-2 text-sm text-[#d6a77a]">
        {material.source_type}
        {material.tags.length > 0 ? ` · ${material.tags.join(" / ")}` : ""}
      </p>
      <p className="mt-3 text-sm leading-7 text-[#d3cdc7]">
        {material.excerpt || "这篇素材还没有正文摘要。"}
      </p>
      <p className="mt-3 text-xs leading-6 text-[#b8aea5]">{material.relation}</p>
      {material.url ? (
        <a
          href={material.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-xs text-[#d8c0ac] underline decoration-dotted underline-offset-4"
        >
          打开原文链接
        </a>
      ) : null}
    </article>
  );
}
