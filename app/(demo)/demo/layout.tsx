import { DemoBanner } from "@/components/demo/DemoBanner";
import { DemoSidebar } from "@/components/demo/DemoSidebar";
import { DemoTopbar } from "@/components/demo/DemoTopbar";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Full-width banner above everything */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <DemoBanner />
      </div>

      <DemoSidebar />
      <DemoTopbar />

      <main className="ml-56 pt-[6.75rem]">
        <div className="min-h-[calc(100vh-6.75rem)] p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
