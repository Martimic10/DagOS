import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { AppGate } from "@/components/app/AppGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppGate>
      <div className="min-h-screen bg-zinc-950">
        <Sidebar />
        <Topbar />
        <main className="ml-56 pt-14">
          <div className="min-h-[calc(100vh-3.5rem)] p-6">
            {children}
          </div>
        </main>
      </div>
    </AppGate>
  );
}
