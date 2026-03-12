# DagOS

> A modern local AI workstation OS for running, managing, and interacting with AI models locally.

DagOS provides a dashboard-style interface for local AI development powered by [Ollama](https://ollama.com). It gives developers and researchers a clean, command-center UI to install models, run inference, manage conversations, and monitor system telemetry — all without sending data to the cloud.

---

## Features

- **Local AI runtime detection** — auto-detects Ollama and surfaces live health status
- **Install models from the UI** — browse the model library and pull models with one click
- **Model library** — curated catalog of popular open source models across categories
- **Manage installed models** — view, inspect, and remove models from your local runtime
- **Chat with local models** — full-featured chat workspace with streaming responses
- **Streaming responses** — real-time token streaming via SSE
- **Saved conversations** — persistent conversation history with rename and search
- **System dashboard with telemetry** — live CPU, RAM, and disk stats alongside AI request metrics
- **Modern AI workstation interface** — monospace command-center design built for developers

---

## Screenshots

### Landing Page
![Landing Page](./screenshots/landing.png)

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Chat Interface
![Chat Interface](./screenshots/chat.png)

### Model Library
![Model Library](./screenshots/models.png)

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Ollama](https://ollama.com) installed and running locally

### Steps

**1. Install Ollama**

Download and install Ollama from [https://ollama.com](https://ollama.com), then start the runtime:

```bash
ollama serve
```

**2. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/DagOS.git
cd dagos
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open DagOS**

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Quick Start

1. Launch DagOS and open [http://localhost:3000](http://localhost:3000)
2. DagOS automatically detects your local Ollama runtime and displays status
3. Go to **Models** and install a model from the library (e.g. `llama3`, `mistral`)
4. Open the **Chat** workspace and select your installed model
5. Start interacting with your local AI — all inference runs on your machine

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| UI | [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Components | [shadcn/ui](https://ui.shadcn.com) |
| AI Runtime | [Ollama](https://ollama.com) |
| Server | [Node.js](https://nodejs.org) |

---

## Roadmap

DagOS is under active development. Planned features include:

- [ ] AI Agents and automation workflows
- [ ] Local File AI — analyze documents, PDFs, and codebases
- [ ] Model benchmarking and performance comparisons
- [ ] Plugin system for extending DagOS functionality
- [ ] DagOS Cloud sync for settings and conversations
- [ ] DagOS Pro features for power users and teams

---

## Open Source

DagOS is open source and contributions are welcome. Whether it's a bug fix, a new feature, or an improvement to the docs — pull requests are appreciated.

The project is actively being developed. If you run into issues or have ideas, open a GitHub issue and we'll take a look.

```
git clone https://github.com/YOUR_USERNAME/dagos.git
```

---

## License

This project is licensed under the [Apache 2.0 License](./LICENSE).
