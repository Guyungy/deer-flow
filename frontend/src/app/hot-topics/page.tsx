"use client";

import { useCreateStudioTask } from "@/core/studio";
import { useHotTopics, useRefreshHotTopics } from "@/core/hot-topics";

export default function HotTopicsPage() {
  const { topics, isLoading, error } = useHotTopics();
  const refreshMutation = useRefreshHotTopics();
  const createTask = useCreateStudioTask();

  return (
    <main className="min-h-screen bg-[#f5f1e8] px-8 py-10 text-[#1f1d1a]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#8b5e3c]">
              AIWriteX on DeerFlow
            </p>
            <h1 className="mt-3 text-4xl font-semibold">热点中心</h1>
            <p className="mt-3 max-w-3xl text-base text-[#5b534a]">
              第一版热点中心已接入真实搜索聚合。现在可以刷新热点候选，并把热点直接推进到创作工作台。
            </p>
          </div>
          <button
            className="rounded-full bg-[#1d1b18] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            disabled={refreshMutation.isPending}
            onClick={() => {
              void refreshMutation.mutateAsync();
            }}
          >
            {refreshMutation.isPending ? "刷新中..." : "刷新热点"}
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-[#6f665d]">正在加载热点数据...</p>
        ) : error ? (
          <p className="text-sm text-[#8f3f3f]">
            热点数据加载失败: {error.message}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {topics.map((topic) => (
              <section
                key={topic.topic_id}
                className="rounded-3xl border border-[#d9c9b6] bg-white p-6 shadow-[0_18px_40px_rgba(80,54,28,0.08)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#efe0cb] px-3 py-1 text-xs text-[#7a4d2f]">
                      {topic.platform}
                    </span>
                    {topic.blackhorse ? (
                      <span className="rounded-full bg-[#2d5b43] px-3 py-1 text-xs text-white">
                        黑马
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#8b5e3c]">
                    <span>热度 {topic.heat_score}</span>
                    <span>预测 {topic.predict_score}</span>
                  </div>
                </div>
                <h2 className="mt-4 text-2xl font-medium">{topic.title}</h2>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#90745d]">
                  Query: {topic.query}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#5b534a]">
                  {topic.summary}
                </p>
                <div className="mt-4 rounded-2xl bg-[#faf4ec] p-4 text-sm text-[#5f4a38]">
                  <p className="font-medium">推荐切入角</p>
                  <p className="mt-2 leading-6">{topic.recommended_angle}</p>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#7f7368]">
                    {topic.source_site ? `来源站点: ${topic.source_site}` : "来源站点待确认"}
                  </div>
                  <button
                    className="rounded-full border border-[#d7c7b5] px-4 py-2 text-sm font-medium text-[#5a4331] disabled:opacity-60"
                    disabled={createTask.isPending}
                    onClick={() => {
                      void createTask.mutateAsync({
                        topic: topic.title,
                        topic_id: topic.topic_id,
                        target_platform: "wechat",
                        agent_name: "news-room",
                      });
                    }}
                  >
                    推进到创作台
                  </button>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
