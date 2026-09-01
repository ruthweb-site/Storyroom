import React, { useState } from 'react'
import {
  ShieldCheck,
  Play,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Terminal,
  Code2
} from 'lucide-react'
import { useWebMCP } from '../webmcp/WebMCPProvider.jsx'

const TOOL_DEFAULTS = {
  get_story_context: {},
  get_current_scene: { sceneId: 'scene-4' },
  search_scenes: { query: 'Arjun' },
  get_character: { characterName: 'Riya Mehta' },
  check_continuity: { sceneId: 'scene-6' },
  analyze_scene: { sceneId: 'scene-4' },
  propose_rewrite: { sceneId: 'scene-4', instruction: 'Make dialogue more restrained' },
  apply_revision: { revisionId: '', decision: 'accepted' },
}

function ToolCard({ tool }) {
  const registry = useWebMCP()
  const [inputs, setInputs] = useState(TOOL_DEFAULTS[tool.name] || {})
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  const props = tool.inputSchema?.properties || {}
  const propNames = Object.keys(props)
  const requiredProps = tool.inputSchema?.required || []

  async function run() {
    setRunning(true)
    setResult(null)
    try {
      const payload = {}
      for (const key of propNames) {
        if (inputs[key] !== undefined && inputs[key] !== '') {
          payload[key] = inputs[key]
        }
      }
      const output = await registry.callTool(tool.name, payload)
      setResult({ ok: true, output })
    } catch (e) {
      setResult({ ok: false, error: e.message })
    } finally {
      setRunning(false)
    }
  }

  function copySchema() {
    navigator.clipboard.writeText(JSON.stringify(tool.inputSchema, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-studio-800 rounded-xl overflow-hidden bg-studio-900/40 backdrop-blur-sm transition-all hover:border-studio-700/80 shadow-sm">
      {/* Tool Header */}
      <div className="px-5 py-3.5 bg-studio-900/80 border-b border-studio-800/80 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-brass-300">
              {tool.name}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-studio-800 text-studio-300 border border-studio-700">
              {tool.title || tool.name}
            </span>
          </div>
          <p className="text-studio-400 text-xs mt-1 leading-relaxed">
            {tool.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copySchema}
            className="p-1.5 text-studio-500 hover:text-studio-300 hover:bg-studio-800 rounded transition-colors"
            title="Copy JSON inputSchema"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>registered</span>
          </span>
        </div>
      </div>

      {/* Input Parameters */}
      {propNames.length > 0 && (
        <div className="px-5 py-3.5 border-b border-studio-800/60 bg-studio-950/40 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-studio-500">
            Parameters ({propNames.length})
          </p>
          <div className="grid grid-cols-1 gap-2">
            {propNames.map((key) => {
              const isReq = requiredProps.includes(key)
              const propDesc = props[key]?.description || ''
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-studio-300">
                      {key}
                      {isReq && <span className="text-rose-400 ml-0.5">*</span>}
                    </span>
                    <span className="text-[10px] font-mono text-studio-500">
                      {props[key]?.type || 'string'}
                    </span>
                  </div>
                  <input
                    placeholder={propDesc || key}
                    value={inputs[key] ?? ''}
                    onChange={(e) => setInputs((s) => ({ ...s, [key]: e.target.value }))}
                    className="w-full bg-studio-900 border border-studio-800 rounded-md px-3 py-1.5 text-xs font-mono text-studio-200 placeholder:text-studio-600 focus:outline-none focus:border-brass-500/60 transition-colors"
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="px-5 py-3 bg-studio-900/30 flex items-center justify-between">
        <button
          onClick={run}
          disabled={running}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-brass-500 text-studio-950 hover:bg-brass-400 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          <Play size={11} fill="currentColor" />
          <span>{running ? 'Executing WebMCP call…' : 'Call WebMCP Tool'}</span>
        </button>

        <span className="text-[11px] font-mono text-studio-500">
          document.modelContext.callTool("{tool.name}", ...)
        </span>
      </div>

      {/* Output Viewer */}
      {result && (
        <div className="border-t border-studio-800 bg-studio-950 p-4 font-mono text-[11px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-studio-500 flex items-center gap-1">
              {result.ok ? (
                <>
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Structured Response (200 OK)</span>
                </>
              ) : (
                <>
                  <AlertCircle size={12} className="text-rose-400" />
                  <span className="text-rose-400">WebMCP Exception</span>
                </>
              )}
            </span>
          </div>

          <pre className="text-studio-300 whitespace-pre-wrap max-h-60 overflow-y-auto bg-studio-900/80 p-3 rounded-md border border-studio-800/80 text-[11px] leading-relaxed">
            {result.ok ? JSON.stringify(result.output, null, 2) : result.error}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function WebMCPToolRegistryPanel() {
  const registry = useWebMCP()

  return (
    <div className="h-full overflow-y-auto px-6 py-6 space-y-6 max-w-5xl w-full mx-auto">
      {/* Banner */}
      <div className="border border-emerald-500/30 rounded-xl p-4 bg-emerald-500/5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              WebMCP Protocol Active &amp; Registered
            </h3>
            <p className="text-xs text-studio-400 mt-1 leading-relaxed">
              All 8 tools below are exposed via <code className="text-brass-400 font-mono">document.modelContext.registerTool(...)</code> and <code className="text-brass-400 font-mono">navigator.modelContext.registerTool(...)</code>. External browser agents or in-page scripts can inspect and invoke them directly.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 shrink-0">
          {registry.definitions.length} Tools Live
        </span>
      </div>

      {/* Tools List */}
      <div className="space-y-4">
        {registry.definitions.map((tool) => (
          <ToolCard key={tool.name} tool={tool} />
        ))}
      </div>
    </div>
  )
}
