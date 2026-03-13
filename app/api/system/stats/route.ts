import os from "os";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cpuPercent(): number {
  const cpus = os.cpus();
  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
  for (const cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys  += cpu.times.sys;
    idle += cpu.times.idle;
    irq  += cpu.times.irq;
  }
  const total = user + nice + sys + idle + irq;
  const used  = total - idle;
  return Math.round((used / total) * 100);
}

export async function GET() {
  const totalMem = os.totalmem();
  const freeMem  = os.freemem();
  const usedMem  = totalMem - freeMem;

  return NextResponse.json({
    ok: true,
    cpu: cpuPercent(),
    memUsedGB: parseFloat((usedMem  / 1_073_741_824).toFixed(1)),
    memTotalGB: parseFloat((totalMem / 1_073_741_824).toFixed(1)),
    memPercent: Math.round((usedMem / totalMem) * 100),
    uptime: Math.floor(os.uptime()),
    platform: os.platform(),
  });
}
