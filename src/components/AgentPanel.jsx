import React, { useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  Terminal,
  Activity,
  ArrowRight,
  ExternalLink,
  Bot
} from 'lucide-react'
import { useWebMCP } from '../webmcp/WebMCPProvider.jsx'
import AgentConsole from './AgentConsole.jsx'
import AgentActivityPanel from './AgentActivityPanel.jsx'

const TOOL_STATUSES = [
  { name: 'Story Context', tool: 'get_story_context' },
  { name: 'Current Scene', tool: 'get_current_scene' },
  { name: 'Scene Search', tool: 'search_scenes' },
  { name: 'Character Lookup', tool: 'get_character' },
  { name: 'Continuity Check', tool: 'check_continuity' },
  { name: 'Scene Analysis', tool: 'analyze_scene' },
  { name: 'Revision Proposal', tool: 'propose_rewrite' },
  { name: 'Apply Revision', tool: 'apply_revision' },
]

function ToolStatusSection({ onOpenToolRegistry }) {
  return (
    <div className="px-4 py-3 border-b border-studio-800 bg-studio-900/40">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] tracking-[0.16em] uppercase font-semibold text-studio-300">
            Agent Tools
          </span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            8 tools available
          </span>
        </div>
        <button
          onClick={onOpenToolRegistry}
          className="text-[11px] text-brass-400 hover:text-brass-300 transition-colors flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-brass-500 rounded px-1"
          title="Inspect WebMCP tool schemas and execute raw calls"
          aria-label="Inspect WebMCP Registry"
        >
          <span>Registry</span>
          <ExternalLink size={10} />
        </button>
      </div>

      {/* Grid of 8 registered tools */}
      <div className="grid grid-cols-2 gap-1.5">
        {TOOL_STATUSES.map((item) => (
          <div
            key={item.tool}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-studio-950/80 border border-studio-800/80 text-[10.5px] text-studio-200 hover:border-studio-700 transition-colors"
          >
            <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
            <span className="truncate font-medium">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AgentPanel({ onRevisionProposed, onOpenToolRegistry }) {
  return (
    <div className="h-full flex flex-col min-h-0 bg-studio-950">
      {/* HEADER */}
      <div className="px-4 py-3.5 border-b border-studio-800 bg-studio-900/60 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-brass-400" />
            <h2 className="font-serif text-sm tracking-[0.14em] font-bold text-studio-100 uppercase">
              AGENT
            </h2>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connected</span>
          </div>
        </div>

        <p className="text-xs text-studio-400 mt-1 italic">
          "StoryRoom tools available"
        </p>
      </div>

      {/* TOOL STATUS */}
      <ToolStatusSection onOpenToolRegistry={onOpenToolRegistry} />

      {/* AGENT REQUEST EXAMPLES & CONSOLE */}
      <AgentConsole onRevisionProposed={onRevisionProposed} />

      {/* ACTIVITY FEED TIMELINE */}
      <div className="flex-1 min-h-0">
        <AgentActivityPanel />
      </div>
    </div>
  )
}
