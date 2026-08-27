# FlowCare AI

**Agentic hospital workflow orchestration — powered by Google Gemini.**

---

## Problem Statement

Hospital diagnostic workflows — lab orders, imaging studies, pathology reviews — involve many handoffs across departments. When a specimen sits in a queue too long or a courier run is delayed, there is no unified system that detects the stall, reasons about the root cause, and surfaces an actionable recommendation to the operations coordinator in real time.

## Solution

FlowCare AI is an **operational orchestration layer** that sits on top of hospital event streams (HIS / LIS / RIS) and autonomously detects workflow bottlenecks using configurable SLA rules. When a stall is detected, an **agentic AI investigation loop** analyzes the operational context through Google Gemini and presents a structured, human-approvable recommendation to the coordinator — all without touching clinical decisions.

> **FlowCare AI does NOT diagnose patients, prescribe treatments, or alter clinical care plans.**
> It exclusively reasons about operational bottlenecks: queue congestion, logistics delays, staffing allocation, and process velocity.

---

## Key Features

| Feature | Description |
|---|---|
| **Real-Time Simulation Engine** | Tick-based event engine simulates realistic hospital HIS/LIS/RIS event streams with configurable SLA thresholds |
| **Deterministic Bottleneck Detection** | Rule-based status transitions: On Track → At Risk → Bottleneck, with single-emission alerting |
| **Agentic AI Investigation (Gemini)** | Structured LLM-powered root-cause analysis with validated JSON schema output |
| **Deterministic Fallback** | Fully functional without an API key — falls back to built-in operational reasoning rules |
| **Human-in-the-Loop Approval** | All AI recommendations require explicit coordinator authorization before execution |
| **Action Execution Engine** | Dispatches approved operational directives and emits downstream workflow events |
| **Resolution Verification** | Verifies that bottleneck recovery actually occurred (stage advanced, SLA reset, status cleared) |
| **Live KPI Dashboard** | Network Workflows, At Risk, Bottlenecks, and Resolved Today — all computed from live state |
| **Agent Activity Stream** | Real-time feed showing event ingestion, bottleneck alerts, AI investigations, approvals, and resolutions |

---

## How the AI Agent Works

FlowCare AI follows an **Observe → Reason → Act → Verify → Escalate** agentic loop:

```
┌──────────────────────────────────────────────────────────────┐
│  1. OBSERVE   Simulated HIS/LIS/RIS event stream ingestion  │
│               Workflow state machine tracks each patient     │
│                                                              │
│  2. REASON    Deterministic bottleneck detection rules       │
│               AI investigation via Gemini (or fallback)      │
│               Structured JSON: cause, evidence, actions      │
│                                                              │
│  3. ACT       Coordinator reviews & approves recommendation  │
│               Action Execution Engine dispatches directive   │
│               Downstream workflow events are emitted         │
│                                                              │
│  4. VERIFY    Resolution Verifier confirms:                  │
│               - Stage advanced past bottleneck               │
│               - Elapsed timer reset within SLA               │
│               - Status no longer "Bottleneck"                │
│                                                              │
│  5. ESCALATE  If verification fails, monitoring continues    │
│               Coordinator is alerted for further action      │
└──────────────────────────────────────────────────────────────┘
```

---

## Architecture

```
src/
├── agent/                          # AI Agent Layer
│   ├── aiAgentService.js           # Gemini API integration, request queue, retry, dedup
│   ├── investigationEngine.js      # Context builder + deterministic fallback reasoning
│   ├── actionExecutionEngine.js    # Maps approved actions → downstream workflow events
│   └── resolutionVerifier.js       # Post-action verification logic
│
├── simulation/                     # Simulation & Event Engine
│   ├── eventStream.js              # Simulated HIS/LIS/RIS event timeline
│   ├── eventEngine.js              # Tick coordinator: ingest → advance → detect → stage
│   ├── workflowEngine.js           # Workflow state machine (apply events, tick time)
│   ├── workflowConfig.js           # Per-workflow-type SLA configuration (CBC, BMP, MRI, CT, ECHO, BIOPSY)
│   ├── workflowStages.js           # Stage constants and SLA defaults
│   ├── initialWorkflows.js         # Seed workflows with intentional stall scenarios
│   └── bottleneckDetector.js       # Deterministic threshold-based bottleneck detection
│
├── components/                     # React UI Components
│   ├── Header.jsx                  # Top navigation with simulation status
│   ├── KpiCards.jsx                # Four live KPI metric cards
│   ├── PatientTable.jsx            # Workflow queue table with inline inspection panels
│   └── AgentActivityPanel.jsx      # Real-time agent activity stream + recommendation modals
│
├── context/
│   └── SimulationContext.jsx       # Central state management: clock, workflows, events, actions
│
├── data/
│   └── mockData.js                 # Legacy static mock data (retained for reference)
│
├── main.jsx                        # React entry point
└── index.css                       # Global styles
```

---

## Gemini API Integration

The `aiAgentService.js` module integrates with the **Google Gemini 2.5 Flash** model via the REST API.

### Request Throttling & Deduplication

