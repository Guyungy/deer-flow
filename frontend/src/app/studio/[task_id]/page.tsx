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
      <div className="mx-auto max-w-5xl">
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
          </>
        )}
      </div>
    </main>
  );
}
