import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroCinematic } from "@/components/hero-cinematic";
import { HowItWorksRow } from "@/components/how-it-works-row";
import { LandingVerdictTeaser } from "@/components/landing-verdict-teaser";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <HeroCinematic />
        <HowItWorksRow />
        <LandingVerdictTeaser />
      </main>
      <SiteFooter />
    </>
  );
}
