# StoryRoom 🎬
### *The Agent-Native Filmmaking Studio • Powered by WebMCP*

> **"The Agent Proposes. The Human Decides."**  
> StoryRoom is a professional, agent-native filmmaking workspace where human directors and autonomous AI agents collaborate in real-time on live screenplays through real, structured **WebMCP** (Web Model Context Protocol) browser tools.

[![WebMCP Standard](https://img.shields.io/badge/WebMCP-Native%20API-emerald.svg?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/ai/webmcp)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Gemini%202.0%20Flash-orange.svg?style=for-the-badge&logo=googlegemini&logoColor=white)](https://aistudio.google.com/)
[![Framework](https://img.shields.io/badge/React%2018-Vite%20%2B%20Tailwind-blue.svg?style=for-the-badge&logo=react&logoColor=white)](https://vitejs.dev/)
[![Security](https://img.shields.io/badge/Security-Human--In--The--Loop%20Gate-red.svg?style=for-the-badge&logo=security&logoColor=white)](#-human-in-the-loop-security-guarantee)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📑 Table of Contents
- [🌟 Submission Overview](#-submission-overview)
- [🏛️ System Architecture](#️-system-architecture)
- [🔄 How WebMCP Works in StoryRoom](#-how-webmcp-works-in-storyroom)
- [🛠️ The 8 Registered WebMCP Tools](#️-the-8-registered-webmcp-tools)
- [🔒 Human-In-The-Loop Security Guarantee](#-human-in-the-loop-security-guarantee)
- [⚡ 9-Step Hackathon Demo Scenario (Judge Walkthrough)](#-9-step-hackathon-demo-scenario-judge-walkthrough)
- [🧪 Browser DevTools Console Verification](#-browser-devtools-console-verification)
- [🚀 Quick Start & Installation](#-quick-start--installation)
- [🔐 Environment Configuration & API Safety](#-environment-configuration--api-safety)
- [🧰 Technology Stack](#-technology-stack)
- [📄 License](#-license)

---

## 🌟 Submission Overview

### 1. Why is this use case a strong fit for WebMCP?
Screenwriting and film direction are **multi-dimensional state machines** — a single scene depends on character emotional arcs, location constraints, historical continuity, scene timelines, and director style rules. 

Standard LLM chat boxes fail because they lack structured access to live application state. With **WebMCP**, the agent operates *inside the film studio* through native browser tools (`get_story_context`, `get_character`, `check_continuity`, `analyze_scene`, `propose_rewrite`, `apply_revision`), inspecting real DOM state and proposing structured edits without breaking context or hallucinating facts.

### 2. How does it create a better user experience?
Instead of copy-pasting screenplay excerpts into generic chatbots, the filmmaker works in a dedicated cinematic suite. The AI agent acts as a creative collaborator that autonomously checks continuity and analyzes subtext. Most importantly, StoryRoom enforces a strict **Human-In-The-Loop Security Guarantee**: the agent can never silently overwrite a screenplay. All rewrites are delivered as staged visual diffs that require explicit director approval before being committed.

### 3. What can people and agents do together that was difficult or impossible before?
* **Autonomous Cross-Scene Continuity Auditing:** The agent cross-references 8 scenes, character dossiers, and location props to flag narrative contradictions in seconds.
* **Director's Memory Alignment:** The agent evaluates dialogue against 8 custom creative rules (*"Prefer visual storytelling over exposition"*, *"Silence carries emotion"*) and proposes restrained rewrites.
* **Staged Human-Approved Commits:** An external WebMCP agent can analyze, propose, and prepare screenplay revisions, but the director retains 100% editorial authority through an interactive visual diff review.

---

## 🏛️ System Architecture

StoryRoom is engineered with a modular, 5-layer architecture bridging React UI state, WebMCP browser standard APIs, and dual-mode AI reasoning.

![StoryRoom Full System Architecture](./architecture%20diagram.png)

### Architectural Layers:
1. **Presentation Layer (React 18 + TailwindCSS)**:
   - `ScreenplayEditor`: Standard industry formatting (sluglines, action, dialogue, parentheticals, version history).
   - `CharacterManager`: Psychological profiles, emotional arcs, relationships, and scene appearance index.
   - `LocationsPanel`: Location dossiers, atmosphere notes, and prop tracking.
   - `DirectorsMemory`: 8 codified aesthetic rules and stylistic guidelines.
   - `AgentPanel` / `AgentConsole`: Natural language agent interface and live execution thought stream.
   - `RevisionReview`: Human-in-the-loop side-by-side visual diff comparison modal.
   - `HackathonDemoHUD`: One-click deterministic 9-step judge scenario player.

2. **State & Context Management Layer**:
   - `ProjectStore`: Centralized reactive state managing scenes, characters, locations, revisions, and the real-time activity log.
   - `AuthStore`: Director profiles, credentials, and studio session state.
   - `WebMCPProvider`: Synchronizes React store state with the WebMCP Registry via reactive references.

3. **WebMCP Bridge & Tool Registry Layer**:
   - Exposes tools to browser APIs: `document.modelContext`, `navigator.modelContext`, and `window.__STORYROOM_WEBMCP__`.
   - Tool Registry with strict JSON Schema definitions, argument validation, and telemetry dispatch.

4. **Intelligence & AI Execution Layer**:
   - `agent.js`: Intent parser and multi-step tool execution planner.
   - `aiIntelligence.js` & `coreTools.js`:
     - **Primary:** Google Gemini 2.0 Flash API for live, high-speed multimodal reasoning.
     - **Fallback:** Deterministic offline simulation engine ensuring 100% testable execution even without an API key or internet connection.

5. **Security & Human-in-the-Loop (HITL) Gate**:
   - Enforces the 4-stage revision lifecycle: `Pending` ➔ `Director Staged Review` ➔ `Approved / Rejected` ➔ `Screenplay Committed`.

---

## 🔄 How WebMCP Works in StoryRoom

StoryRoom implements the official WebMCP browser standard, allowing internal agent orchestrators and external browser agents to interact seamlessly with live studio state.

![WebMCP Integration and Flow Diagram](./webmcp%20diagram.png)

### WebMCP Implementation Details
All tools are registered on `document.modelContext` (and mirrored on `navigator.modelContext` and `window.__STORYROOM_WEBMCP__` for browser console testing):

```javascript
document.modelContext.registerTool({
  name: "get_story_context",
  title: "Get Story Context",
  description: "Retrieve project metadata, genre, logline, characters, locations, and Director's Memory rules.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  },
  execute: async (input) => {
    const project = getProject();
    return await getStoryContext({ project, logActivity });
  }
});
```

---

## 🛠️ The 8 Registered WebMCP Tools

| Tool Name | Type | Description & Input Schema | Real State Operated On |
| :--- | :--- | :--- | :--- |
| `get_story_context` | **Read** | Retrieves logline, genre, tone, character roster, location index, and 8 Director's Memory rules. | Entire project metadata & global guidelines |
| `get_current_scene` | **Read** | Retrieves complete scene screenplay text, slugline, characters present, time, and emotional stakes.<br>`{ sceneId: string }` | Active or target scene record |
| `search_scenes` | **Read** | Full-text search across dialogue, action blocks, and scene summaries by keyword or character.<br>`{ query: string, character?: string }` | Multi-scene screenplay database |
| `get_character` | **Read** | Retrieves full character dossier, emotional arc, psychological traits, and scene appearances.<br>`{ name: string }` | Character dossiers & relationships |
| `check_continuity` | **Analysis** | Audits scene consistency, timeline logic, character knowledge, prop tracking, and planted contradictions.<br>`{ sceneId: string }` | Cross-scene timeline & prop registry |
| `analyze_scene` | **Analysis** | Evaluates dramatic pacing, subtext, and dialogue alignment against Director's Memory rules.<br>`{ sceneId: string }` | Scene draft vs. 8 Creative Rules |
| `propose_rewrite` | **Proposal** | Generates a pending screenplay revision with structured justification, intent alignment, and risk notes.<br>`{ sceneId: string, reason: string, directive?: string }` | Staged Revision Store (`status: "pending"`) |
| `apply_revision` | **Commit** | Commits an approved revision to the live screenplay. **Guarded by Human-In-The-Loop check.**<br>`{ revisionId: string }` | Live Screenplay Editor & Version History |

---

## 🔒 Human-In-The-Loop Security Guarantee

To prevent rogue agents or hallucinations from silently destroying creative work, StoryRoom enforces a **strict 4-stage revision lifecycle**:

$$\mathbf{Pending} \longrightarrow \mathbf{Staged\ in\ Diff\ Modal} \longrightarrow \mathbf{Director\ Approval\ (UI)} \longrightarrow \mathbf{Committed\ to\ Script}$$

* If an agent calls `apply_revision(revisionId)` while `status === "pending"`, the tool **hard-blocks execution** and returns:
  ```json
  {
    "success": false,
    "error": "HUMAN_APPROVAL_REQUIRED",
    "message": "This revision requires explicit director approval before it can be applied."
  }
  ```
* The director inspects a side-by-side **Visual Diff** (Red = deleted, Green = added, Cyan = preserved) and clicks **Accept Revision** or **Reject Revision**.

---

## ⚡ 9-Step Hackathon Demo Scenario (Judge Walkthrough)

StoryRoom includes an automated, deterministic **9-Step Hackathon Demo HUD** targeting **Scene 07 (*The Mirror*)**:

```
[ Step 1: get_story_context ] ───► [ Step 2: get_current_scene ] ───► [ Step 3: get_character ]
                                                                             │
[ Step 6: propose_rewrite ]  ◄─── [ Step 5: analyze_scene ]     ◄─── [ Step 4: check_continuity ]
        │
        ▼
╔════════════════════════════════════════════════════════════════════════════════════════════╗
║ STEP 7: CRITICAL PAUSE — DIRECTOR REVIEW REQUIRED                                          ║
║ ➔ Automated progression STOPS.                                                             ║
║ ➔ The Revision Review modal opens with side-by-side visual diffs.                          ║
║ ➔ The Human Director must click ACCEPT REVISION (or REJECT).                               ║
╚════════════════════════════════════════════════════════════════════════════════════════════╝
        │
        ▼ (Upon Director Approval)
[ Step 8: Human Approval Logged ] ───► [ Step 9: apply_revision Committed ➔ Version 3 Logged ]
```

1. **Step 1:** Retrieves story context & 8 Director's Memory rules (`get_story_context`)
2. **Step 2:** Retrieves Scene 7 metadata & draft (`get_current_scene`)
3. **Step 3:** Inspects Riya's character profile & emotional arc (`get_character`)
4. **Step 4:** Audits scene continuity (`check_continuity` $\rightarrow$ flags 1 planted note)
5. **Step 5:** Analyzes dramatic tension against memory (`analyze_scene`)
6. **Step 6:** Proposes a restrained rewrite (`propose_rewrite`)
7. **Step 7 (CRITICAL PAUSE):** The demo **stops automatic progression**. The **Revision Review** modal opens with side-by-side diffs and displays **`DIRECTOR REVIEW REQUIRED`**.
8. **Step 8:** The human director clicks **`ACCEPT REVISION`** (or **`REJECT`** to preserve original).
9. **Step 9:** WebMCP commits the change (`apply_revision`), logs **Version 3** in scene history, and completes with **`FULL WORKFLOW COMPLETE!`**.

---

## 🧪 Browser DevTools Console Verification

You can test and verify all 8 WebMCP tools directly in the Chrome DevTools Console (`F12`):

```javascript
// 1. Inspect all 8 registered tools
console.log(window.__STORYROOM_WEBMCP__.tools);

// 2. Query story context
const story = await window.__STORYROOM_WEBMCP__.callTool('get_story_context', {});
console.log("Story Context:", story);

// 3. Inspect Scene 7
const scene7 = await window.__STORYROOM_WEBMCP__.callTool('get_current_scene', { sceneId: 'scene-7' });
console.log("Scene 7 Data:", scene7);

// 4. Audit continuity for Scene 7
const continuity = await window.__STORYROOM_WEBMCP__.callTool('check_continuity', { sceneId: 'scene-7' });
console.log("Continuity Report:", continuity);

// 5. Test Human-in-the-Loop Security Gate (Attempt unauthorized direct commit)
const secTest = await window.__STORYROOM_WEBMCP__.callTool('apply_revision', { revisionId: 'rev-scene-7-tense' });
console.log(secTest); 
// Output: { success: false, error: "HUMAN_APPROVAL_REQUIRED", message: "..." }
```

---

## 🚀 Quick Start & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/ruthweb-site/Storyroom.git
cd Storyroom
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Key (Optional)
Copy the template and insert your Google Gemini API Key:
```bash
cp .env.example .env.local
```
*(If no API key is provided, StoryRoom seamlessly operates with its built-in offline simulation intelligence!)*

### 4. Start Local Development Server
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

---

## 🔐 Environment Configuration & API Safety

To ensure zero API key leakage when pushing to GitHub:
- All `.env*` and `.env.local` files are strictly ignored in [`.gitignore`](.gitignore).
- A safe public template is provided in [`.env.example`](.env.example).
- Never commit your private API keys to source control.

```env
# .env.example
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🧰 Technology Stack

- **Core & UI:** React 18, Vite, TailwindCSS, Lucide React
- **Agent Standard:** Native WebMCP (`document.modelContext`, `navigator.modelContext`)
- **AI Reasoning:** Google Gemini 2.0 Flash (`@google/genai`) + Offline Deterministic Engine
- **State Management:** Custom React Context & Action Reducers (`ProjectStore`, `AuthStore`)
- **Deployment:** Vercel (Static SPA with clean routing rewrite support)

---

## 📄 License
StoryRoom is distributed under the **MIT License**. See [LICENSE](LICENSE) for full details.
