import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AnalyzeForm } from "@/components/analyze-form";
import { HistoryList } from "@/components/history-list";

export const metadata = {
  title: "Analyze a Play — RefCheck AI",
};

export default function AnalyzePage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl px-6 py-16 md:py-24">
        <header className="mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
            Analyze a play
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] md:text-6xl">
            Was it a fair call?
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Pick one of our sample plays, or upload your own short basketball
            clip. Optionally tell us what the ref called — we&apos;ll compare
            the play to the NBA rulebook and return a cited verdict.
          </p>
        </header>

        <AnalyzeForm />
        <HistoryList />
      </main>
      <SiteFooter />
    </>
  );
}
