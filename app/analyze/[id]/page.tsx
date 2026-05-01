import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { VerdictClient } from "@/components/verdict-client";

export default async function VerdictPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
        <VerdictClient analysisId={id} />
      </main>
      <SiteFooter />
    </>
  );
}