| Mechanism | Detail |
|---|---|
| **Serial Queue** | All Gemini requests are serialized through a mutex-based queue. Only one HTTP request is in-flight at any time. |
| **Cooldown** | A mandatory 4,500 ms cooldown between consecutive requests keeps throughput under the free-tier 15 RPM limit. |
| **Exponential Backoff** | 429 (rate limit) and 5xx (server error) responses are retried up to 2 times with exponential backoff starting at 6,000 ms. |
| **Deduplication** | Each bottleneck ID is tracked in a `Set`. A bottleneck that has already been submitted for investigation is skipped immediately with a deterministic fallback result. |
| **Reset on Simulation Reset** | Deduplication state and the pending request queue are cleared when the user resets the simulation, allowing previously-investigated bottlenecks to be investigated again. |

### Deterministic Fallback

When the Gemini API key is not configured, or any API call fails (after retries), the system **gracefully falls back** to built-in deterministic operational reasoning in `investigationEngine.js`. The UI clearly indicates whether a result came from `AI_AGENT` or `DEMO_FALLBACK`.

---

## Main User Flow

1. **Simulation starts** — the event engine ticks every 1 second (= 1 simulated minute).
2. Scheduled HIS/LIS/RIS events arrive and advance workflow states.
3. Workflow clocks increment; **deterministic rules** flag workflows as At Risk or Bottleneck.
4. Newly detected bottlenecks are staged as `PENDING` and dispatched to the AI investigation queue.
5. **Gemini analyzes** the structured operational context and returns a validated JSON investigation result (or fallback kicks in).
6. The investigation appears in the **Agent Activity Panel** with cause, evidence, possible actions, and a recommended action.
7. The coordinator clicks **"Approve & Execute Action"**.
8. The **Action Execution Engine** maps the action to downstream workflow events.
9. The **Workflow Engine** ingests those events and advances the workflow state.
10. The **Resolution Verifier** confirms the bottleneck is cleared.
11. **KPI cards update** in real time (Bottleneck count decreases, Resolved Today increases).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| AI/LLM | Google Gemini 2.5 Flash (REST API) |
| State Management | React Context + useRef guards |
| Build Tool | Vite |
| Package Manager | npm |

---

## Setup Instructions

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- (Optional) A **Google Gemini API key** for live AI investigations

### 1. Clone the Repository

```bash
git clone https://github.com/gbhavana-code/FlowCare-AI.git
cd FlowCare-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and add your Gemini API key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_AI_API_KEY=your_gemini_api_key_here
```

> **Without an API key**, FlowCare AI works fully using deterministic fallback reasoning. The AI investigation feature simply uses built-in operational rules instead of the Gemini model.

### 4. Run Locally

```bash
npm run dev
```

The application starts at **http://localhost:5173**.

### 5. Build for Production

```bash
npm run build
npm run preview
```

---

## Demo & Testing Notes

- The simulation **auto-starts on page load**. Use **Pause/Resume** and **Reset Demo** controls in the command center.
- Patient **P-1042** is intentionally seeded as a stalled workflow (Sample Collection stage, no `SAMPLE_COLLECTED` event scheduled). It will naturally escalate from At Risk → Bottleneck, triggering an AI investigation.
- Other workflows receive scheduled events at specific simulation minutes (2, 4, 6, 8, 10, 14, 16, 20) and advance through stages automatically.
- Click any workflow row to **inspect** the full state machine trace, SLA configuration, and AI investigation result.
- Click **"Approve & Execute Action"** on any investigation to trigger the full action → verification → resolution loop.
- All patient data is **synthetic** — no real patient information is used anywhere.

---

## Security

> **⚠ API keys must remain in environment variables.**

- The Gemini API key is read exclusively from `import.meta.env.VITE_AI_API_KEY` at runtime.
- **Never** hardcode API keys in source code, documentation, or commit history.
- `.env.local` and all `.env.*` files (except `.env.example`) are listed in `.gitignore` and must not be tracked by Git.
- The `.env.example` file contains only a placeholder value: `your_gemini_api_key_here`.

---

## Known Limitations

- **Simulation only** — no real HIS/LIS/RIS integration in the current prototype.
- **No persistent storage** — all state resets on page refresh.
- **No authentication or role-based access control** — the coordinator view is open.
- **Single-tab only** — simulation clock is tied to a single browser `setInterval`.
- **No linting or testing framework** configured yet (`eslint`, `jest`, `vitest` not included in `package.json`).
- **Gemini free-tier rate limits** — the serial queue and cooldown mitigate this, but very rapid bottleneck detection under heavy load could still queue up.

---

## Future Improvements

- Real HIS/LIS/RIS integration via HL7 FHIR, WebSocket, or Kafka event bus
- Persistent state with a backend service and database
- Multi-user support with authentication and coordinator roles
- Automated testing with Vitest
- ESLint and Prettier configuration
- Audit trail and action history log
- Configurable SLA thresholds via admin UI
- Multiple LLM provider support (OpenAI, Anthropic, etc.)
- Mobile-responsive improvements for tablet use in hospital wards

---

## License

This project is provided as-is for demonstration and educational purposes.
