import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { ModelCarousel } from "@/components/landing/ModelCarousel";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { LivePreview } from "@/components/landing/LivePreview";
import { Quickstart } from "@/components/landing/Quickstart";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(39,39,42,0.5),transparent)]">
      <Header />
      <main>
        <Hero />
        <ModelCarousel />
        <FeatureBento />
        <LivePreview />
        <Quickstart />
      </main>
      <Footer />
    </div>
  );
}
