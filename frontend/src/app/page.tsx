import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { CaseStudySection } from "@/components/landing/sections/case-study-section";
import { CommunitySection } from "@/components/landing/sections/community-section";
import { SandboxSection } from "@/components/landing/sections/sandbox-section";
import { SkillsSection } from "@/components/landing/sections/skills-section";
import { WhatsNewSection } from "@/components/landing/sections/whats-new-section";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a]">
      <Header />
      <main className="flex w-full flex-col">
        <Hero />
        <CaseStudySection />
        <SkillsSection />
        <SandboxSection />
        <WhatsNewSection />
        <CommunitySection />
        <section className="mx-auto mb-20 w-full max-w-6xl px-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d6a77a]">
              AIWriteX Blueprint
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              内容专版工作台已开始在 DeerFlow 内落地
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/hot-topics"
                className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
              >
                热点中心
              </Link>
              <Link
                href="/materials"
                className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white"
              >
                素材文库
              </Link>
              <Link
                href="/studio"
                className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white"
              >
                创作工作台
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
