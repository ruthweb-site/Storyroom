import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProject } from '../store/ProjectStore.jsx'
import {
  Film,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Lock,
  Eye,
  FileCode2,
  Code2,
  Workflow,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Play,
  Flame,
  Users,
  Compass,
  ScrollText,
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { dispatch } = useProject()
  const [selectedToolIndex, setSelectedToolIndex] = useState(0)
  const [copiedConsole, setCopiedConsole] = useState(false)

  const tools = [
    {
      name: 'get_story_context',
      title: 'Get Story Context',
      type: 'READ',
      badge: 'Context',
      desc: 'Retrieves global narrative state: genre, logline, themes, character roster, and 8 Director’s Memory creative rules.',
      schema: `{
  "type": "object",
  "properties": {},
  "required": []
}`,
      output: `{
  "title": "The Last Frame",
  "genre": "Psychological Thriller",
  "logline": "An archivist reconstructs a lost 1974 film...",
  "activeScene": "scene-7",
  "characters": ["Riya Sharma", "Vikram Sen", "Kavita Rao"],
  "directorsMemoryRulesCount": 8
}`,
    },
    {
      name: 'get_current_scene',
      title: 'Get Current Scene',
      type: 'READ',
      badge: 'Screenplay',
      desc: 'Fetches raw screenplay blocks, slugline, characters in scene, and historical version history for target scene.',
      schema: `{
  "type": "object",
  "properties": {
    "sceneId": { "type": "string", "description": "ID of target scene" }
  },
  "required": ["sceneId"]
}`,
      output: `{
  "sceneId": "scene-7",
  "heading": "INT. ARCHIVE DARKROOM - NIGHT",
  "characters": ["Riya Sharma"],
  "version": 2,
  "action": "Red safelight washes over silver gelatin baths...",
  "wordCount": 142
}`,
    },
    {
      name: 'check_continuity',
      title: 'Check Continuity',
      type: 'ANALYSIS',
      badge: 'Audit',
      desc: 'Scans all scenes for timeline anomalies, character knowledge contradictions, prop tracking, and planted script errors.',
      schema: `{
  "type": "object",
  "properties": {
    "sceneId": { "type": "string" }
  },
  "required": ["sceneId"]
}`,
      output: `{
  "sceneId": "scene-7",
  "issuesFound": 1,
  "notes": [
    {
      "severity": "medium",
      "flag": "Prop Inconsistency",
      "detail": "Negative 104 was locked in the safe during Scene 4, yet Riya examines it here without unlocking sequence."
    }
  ]
}`,
    },
    {
      name: 'analyze_scene',
      title: 'Analyze Scene',
      type: 'ANALYSIS',
      badge: 'Critic',
      desc: 'Evaluates dramatic pacing, subtextual depth, and dialogue rhythm against codified Director’s Memory rules.',
      schema: `{
  "type": "object",
  "properties": {
    "sceneId": { "type": "string" }
  },
  "required": ["sceneId"]
}`,
      output: `{
  "dramaticTension": 88,
  "memoryAlignment": "Rule 3 Broken: Prefer visual storytelling over dialogue exposition.",
  "pacingScore": "High Tension",
  "recommendation": "Cut expository line; heighten sound of dripping wash tank."
}`,
    },
    {
      name: 'propose_rewrite',
      title: 'Propose Rewrite',
      type: 'PROPOSAL',
      badge: 'Staged Diff',
      desc: 'Generates a pending screenplay revision with justification notes, leaving the live screenplay untouched until approved.',
      schema: `{
  "type": "object",
  "properties": {
    "sceneId": { "type": "string" },
    "reason": { "type": "string" },
    "directive": { "type": "string" }
  },
  "required": ["sceneId", "reason"]
}`,
      output: `{
  "revisionId": "rev-scene-7-tense",
  "status": "pending",
  "requiresHumanApproval": true,
  "summary": "Tightened dialogue to silence; emphasized tactile archival dread."
}`,
    },
    {
      name: 'apply_revision',
      title: 'Apply Revision',
      type: 'COMMIT',
      badge: 'HITL Gate',
      desc: 'Commits an approved revision to the screenplay. Protected by a strict Human-In-The-Loop gate preventing silent writes.',
      schema: `{
  "type": "object",
  "properties": {
    "revisionId": { "type": "string" }
  },
  "required": ["revisionId"]
}`,
      output: `{
  "success": false,
  "error": "HUMAN_APPROVAL_REQUIRED",
  "message": "This revision requires explicit director approval before it can be applied."
}`,
    },
  ]

  function launchDemoStudio() {
    dispatch({ type: 'SELECT_PROJECT', payload: { projectId: 'the-last-frame' } })
    navigate('/studio/the-last-frame')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('storyroom:run-agent-demo'))
    }, 250)
  }

  function handleCopyConsole() {
    navigator.clipboard.writeText(`window.__STORYROOM_WEBMCP__.callTool('check_continuity', { sceneId: 'scene-7' }).then(console.log);`)
    setCopiedConsole(true)
    setTimeout(() => setCopiedConsole(false), 2000)
  }

  return (
    <div className="min-h-screen bg-studio-950 text-studio-100 selection:bg-brass-500 selection:text-studio-950 font-sans relative overflow-x-hidden">
      {/* Background Atmosphere & Ambient Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(217,181,98,0.18),rgba(13,12,11,0))] pointer-events-none" />
      <div className="absolute top-[35%] -left-60 w-[500px] h-[500px] bg-brass-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[60%] -right-60 w-[550px] h-[550px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="film-texture absolute inset-0 opacity-40 pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-studio-950/85 border-b border-studio-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brass-400 to-brass-600 flex items-center justify-center text-studio-950 font-bold shadow-lg shadow-brass-900/40 group-hover:scale-105 transition-transform">
              <Film size={18} />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-wide text-studio-100 group-hover:text-brass-300 transition-colors">
                StoryRoom
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono tracking-[0.2em] text-brass-400/90">
                WebMCP Studio
              </span>
            </div>
          </Link>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono tracking-wider text-studio-400">
            <a href="#features" className="hover:text-brass-300 transition-colors">Features</a>
            <a href="#webmcp" className="hover:text-brass-300 transition-colors">WebMCP Tools</a>
            <a href="#security" className="hover:text-brass-300 transition-colors">HITL Security</a>
            <a href="#demo-reel" className="hover:text-brass-300 transition-colors">9-Step Scenario</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-3.5 py-1.5 rounded-lg border border-studio-700 text-studio-300 hover:text-studio-100 hover:border-brass-500/50 text-xs font-semibold transition-all"
            >
              Production Slate
            </Link>
            <button
              onClick={launchDemoStudio}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-brass-400 to-brass-500 hover:from-brass-300 hover:to-brass-400 text-studio-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-brass-900/30 transition-all active:scale-95"
            >
              <Sparkles size={14} />
              <span>Launch Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative pt-16 pb-24 px-6 max-w-7xl mx-auto text-center z-10">
        {/* Hackathon Badges */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-studio-900/90 border border-brass-500/40 text-xs font-mono mb-8 shadow-inner animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-brass-300 font-semibold">WebMCP Browser Standard Native</span>
          <span className="text-studio-600">•</span>
          <span className="text-studio-400">Gemini 2.0 Flash AI Engine</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6">
          The Agent-Native Filmmaking Studio
        </h1>

        <p className="font-serif italic text-brass-400 text-xl sm:text-2xl mb-6 tracking-wide max-w-2xl mx-auto">
          "The Agent Proposes. The Human Decides."
        </p>

        {/* Subtitle */}
        <p className="text-studio-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-10">
          StoryRoom connects autonomous AI agents directly to live screenplay DOM state via real, structured{' '}
          <span className="text-brass-300 font-semibold">WebMCP tools</span>. Screenwriters and directors collaborate with AI co-creators that inspect character psychology, audit continuity across scenes, and propose visual staged diffs with strict human-in-the-loop protection.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={launchDemoStudio}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-brass-400 via-brass-500 to-brass-600 hover:from-brass-300 hover:to-brass-500 text-studio-950 font-bold text-sm uppercase tracking-wider shadow-2xl shadow-brass-900/50 hover:shadow-brass-900/80 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles size={18} />
            <span>⚡ Launch Interactive Studio (Scene 07)</span>
          </button>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-studio-900/90 border border-studio-700/80 hover:border-brass-500/60 hover:bg-studio-800/90 text-studio-200 text-sm font-semibold transition-all"
          >
            <Film size={17} className="text-brass-400" />
            <span>Open Production Slate</span>
          </Link>

          <a
            href="https://github.com/ruthweb-site/Storyroom"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-studio-950/80 border border-studio-800 hover:border-studio-700 text-studio-400 hover:text-studio-200 text-sm font-mono transition-all"
          >
            <FileCode2 size={16} />
            <span>View Source on GitHub</span>
            <ExternalLink size={13} className="opacity-60" />
          </a>
        </div>

        {/* Live Studio Frame Mockup / Hero Visual */}
        <div className="relative mx-auto max-w-5xl rounded-2xl p-2 bg-gradient-to-b from-brass-500/30 via-studio-700/40 to-studio-900/80 shadow-2xl shadow-black">
          <div className="rounded-xl bg-studio-950/95 border border-studio-800 overflow-hidden text-left shadow-2xl">
            {/* Window Topbar */}
            <div className="px-4 py-3 bg-studio-900 border-b border-studio-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 text-xs font-mono text-studio-400">StoryRoom Studio — Scene 07: THE MIRROR</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-mono">
                  ● 8 WebMCP Tools Active
                </span>
              </div>
            </div>

            {/* Mock Studio Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-studio-800">
              {/* Left: Screenplay Preview */}
              <div className="lg:col-span-7 p-6 space-y-4 bg-studio-950">
                <div className="flex items-center justify-between pb-3 border-b border-studio-800">
                  <span className="text-xs font-mono font-bold text-brass-400 uppercase tracking-wider">
                    SCENE 07 • INT. ARCHIVE DARKROOM - NIGHT
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-studio-900 text-studio-400">
                    Draft V2
                  </span>
                </div>

                <div className="font-mono text-xs space-y-3 leading-relaxed text-studio-300 opacity-90">
                  <p className="text-studio-400 italic">
                    Red safelight washes over silver gelatin baths. RIYA (30s) holds a magnifying loupe over Negative 104.
                  </p>
                  <p className="text-center font-bold text-studio-100 uppercase tracking-wider">
                    RIYA
                  </p>
                  <p className="text-center max-w-sm mx-auto text-studio-200">
                    The exposure timestamp doesn't match the police ledger. Someone cut thirty seconds out of the reel.
                  </p>
                  <p className="text-studio-400 italic">
                    Water drips from the rinse bath. A floorboard creaks outside the locked steel door.
                  </p>
                </div>

                {/* Staged Visual Diff Callout */}
                <div className="mt-4 p-3 rounded-lg bg-brass-950/40 border border-brass-500/40 flex items-start gap-3">
                  <ShieldCheck size={18} className="text-brass-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-brass-300 block">Staged WebMCP Revision Ready for Director Review</span>
                    <p className="text-studio-400 text-[11px]">
                      Agent proposed subtle tension rewrite adhering to Rule 3. Live script remains locked until human clicks <strong>Accept</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Agent Reasoning & Tool Telemetry Stream */}
              <div className="lg:col-span-5 p-6 bg-studio-900/60 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-studio-800">
                  <span className="text-studio-400 uppercase text-[11px] font-bold">Autonomous WebMCP Stream</span>
                  <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Telemetry
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 rounded bg-studio-950 border border-studio-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-studio-200">get_story_context()</span>
                    </div>
                    <span className="text-[10px] text-studio-500">8 rules loaded</span>
                  </div>

                  <div className="p-2.5 rounded bg-studio-950 border border-studio-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-studio-200">check_continuity(scene-7)</span>
                    </div>
                    <span className="text-[10px] text-amber-400">1 note flagged</span>
                  </div>

                  <div className="p-2.5 rounded bg-studio-950 border border-studio-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-studio-200">analyze_scene(scene-7)</span>
                    </div>
                    <span className="text-[10px] text-brass-400">88% tension</span>
                  </div>

                  <div className="p-2.5 rounded bg-brass-950/60 border border-brass-500/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-brass-400 animate-pulse">⚡</span>
                      <span className="text-brass-300 font-bold">propose_rewrite()</span>
                    </div>
                    <span className="text-[10px] text-brass-400 font-bold">Awaiting Human Gate</span>
                  </div>
                </div>

                <button
                  onClick={launchDemoStudio}
                  className="w-full mt-2 py-2 rounded-lg bg-brass-500/20 hover:bg-brass-500/30 border border-brass-500/50 text-brass-300 font-bold text-center transition-all flex items-center justify-center gap-2"
                >
                  <Play size={13} />
                  <span>Execute 9-Step Demo in Studio →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Why WebMCP & Key Pillars */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-studio-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-brass-400 font-semibold block mb-2">
            Architectural Innovation
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-studio-100 mb-4">
            Why WebMCP Transforms Screenwriting
          </h2>
          <p className="text-studio-400 text-sm sm:text-base leading-relaxed">
            Standard chatbots suffer from hallucination and lack structured access to live multi-scene state. WebMCP embeds agents directly inside the filmmaker’s workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-studio-900/80 border border-studio-700/80 hover:border-brass-500/60 transition-all space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-brass-500/10 border border-brass-500/30 flex items-center justify-center text-brass-400">
              <Workflow size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold text-studio-100">Live Workspace Tool Calling</h3>
            <p className="text-studio-400 text-sm leading-relaxed">
              Agents do not need you to copy-paste screenplay text. They invoke native browser WebMCP tools to inspect scenes, character emotional arcs, and location dossiers in real-time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-studio-900/80 border border-studio-700/80 hover:border-brass-500/60 transition-all space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold text-studio-100">Human-In-The-Loop Gate</h3>
            <p className="text-studio-400 text-sm leading-relaxed">
              No silent script overwrites. The agent delivers revisions as staged visual diffs (red = removed, green = added). If the agent attempts a direct write, the tool hard-blocks with a security error.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-studio-900/80 border border-studio-700/80 hover:border-brass-500/60 transition-all space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold text-studio-100">Director's Memory Alignment</h3>
            <p className="text-studio-400 text-sm leading-relaxed">
              Codify your unique cinematic rules (e.g. <em>"Prefer visual storytelling over exposition"</em>, <em>"Silence carries emotion"</em>). The AI checks pacing and rewrites against your creative vision.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Interactive WebMCP Tool Explorer */}
      <section id="webmcp" className="py-20 px-6 max-w-7xl mx-auto border-t border-studio-800/80">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 mb-12">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-brass-400 font-semibold block mb-2">
              Standard Compliance
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-studio-100 mb-4">
              The 8 Registered WebMCP Tools
            </h2>
            <p className="text-studio-400 text-sm leading-relaxed">
              Registered on <code className="text-brass-300 font-mono bg-studio-900 px-1.5 py-0.5 rounded border border-studio-800">document.modelContext</code> and accessible to external agents via the official WebMCP browser standard.
            </p>
          </div>

          {/* DevTools Quick Test Button */}
          <div className="bg-studio-900 p-4 rounded-xl border border-studio-800 flex items-center gap-3">
            <Terminal size={18} className="text-brass-400 shrink-0" />
            <div className="text-xs font-mono">
              <span className="text-studio-400 block text-[10px]">Test in Chrome Console (F12):</span>
              <span className="text-studio-200">window.__STORYROOM_WEBMCP__.tools</span>
            </div>
            <button
              onClick={handleCopyConsole}
              className="px-3 py-1.5 rounded bg-studio-800 hover:bg-studio-700 text-studio-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Copy snippet"
            >
              {copiedConsole ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedConsole ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Tool Switcher */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tool List Column */}
          <div className="lg:col-span-5 space-y-2">
            {tools.map((t, idx) => (
              <button
                key={t.name}
                onClick={() => setSelectedToolIndex(idx)}
                className={`w-full p-3.5 rounded-xl text-left transition-all flex items-center justify-between border ${
                  selectedToolIndex === idx
                    ? 'bg-studio-900 border-brass-500/70 text-studio-100 shadow-lg shadow-brass-900/10'
                    : 'bg-studio-950/60 border-studio-800/80 text-studio-400 hover:bg-studio-900 hover:text-studio-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-brass-400">{t.name}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-studio-800 text-studio-400">
                      {t.badge}
                    </span>
                  </div>
                  <p className="text-xs text-studio-400 line-clamp-1">{t.title}</p>
                </div>
                <ChevronRight
                  size={16}
                  className={`transition-transform ${selectedToolIndex === idx ? 'text-brass-400 translate-x-1' : 'text-studio-600'}`}
                />
              </button>
            ))}
          </div>

          {/* Tool Detail & Code Preview Column */}
          <div className="lg:col-span-7 bg-studio-900/90 rounded-2xl border border-studio-700/80 p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-studio-800">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brass-400 font-bold block">
                    TOOL DEFINITION • {tools[selectedToolIndex].type}
                  </span>
                  <h4 className="font-serif text-xl font-bold text-studio-100">
                    {tools[selectedToolIndex].name}
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded bg-studio-950 text-emerald-400 text-xs font-mono border border-studio-800">
                  Registered Native API
                </span>
              </div>

              <p className="text-studio-300 text-xs leading-relaxed">
                {tools[selectedToolIndex].desc}
              </p>

              {/* JSON Schema & Sample Response */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="space-y-1.5">
                  <span className="text-studio-500 uppercase text-[10px]">Input Schema</span>
                  <pre className="p-3 rounded-lg bg-studio-950 border border-studio-800 text-brass-300/90 overflow-x-auto h-48">
                    {tools[selectedToolIndex].schema}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <span className="text-studio-500 uppercase text-[10px]">Sample Return Value</span>
                  <pre className="p-3 rounded-lg bg-studio-950 border border-studio-800 text-emerald-300/90 overflow-x-auto h-48">
                    {tools[selectedToolIndex].output}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-studio-800 flex items-center justify-between mt-4">
              <span className="text-xs text-studio-400 font-mono">
                Full schema validated in <code className="text-brass-300">src/webmcp/coreTools.js</code>
              </span>
              <button
                onClick={launchDemoStudio}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brass-400 hover:text-brass-300"
              >
                <span>Try In Studio</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section: 9-Step Hackathon Demo Scenario */}
      <section id="demo-reel" className="py-20 px-6 max-w-7xl mx-auto border-t border-studio-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-brass-400 font-semibold block mb-2">
            Deterministic Judge Walkthrough
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-studio-100 mb-4">
            The 9-Step Hackathon Demo Scenario
          </h2>
          <p className="text-studio-400 text-sm sm:text-base leading-relaxed">
            Targeting Scene 7 (<em>"The Mirror"</em>), judges can run this deterministic 9-step flow to verify end-to-end WebMCP coordination, continuity auditing, and the Human-in-the-Loop review gate.
          </p>
        </div>

        {/* 9-Step Storyboard Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-studio-900/80 border border-studio-800 space-y-2">
            <span className="text-xs font-mono text-brass-400 font-bold">STEP 01 — 03</span>
            <h4 className="font-serif text-base font-bold text-studio-100">Context & Character Ingestion</h4>
            <p className="text-studio-400 text-xs leading-relaxed">
              Agent calls <code>get_story_context</code>, <code>get_current_scene</code>, and <code>get_character('Riya')</code> to load active scene state and 8 Director's rules.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-studio-900/80 border border-studio-800 space-y-2">
            <span className="text-xs font-mono text-amber-400 font-bold">STEP 04 — 06</span>
            <h4 className="font-serif text-base font-bold text-studio-100">Auditing & Rewrite Proposal</h4>
            <p className="text-studio-400 text-xs leading-relaxed">
              Agent invokes <code>check_continuity</code> to find the planted safe error, analyzes subtext via <code>analyze_scene</code>, and proposes a restrained rewrite.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-brass-950/30 border border-brass-500/40 space-y-2">
            <span className="text-xs font-mono text-brass-300 font-bold">STEP 07 — 09 (HITL GATE)</span>
            <h4 className="font-serif text-base font-bold text-brass-300">Human Approval & Commit</h4>
            <p className="text-studio-400 text-xs leading-relaxed">
              The automated flow stops. The director reviews the side-by-side diff modal and approves the change. The agent then commits <strong>Version 3</strong>!
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={launchDemoStudio}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brass-500 hover:bg-brass-400 text-studio-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
          >
            <Sparkles size={15} />
            <span>Launch Scene 07 Demo HUD Now</span>
          </button>
        </div>
      </section>

      {/* Section: Human-in-the-Loop Security Deep Dive */}
      <section id="security" className="py-20 px-6 max-w-7xl mx-auto border-t border-studio-800/80">
        <div className="bg-gradient-to-br from-studio-900 via-studio-900/90 to-studio-950 rounded-3xl border border-studio-700 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brass-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brass-500/10 border border-brass-500/30 text-brass-300 text-xs font-mono">
              <Lock size={12} />
              <span>Zero Silent Overwrites Guarantee</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-studio-100">
              The 4-Stage Human-in-the-Loop Revision Lifecycle
            </h2>

            <p className="text-studio-300 text-sm leading-relaxed">
              Screenwriting requires absolute trust. If an agent attempts to execute <code className="text-brass-300 font-mono">apply_revision()</code> while a revision is still in pending status, the tool engine immediately hard-blocks execution with:
            </p>

            <div className="p-4 rounded-xl bg-studio-950 border border-rose-500/40 text-rose-300 font-mono text-xs">
              <code>&#123; "success": false, "error": "HUMAN_APPROVAL_REQUIRED", "message": "This revision requires explicit director approval before it can be applied." &#125;</code>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center pt-2">
              <div className="p-3 rounded-lg bg-studio-950 border border-studio-800">
                <span className="text-studio-500 block text-[10px]">STAGE 1</span>
                <span className="text-studio-300 font-bold">1. Pending</span>
              </div>
              <div className="p-3 rounded-lg bg-studio-950 border border-studio-800">
                <span className="text-studio-500 block text-[10px]">STAGE 2</span>
                <span className="text-studio-300 font-bold">2. Staged Diff</span>
              </div>
              <div className="p-3 rounded-lg bg-studio-950 border border-brass-500/50">
                <span className="text-brass-400 block text-[10px]">STAGE 3</span>
                <span className="text-brass-300 font-bold">3. Human Review</span>
              </div>
              <div className="p-3 rounded-lg bg-studio-950 border border-emerald-500/50">
                <span className="text-emerald-400 block text-[10px]">STAGE 4</span>
                <span className="text-emerald-300 font-bold">4. Committed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-studio-800/80 bg-studio-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-studio-500 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-brass-500 flex items-center justify-center text-studio-950 font-bold">
              <Film size={14} />
            </div>
            <span className="text-studio-300 font-serif font-bold text-sm">StoryRoom</span>
            <span>• MIT License</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/ruthweb-site/Storyroom"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brass-400 transition-colors"
            >
              GitHub Repository
            </a>
            <a
              href="https://developer.chrome.com/docs/ai/webmcp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brass-400 transition-colors"
            >
              WebMCP Standard
            </a>
            <Link to="/dashboard" className="hover:text-brass-400 transition-colors">
              Production Slate
            </Link>
            <Link to="/login" className="hover:text-brass-400 transition-colors">
              Director Login
            </Link>
          </div>

          <div>
            <span>Built with WebMCP, Gemini 2.0 Flash & React 18</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
