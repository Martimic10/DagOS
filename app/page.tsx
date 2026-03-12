import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { UseCases } from "@/components/landing/UseCases";
import { Screenshots } from "@/components/landing/Screenshots";
import { OpenSource } from "@/components/landing/OpenSource";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100 overflow-x-hidden">
      {/* Global background: grid + radial glows */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.13)_0%,transparent_65%)]" />
        <div className="absolute top-1/3 right-0 w-[600px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.07)_0%,transparent_65%)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(49,46,129,0.08)_0%,transparent_65%)]" />
      </div>

      <Header />
      <main>
        <Hero />
        <Features />
        <UseCases />
        <Screenshots />
        <OpenSource />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
