import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Quote, Zap, Sparkles } from "lucide-react";

export const metadata = {
  title: "How it works — RefCheck AI",
};

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl px-6 py-16 md:py-24">
        <header className="mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
            How it works
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] md:text-6xl">
            Rulebook-grounded AI for sports officiating.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Every weekend, millions of fans argue about referee calls. RefCheck AI
            is the first tool that answers the question — <em>was it a fair call?</em> — by
            watching the clip with a multimodal model and checking it against the
            actual text of the rulebook.
          </p>
        </header>

        <section className="mb-16">
          <h2 className="font-display text-3xl">The pipeline</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Four steps, two Gemini calls, one verdict. Nothing gets to the
            verdict card unless every rule quote is a verbatim match against the
            NBA rulebook text we shipped with the app.
          </p>
          <div className="mt-8">
            <ArchitectureDiagram />
          </div>

          <ol className="mt-10 grid gap-4 md:grid-cols-2">
            <Step
              icon={<Zap className="size-4 text-accent" />}
              num="01"
              title="Upload to Gemini"
              body="The server action uploads the clip to the Gemini Files API and waits for it to go ACTIVE."
            />
            <Step
              icon={<Quote className="size-4 text-accent" />}
              num="02"
              title="Observe the play"
              body="Stage 3 returns a neutral play description, player roles, contact level, and candidate rule tags — never a verdict."
            />
            <Step
              icon={<ShieldCheck className="size-4 text-accent" />}
              num="03"
              title="Pull rulebook text"
              body="The server deterministically selects up to six rule excerpts from lib/rules/basketball.ts using the candidate tags."
            />
            <Step
              icon={<Sparkles className="size-4 text-accent" />}
              num="04"
              title="Synthesize + validate"
              body="Stage 5 returns the verdict plus rule citations. We strip any citation whose quote is not verbatim in our rule text, and downgrade to Inconclusive if nothing valid remains."
            />
          </ol>
        </section>

        <section className="mb-16 grid gap-6 rounded-[var(--radius-card)] border border-border-subtle bg-surface p-6 md:grid-cols-2 md:p-8">
          <div>
            <h2 className="font-display text-2xl">What it does</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>Analyzes short NBA-style basketball clips (up to 20s, 10 MB).</li>
              <li>Scopes v1 to block/charge, shooting fouls, offensive fouls, traveling, goaltending, and out-of-bounds calls.</li>
              <li>Returns Fair / Bad / Inconclusive with a 0–100 confidence score.</li>
              <li>Cites the rulebook verbatim — every quote is server-validated.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl">What it does not</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>Replace official video review. Our verdicts are advisory.</li>
              <li>Handle multi-angle replay reasoning. We see one camera.</li>
              <li>Cover every NBA rule — we shipped the most demo-relevant excerpts first.</li>
              <li>Support other sports in v1. The rulebook module is designed to be swapped in.</li>
            </ul>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="font-display text-3xl">The stack</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "Google Gemini 2.5 Pro",
              "Next.js 15 App Router",
              "React 19",
              "TypeScript",
              "Tailwind CSS v4",
              "Framer Motion",
              "Zod",
              "Radix UI",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full border border-border-subtle bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-5 max-w-2xl text-sm text-muted">
            Rules sourced from the{" "}
            <a
              href="https://official.nba.com/rulebook/"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline decoration-accent/60 underline-offset-4 hover:decoration-accent"
            >
              NBA Official Rulebook
            </a>
            . Rule text is included verbatim in <code className="font-mono text-xs">lib/rules/basketball.ts</code>.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="font-display text-3xl">Coming soon</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>More basketball call types (defensive three-seconds, restricted-area secondary-defender edge cases, kicked-ball).</li>
            <li>More sports — starting with soccer or football, each in its own <code className="font-mono text-xs">lib/rules/&lt;sport&gt;.ts</code>.</li>
            <li>
              Officiating crew identification — link a game date plus teams to a public box-score source, surface the officials, and track performance over time.
            </li>
          </ul>
        </section>

        <section className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-accent/40 bg-accent/5 p-6">
          <div className="flex-1">
            <h2 className="font-display text-2xl">Try it yourself</h2>
            <p className="mt-1 text-sm text-muted">
              Pick one of the four sample plays, or upload your own 20-second
              clip.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/analyze">
              Analyze a play
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Step({
  icon,
  num,
  title,
  body,
}: {
  icon: React.ReactNode;
  num: string;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-[var(--radius-card)] border border-border-subtle bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {num}
        </span>
        {icon}
      </div>
      <h3 className="mt-3 font-display text-xl">{title}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">{body}</p>
    </li>
  );
}
