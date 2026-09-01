import React, { useState } from 'react'
import { Sparkles, ArrowRight, Play, AlertCircle, CheckCircle } from 'lucide-react'
import { useWebMCP } from '../webmcp/WebMCPProvider.jsx'
import { runAgent } from '../webmcp/agent.js'

const DEMO_REQUESTS = [
  "Check Riya's emotional arc.",
  'Find scenes involving Arjun.',
  'Check Scene 6 for continuity problems.',
  'Make Scene 7 more tense.',
]

export default function AgentConsole({ onRevisionProposed }) {
  const registry = useWebMCP()
  const [instruction, setInstruction] = useState('')
  const [running, setRunning] = useState(false)
  const [activeStep, setActiveStep] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const [error, setError] = useState(null)

  async function executeRequest(text) {
    const query = (text ?? instruction).trim()
    if (!query || running) return

    setRunning(true)
    setError(null)
    setLastResult(null)
    setActiveStep('Planning WebMCP tool executions…')

    try {
      const result = await runAgent(query, { registry })
      setLastResult(result)

      if (result.revision && onRevisionProposed && result.scene) {
        onRevisionProposed(result.scene.id)
      }
    } catch (err) {
      console.error('Agent execution error:', err)
      setError(err.message || 'Error executing agent request.')
    } finally {
      setRunning(false)
      setActiveStep('')
      setInstruction('')
    }
  }

  return (
    <div className="border-b border-studio-800 bg-studio-900/30 shrink-0">
      <div className="px-4 pt-3.5 pb-2">
        <span className="text-[11px] tracking-[0.16em] uppercase font-semibold text-studio-400">
          Agent Request Examples
        </span>
      </div>

      <div className="px-4 pb-3.5 space-y-2.5">
        {/* Hackathon Agent Demo Button */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('storyroom:run-agent-demo'))}
          disabled={running}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-brass-500 via-brass-400 to-brass-500 text-studio-950 font-bold text-xs shadow-md hover:brightness-110 transition-all group disabled:opacity-40"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">⚡</span>
            <span className="tracking-wider uppercase text-[11px]">Run Agent Demo</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-studio-950/20">
            9 Steps
          </span>
        </button>

        {/* Clickable Demo Requests */}
        <div className="grid grid-cols-1 gap-1.5">
          {DEMO_REQUESTS.map((demo) => (
            <button
              key={demo}
              onClick={() => executeRequest(demo)}
              disabled={running}
              className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-studio-800 bg-studio-950/60 hover:bg-studio-900 hover:border-brass-500/50 text-xs text-studio-300 hover:text-brass-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <span className="truncate">"{demo}"</span>
              <Play
                size={11}
                className="text-studio-600 group-hover:text-brass-400 shrink-0 ml-1 transition-colors"
              />
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="flex gap-1.5 pt-1">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeRequest()}
            placeholder="Type custom director prompt..."
            disabled={running}
            className="flex-1 bg-studio-950 border border-studio-800 rounded-md px-2.5 py-1.5 text-xs text-studio-200 placeholder-studio-600 focus:outline-none focus:border-brass-500/60 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => executeRequest()}
            disabled={running || !instruction.trim()}
            className="px-3 py-1.5 rounded-md bg-brass-500 text-studio-950 text-xs font-semibold hover:bg-brass-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm shrink-0"
          >
            <span>Run</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Live Running Indicator */}
        {running && (
          <div className="px-2.5 py-2 rounded bg-brass-500/10 border border-brass-500/20 text-xs text-brass-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brass-400 animate-ping shrink-0" />
            <span className="truncate">{activeStep || 'Calling WebMCP tools…'}</span>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="px-2.5 py-2 rounded bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-1.5">
            <AlertCircle size={13} className="shrink-0 text-rose-400" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Last Result Summary Card */}
        {lastResult && !running && (
          <div className="px-2.5 py-2 rounded-lg bg-studio-950 border border-studio-800 text-xs text-studio-300 space-y-1">
            <div className="flex items-center gap-1.5 text-brass-400 font-medium">
              <CheckCircle size={13} className="text-emerald-400" />
              <span>Tool Sequence Completed</span>
            </div>
            {lastResult.revision && (
              <p className="text-[11px] text-studio-400 leading-snug">
                Filed revision proposal for Scene {lastResult.scene?.number}. Click "Revision Review" above to accept or reject.
              </p>
            )}
            {lastResult.continuityResult && (
              <p className="text-[11px] text-studio-400 leading-snug">
                Continuity check: {lastResult.continuityResult.issueCount} issue(s) surfaced in timeline.
              </p>
            )}
            {lastResult.searchResult && (
              <p className="text-[11px] text-studio-400 leading-snug">
                Found {lastResult.searchResult.results.length} scene(s) matching query "{lastResult.searchResult.query}".
              </p>
            )}
            {lastResult.character && !lastResult.revision && (
              <p className="text-[11px] text-studio-400 leading-snug">
                Retrieved profile for {lastResult.character.name} ({lastResult.character.role}).
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
