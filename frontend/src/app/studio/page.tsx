"use client";

import Link from "next/link";
import { useState } from "react";

import { useCreateStudioTask, useStudioTasks } from "@/core/studio";

const stages = [
  "选题分析",
  "素材检索",
  "大纲生成",
  "初稿写作",
  "审校优化",
  "排版发布",
];

export default function StudioPage() {
  const { tasks, isLoading, error } = useStudioTasks();
  const createTask = useCreateStudioTask();
  const [topic, setTopic] = useState("");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#111111_0%,#17120f_100%)] px-8 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-[#d6a77a]">
            Newsroom Studio
          </p>
          <h1 className="mt-3 text-4xl font-semibold">创作工作台</h1>
          <p className="mt-3 max-w-3xl text-base text-[#d3cdc7]">
            现在已经接上第一版 studio task API，可以创建内容任务、落盘保存，并进入任务详情页查看上下文。
          </p>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-medium">创建内容任务</h2>
          <div className="mt-4 flex flex-col gap-4 md:flex-row">
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="输入主题，例如：AI Agent 产品化"
              className="flex-1 rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-white outline-none placeholder:text-[#a9a39d]"
            />
            <button
              className="rounded-full bg-[#d6a77a] px-5 py-3 text-sm font-semibold text-[#1f150f] disabled:opacity-60"
              disabled={!topic.trim() || createTask.isPending}
              onClick={() => {
                void createTask.mutateAsync({ topic: topic.trim() });
                setTopic("");
              }}
            >
              {createTask.isPending ? "创建中..." : "新建任务"}
            </button>
          </div>
          {createTask.error ? (
            <p className="mt-3 text-sm text-[#f0a8a8]">
              任务创建失败: {createTask.error.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-medium">工作流阶段</h2>
            <div className="mt-5 space-y-3">
              {stages.map((stage, index) => (
                <div
                  key={stage}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/15 px-4 py-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d6a77a] text-sm font-semibold text-[#1f150f]">
                    {index + 1}
                  </div>
                  <span className="text-sm text-[#f2ece5]">{stage}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#f5efe6] p-6 text-[#1c1814]">
            <h2 className="text-xl font-medium">任务列表</h2>
            {isLoading ? (
              <p className="mt-4 text-sm text-[#65594f]">正在加载任务...</p>
            ) : error ? (
              <p className="mt-4 text-sm text-[#8f3f3f]">
                任务加载失败: {error.message}
              </p>
            ) : tasks.length === 0 ? (
              <p className="mt-4 text-sm leading-7 text-[#554b43]">
                还没有 studio 任务，先创建一个主题试试。
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.task_id}
                    className="rounded-2xl bg-white p-5 shadow-[0_20px_40px_rgba(43,31,19,0.08)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold">
                        <Link
                          href={`/studio/${task.task_id}`}
                          className="underline decoration-dotted underline-offset-4"
                        >
                          {task.topic}
                        </Link>
                      </h3>
                      <span className="rounded-full bg-[#f4e4d3] px-3 py-1 text-xs text-[#8e6848]">
                        {task.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-[#65594f]">
                      当前阶段: {task.current_stage} | 平台: {task.target_platform}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-[#7a6f65]">
                      {task.brief}
                    </p>
                    <p className="mt-1 text-xs text-[#8f8478]">
                      Task ID: {task.task_id}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
