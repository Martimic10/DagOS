// Dashboard mock data

export const throughputData24h = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0") + ":00";
  const base = 2000 + Math.sin((i / 24) * Math.PI * 2) * 1200;
  const noise = (Math.random() - 0.5) * 800;
  return { hour, value: Math.max(0, Math.round(base + noise)) };
});

// Deterministic version for SSR
export const throughputData24hStatic = [
  { hour: "00:00", value: 1240 },
  { hour: "01:00", value: 890 },
  { hour: "02:00", value: 540 },
  { hour: "03:00", value: 320 },
  { hour: "04:00", value: 210 },
  { hour: "05:00", value: 480 },
  { hour: "06:00", value: 1080 },
  { hour: "07:00", value: 2260 },
  { hour: "08:00", value: 3740 },
  { hour: "09:00", value: 4510 },
  { hour: "10:00", value: 5080 },
  { hour: "11:00", value: 4760 },
  { hour: "12:00", value: 5340 },
  { hour: "13:00", value: 4880 },
  { hour: "14:00", value: 5620 },
  { hour: "15:00", value: 6180 },
  { hour: "16:00", value: 5860 },
  { hour: "17:00", value: 4940 },
  { hour: "18:00", value: 4220 },
  { hour: "19:00", value: 3740 },
  { hour: "20:00", value: 3120 },
  { hour: "21:00", value: 2460 },
  { hour: "22:00", value: 1920 },
  { hour: "23:00", value: 1540 },
];

// Slices of 24h data for shorter ranges
export const throughputData6h = [
  { hour: "18:00", value: 4220 },
  { hour: "19:00", value: 3740 },
  { hour: "20:00", value: 3120 },
  { hour: "21:00", value: 2460 },
  { hour: "22:00", value: 1920 },
  { hour: "23:00", value: 1540 },
];

export const throughputData1h = [
  { hour: "22:00", value: 2010 },
  { hour: "22:15", value: 1870 },
  { hour: "22:30", value: 1950 },
  { hour: "22:45", value: 1540 },
];

export const throughputData7d = [
  { hour: "Mon", value: 3840 },
  { hour: "Tue", value: 5620 },
  { hour: "Wed", value: 4980 },
  { hour: "Thu", value: 6180 },
  { hour: "Fri", value: 5340 },
  { hour: "Sat", value: 2760 },
  { hour: "Sun", value: 2120 },
];

export const throughputData30d = [
  { hour: "Wk 1", value: 28400 },
  { hour: "Wk 2", value: 34100 },
  { hour: "Wk 3", value: 41200 },
  { hour: "Wk 4", value: 38600 },
];

export const requestsData30d = [
  { day: "Wk 1", value: 26400 },
  { day: "Wk 2", value: 31800 },
  { day: "Wk 3", value: 38900 },
  { day: "Wk 4", value: 34200 },
];

export const requestsData1d = [
  { day: "06:00", value: 1080 },
  { day: "10:00", value: 3740 },
  { day: "14:00", value: 5620 },
  { day: "18:00", value: 4220 },
  { day: "22:00", value: 1920 },
];

export const requestsData7d = [
  { day: "Mon", value: 4320 },
  { day: "Tue", value: 6180 },
  { day: "Wed", value: 5240 },
  { day: "Thu", value: 7640 },
  { day: "Fri", value: 8920 },
  { day: "Sat", value: 3480 },
  { day: "Sun", value: 2760 },
];

export const incidentFlowData = [
  { hour: "00:00", value: 2 },
  { hour: "02:00", value: 1 },
  { hour: "04:00", value: 0 },
  { hour: "06:00", value: 3 },
  { hour: "08:00", value: 7 },
  { hour: "10:00", value: 12 },
  { hour: "12:00", value: 9 },
  { hour: "14:00", value: 14 },
  { hour: "16:00", value: 11 },
  { hour: "18:00", value: 8 },
  { hour: "20:00", value: 5 },
  { hour: "22:00", value: 3 },
];

export const incidentVolumeData = [
  { name: "llama3:8b", value: 34 },
  { name: "mistral:7b", value: 27 },
  { name: "codellama:13b", value: 18 },
  { name: "phi3:mini", value: 12 },
  { name: "deepseek:6.7b", value: 9 },
  { name: "gemma2:9b", value: 6 },
];

export type ModelStatus = "Running" | "Idle" | "Stopped";

export const runningModelsList: {
  name: string;
  size: string;
  status: ModelStatus;
  tokens: string;
  uptime: string;
}[] = [
  { name: "llama3:8b", size: "4.7 GB", status: "Running", tokens: "42 t/s", uptime: "4h 12m" },
  { name: "mistral:7b", size: "4.1 GB", status: "Running", tokens: "38 t/s", uptime: "2h 47m" },
  { name: "deepseek-coder:6.7b", size: "3.8 GB", status: "Running", tokens: "51 t/s", uptime: "1h 03m" },
  { name: "codellama:13b", size: "7.4 GB", status: "Idle", tokens: "0 t/s", uptime: "22m" },
  { name: "phi3:mini", size: "2.3 GB", status: "Stopped", tokens: "—", uptime: "—" },
  { name: "gemma2:9b", size: "5.5 GB", status: "Stopped", tokens: "—", uptime: "—" },
];

export type ActivityStatus = "Success" | "Warning" | "Error";

export const recentActivity: {
  time: string;
  model: string;
  route: string;
  latency: string;
  status: ActivityStatus;
}[] = [
  { time: "15:42:03", model: "llama3:8b", route: "/api/chat", latency: "142ms", status: "Success" },
  { time: "15:41:58", model: "mistral:7b", route: "/api/generate", latency: "89ms", status: "Success" },
  { time: "15:41:44", model: "deepseek-coder:6.7b", route: "/api/chat", latency: "203ms", status: "Success" },
  { time: "15:41:29", model: "codellama:13b", route: "/api/embeddings", latency: "5420ms", status: "Error" },
  { time: "15:41:17", model: "llama3:8b", route: "/api/chat", latency: "118ms", status: "Success" },
  { time: "15:40:55", model: "mistral:7b", route: "/api/generate", latency: "1840ms", status: "Warning" },
  { time: "15:40:41", model: "phi3:mini", route: "/api/chat", latency: "67ms", status: "Success" },
  { time: "15:40:28", model: "llama3:8b", route: "/api/generate", latency: "156ms", status: "Success" },
  { time: "15:40:12", model: "gemma2:9b", route: "/api/chat", latency: "8210ms", status: "Error" },
  { time: "15:39:58", model: "deepseek-coder:6.7b", route: "/api/embeddings", latency: "310ms", status: "Warning" },
  { time: "15:39:43", model: "llama3:8b", route: "/api/chat", latency: "99ms", status: "Success" },
  { time: "15:39:30", model: "mistral:7b", route: "/api/generate", latency: "134ms", status: "Success" },
];

export const kpiCards = [
  {
    label: "System Throughput",
    value: "6,180",
    unit: "t/s",
    delta: "+8% vs last 24h",
    deltaPositive: true,
    icon: "Zap",
  },
  {
    label: "Running Models",
    value: "3",
    unit: "active",
    delta: "+1 since yesterday",
    deltaPositive: true,
    icon: "Cpu",
  },
  {
    label: "Found Errors",
    value: "14",
    unit: "7 days",
    delta: "-3 vs last week",
    deltaPositive: true,
    icon: "AlertTriangle",
  },
  {
    label: "VRAM Usage",
    value: "11.4",
    unit: "GB",
    delta: "of 16 GB total",
    deltaPositive: null,
    icon: "MemoryStick",
  },
];
