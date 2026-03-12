// ── Demo Mode Mock Data ───────────────────────────────────────────────────────
// All data used by /demo/* pages. No real API calls are made in demo mode.

export const DEMO_MODELS = [
  { name: "llama3:latest",        size: 4_661_211_136, modified_at: "2025-01-10T08:23:00Z" },
  { name: "mistral:latest",       size: 4_109_853_696, modified_at: "2025-01-08T14:45:00Z" },
  { name: "codellama:latest",     size: 3_791_175_680, modified_at: "2025-01-05T11:12:00Z" },
];

export const DEMO_RUNNING_MODELS = [
  { name: "llama3:latest" },
];

export const DEMO_LIBRARY = [
  {
    id: "llama3",
    name: "llama3:latest",
    description: "Meta's Llama 3 — powerful general-purpose assistant model.",
    size: "4.7 GB",
    category: "General",
    installed: true,
  },
  {
    id: "mistral",
    name: "mistral:latest",
    description: "Mistral 7B — fast, efficient, great at instruction following.",
    size: "4.1 GB",
    category: "General",
    installed: true,
  },
  {
    id: "codellama",
    name: "codellama:latest",
    description: "Code Llama — Meta's code-specialized model for developers.",
    size: "3.8 GB",
    category: "Code",
    installed: true,
  },
  {
    id: "deepseek-coder",
    name: "deepseek-coder:latest",
    description: "DeepSeek Coder — state-of-the-art open-source coding model.",
    size: "6.7 GB",
    category: "Code",
    installed: false,
  },
];

// 24 hourly request buckets (last 24h)
export const DEMO_REQUESTS_CHART = [
  { hour: "00:00", value: 2  },
  { hour: "01:00", value: 0  },
  { hour: "02:00", value: 1  },
  { hour: "03:00", value: 0  },
  { hour: "04:00", value: 0  },
  { hour: "05:00", value: 3  },
  { hour: "06:00", value: 5  },
  { hour: "07:00", value: 8  },
  { hour: "08:00", value: 12 },
  { hour: "09:00", value: 17 },
  { hour: "10:00", value: 14 },
  { hour: "11:00", value: 21 },
  { hour: "12:00", value: 18 },
  { hour: "13:00", value: 25 },
  { hour: "14:00", value: 19 },
  { hour: "15:00", value: 22 },
  { hour: "16:00", value: 16 },
  { hour: "17:00", value: 11 },
  { hour: "18:00", value: 9  },
  { hour: "19:00", value: 7  },
  { hour: "20:00", value: 6  },
  { hour: "21:00", value: 4  },
  { hour: "22:00", value: 3  },
  { hour: "23:00", value: 2  },
];

export const DEMO_MODEL_USAGE = [
  { name: "llama3:latest",    value: 128 },
  { name: "mistral:latest",   value: 74  },
  { name: "codellama:latest", value: 42  },
];

export const DEMO_SUCCESS_ERROR = [
  { hour: "Success", value: 238 },
  { hour: "Errors",  value: 6   },
];

export const DEMO_RESPONSE_STATS = [
  { label: "Avg Prompt Length",    value: "142 chars" },
  { label: "Avg Response Length",  value: "618 chars" },
  { label: "Avg Latency",          value: "312ms"     },
  { label: "Total Requests",       value: "244"       },
];

export const DEMO_ACTIVITY = [
  { id: "1",  timestamp: new Date(Date.now() - 2  * 60_000).toISOString(), action: "chat_request",    model: "llama3:latest",    status: "success", latencyMs: 298 },
  { id: "2",  timestamp: new Date(Date.now() - 5  * 60_000).toISOString(), action: "chat_request",    model: "mistral:latest",   status: "success", latencyMs: 341 },
  { id: "3",  timestamp: new Date(Date.now() - 9  * 60_000).toISOString(), action: "model_installed", model: "codellama:latest", status: "success", latencyMs: null },
  { id: "4",  timestamp: new Date(Date.now() - 14 * 60_000).toISOString(), action: "chat_request",    model: "codellama:latest", status: "success", latencyMs: 265 },
  { id: "5",  timestamp: new Date(Date.now() - 22 * 60_000).toISOString(), action: "chat_request",    model: "llama3:latest",    status: "error",   latencyMs: null },
  { id: "6",  timestamp: new Date(Date.now() - 35 * 60_000).toISOString(), action: "file_analyzed",   model: "mistral:latest",   status: "success", latencyMs: 891 },
  { id: "7",  timestamp: new Date(Date.now() - 48 * 60_000).toISOString(), action: "chat_request",    model: "llama3:latest",    status: "success", latencyMs: 312 },
  { id: "8",  timestamp: new Date(Date.now() - 61 * 60_000).toISOString(), action: "chat_request",    model: "mistral:latest",   status: "success", latencyMs: 278 },
  { id: "9",  timestamp: new Date(Date.now() - 74 * 60_000).toISOString(), action: "model_installed", model: "mistral:latest",   status: "success", latencyMs: null },
  { id: "10", timestamp: new Date(Date.now() - 90 * 60_000).toISOString(), action: "chat_request",    model: "llama3:latest",    status: "success", latencyMs: 445 },
];

export const DEMO_CHAT_RESPONSES = [
  "This is a demo response from DagOS. In a real installation, your locally running models would generate responses here — all on your own machine, with no data leaving your network.",
  "I'm running in demo mode! With a real Ollama installation, I could answer questions, write code, analyze documents, and more using models like llama3, mistral, or codellama.",
  "Great question! In a live DagOS environment, a local language model would generate a full response here. Install DagOS locally to experience real AI inference powered by Ollama.",
  "Demo mode active — responses are simulated. The real DagOS chat supports streaming responses, conversation history, code block rendering, and model switching.",
  "This simulates how DagOS chat works. The real version streams token-by-token responses from your local Ollama models with full markdown and code highlighting support.",
];

export const DEMO_FILE_SUMMARY =
  "This document describes the architecture and core concepts of local AI workflows. " +
  "It outlines how language models can be deployed on-device using runtimes like Ollama, " +
  "enabling private, low-latency inference without cloud dependencies. Key themes include " +
  "model management, resource utilization, and developer tooling for local AI infrastructure.";
