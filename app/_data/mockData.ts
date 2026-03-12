// Mock data for DagOS landing page

export const tokenChartData = [
  { hour: "00:00", tokens: 1200 },
  { hour: "01:00", tokens: 840 },
  { hour: "02:00", tokens: 520 },
  { hour: "03:00", tokens: 310 },
  { hour: "04:00", tokens: 190 },
  { hour: "05:00", tokens: 460 },
  { hour: "06:00", tokens: 1100 },
  { hour: "07:00", tokens: 2340 },
  { hour: "08:00", tokens: 3800 },
  { hour: "09:00", tokens: 4620 },
  { hour: "10:00", tokens: 5100 },
  { hour: "11:00", tokens: 4780 },
  { hour: "12:00", tokens: 5320 },
  { hour: "13:00", tokens: 4900 },
  { hour: "14:00", tokens: 5640 },
  { hour: "15:00", tokens: 6200 },
  { hour: "16:00", tokens: 5880 },
  { hour: "17:00", tokens: 4960 },
  { hour: "18:00", tokens: 4200 },
  { hour: "19:00", tokens: 3760 },
  { hour: "20:00", tokens: 3100 },
  { hour: "21:00", tokens: 2480 },
  { hour: "22:00", tokens: 1940 },
  { hour: "23:00", tokens: 1560 },
];

export type ModelStatus = "Running" | "Stopped" | "Downloading";

export const runningModels: {
  name: string;
  size: string;
  status: ModelStatus;
  tokens?: string;
}[] = [
  { name: "llama3:8b", size: "4.7 GB", status: "Running", tokens: "42 t/s" },
  { name: "mistral:7b", size: "4.1 GB", status: "Running", tokens: "38 t/s" },
  { name: "codellama:13b", size: "7.4 GB", status: "Stopped" },
  {
    name: "phi3:mini",
    size: "2.3 GB",
    status: "Downloading",
    tokens: "67%",
  },
  { name: "gemma2:9b", size: "5.5 GB", status: "Stopped" },
  { name: "deepseek-coder:6.7b", size: "3.8 GB", status: "Running", tokens: "51 t/s" },
];

export type RequestStatus = "200 OK" | "429 Rate" | "500 Error" | "201 OK";

export const recentRequests: {
  time: string;
  model: string;
  route: string;
  status: RequestStatus;
}[] = [
  {
    time: "15:42:03",
    model: "llama3:8b",
    route: "/api/chat",
    status: "200 OK",
  },
  {
    time: "15:41:58",
    model: "mistral:7b",
    route: "/api/generate",
    status: "200 OK",
  },
  {
    time: "15:41:44",
    model: "deepseek-coder:6.7b",
    route: "/api/chat",
    status: "200 OK",
  },
  {
    time: "15:41:29",
    model: "codellama:13b",
    route: "/api/embeddings",
    status: "500 Error",
  },
  {
    time: "15:41:17",
    model: "llama3:8b",
    route: "/api/chat",
    status: "201 OK",
  },
  {
    time: "15:40:55",
    model: "mistral:7b",
    route: "/api/generate",
    status: "429 Rate",
  },
];

export const quickstartSteps = [
  {
    step: "01",
    label: "Install runtime",
    command: "brew install ollama",
    comment: "# macOS / Linux",
  },
  {
    step: "02",
    label: "Pull a model",
    command: "ollama pull llama3",
    comment: "# 4.7 GB download",
  },
  {
    step: "03",
    label: "Open DagOS",
    command: "open http://localhost:3000",
    comment: "# dashboard ready",
  },
];

export const features = [
  {
    eyebrow: "Model Management",
    title: "One-click Installs",
    description:
      "Browse, pull, and manage any Ollama-compatible model from a unified registry. No CLI required.",
    badge: "NEW",
    badgeVariant: "new" as const,
    icon: "Download",
  },
  {
    eyebrow: "Chat Interface",
    title: "Chat Console",
    description:
      "Full-featured chat interface with streaming, history, system prompts, and multi-turn context.",
    badge: null,
    badgeVariant: null,
    icon: "MessageSquare",
  },
  {
    eyebrow: "Observability",
    title: "System Monitor",
    description:
      "Real-time CPU, RAM, and GPU telemetry with per-model resource attribution and alerts.",
    badge: null,
    badgeVariant: null,
    icon: "Activity",
  },
  {
    eyebrow: "Diagnostics",
    title: "Logs & Incidents",
    description:
      "Structured request logs, error traces, and incident timeline — all searchable and filterable.",
    badge: null,
    badgeVariant: null,
    icon: "FileText",
  },
  {
    eyebrow: "Privacy",
    title: "Offline & Private",
    description:
      "Zero telemetry, zero cloud dependency. Every inference runs on your machine, stays on your machine.",
    badge: null,
    badgeVariant: null,
    icon: "ShieldCheck",
  },
  {
    eyebrow: "Automation",
    title: "Agents & Workflows",
    description:
      "Chain models, tools, and actions into composable pipelines. Build local AI agents without the cloud.",
    badge: "SOON",
    badgeVariant: "soon" as const,
    icon: "Workflow",
  },
];
