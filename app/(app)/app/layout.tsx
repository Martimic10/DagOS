import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { AppGate } from "@/components/app/AppGate";
import { CommandPalette } from "@/components/app/CommandPalette";
import { SystemStatusBar } from "@/components/app/SystemStatusBar";
import { DesktopAuthBridge } from "@/components/app/DesktopAuthBridge";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppGate>
      <DesktopAuthBridge />
      {/* Status bar: h-8 (32px) fixed at top */}
      <SystemStatusBar />
      <div className="min-h-screen bg-zinc-950 pt-8">
        <Sidebar />
        <Topbar />
        <CommandPalette />
        <main className="ml-56 pt-14">
          <div className="min-h-[calc(100vh-3.5rem)] p-6">
            {children}
          </div>
        </main>
      </div>
    </AppGate>
  );
}
