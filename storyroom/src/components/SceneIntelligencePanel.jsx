// SceneIntelligencePanel.jsx
//
// Inline AI analysis panel rendered inside the scene editor.
// Displays results from analyzeScene() including:
//   - Pacing, emotional intensity, conflict
//   - Dialogue assessment with flagged lines
//   - Visual storytelling score
//   - Director's Intent alignment checklist
//   - Findings/suggestions with severity badges

import React, { useState, useCallback } from 'react'
import { useWebMCP } from '../webmcp/WebMCPProvider.jsx'
import { getAIStatus } from '../webmcp/aiIntelligence.js'

function SeverityBadge({ severity }) {
  const map = {
    suggestion: 'text-brass-400 border-brass-600/40 bg-brass-950/30',
    warning: 'text-amber-400 border-amber-600/40 bg-amber-950/20',
    error: 'text-red-400 border-red-600/40 bg-red-950/20',
    info: 'text-studio-400 border-studio-700 bg-studio-900/30',
  }
  const label = { suggestion: 'Suggestion', warning: 'Warning', error: 'Error', info: 'Info' }
  return (
    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${map[severity] || map.info}`}>
      {label[severity] || severity}
    </span>
  )
}

function ModeIndicator({ mode }) {
  if (mode === 'ai') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-brass-400">
        <span className="w-1.5 h-1.5 rounded-full bg-brass-400 animate-pulse inline-block" />
        Gemini AI
      </span>
    )
  }
  if (mode === 'demo_fallback') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-amber-500">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        AI offline — demo
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-studio-500">
      <span className="w-1.5 h-1.5 rounded-full bg-studio-600 inline-block" />
      Demo Intelligence
    </span>
  )
}

function Section({ title, children, accent = 'studio' }) {
  const colors = {
    brass: 'text-brass-500',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    studio: 'text-studio-500',
  }
  return (
    <div className="space-y-2">
      <p className={`text-[10px] uppercase tracking-widest font-medium ${colors[accent] || colors.studio}`}>
        {title}
      </p>
      {children}
    </div>
  )
}

export default function SceneIntelligencePanel({ scene, onPropose }) {
  const registry = useWebMCP()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [instruction, setInstruction] = useState('')
  const [proposing, setProposing] = useState(false)
  const [proposed, setProposed] = useState(false)

  const aiStatus = getAIStatus()

  const runAnalysis = useCallback(async () => {
    if (!scene) return
    setLoading(true)
    setError(null)
    setAnalysis(null)
    try {
      const result = await registry.callTool('analyze_scene', { sceneId: scene.id })
      setAnalysis(result)
    } catch (e) {
      setError(e.message || 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }, [scene, registry])

  const runPropose = useCallback(async () => {
    if (!scene || !instruction.trim()) return
    setProposing(true)
    setProposed(false)
    try {
      await registry.callTool('propose_rewrite', {
        sceneId: scene.id,
        instruction: instruction.trim(),
      })
      setProposed(true)
      if (onPropose) onPropose()
    } catch (e) {
      setError(e.message || 'Rewrite proposal failed.')
    } finally {
      setProposing(false)
    }
  }, [scene, instruction, registry, onPropose])

  if (!scene) return null

  return (
    <div className="border-t border-studio-800 bg-studio-950/40">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-studio-800/60">
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-widest text-studio-400 font-medium">
            Scene Intelligence
          </span>
          <ModeIndicator mode={analysis?.mode || aiStatus.mode} />
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="text-[11px] px-3 py-1 rounded border border-studio-700 text-studio-300 hover:border-brass-600 hover:text-brass-400 transition-colors disabled:opacity-40 font-medium"
        >
          {loading ? 'Analyzing…' : analysis ? 'Re-analyze' : 'Analyze scene'}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="px-4 py-6 flex items-center gap-3 text-studio-500 text-sm">
          <span className="w-3 h-3 rounded-full border-2 border-brass-500 border-t-transparent animate-spin inline-block" />
          Analyzing scene against Director's Memory…
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="px-4 py-3 text-sm text-red-400 bg-red-950/20 border-b border-red-900/30">
          {error}
        </div>
      )}

      {/* Analysis results */}
      {analysis && !loading && (
        <div className="px-4 py-4 space-y-5">

          {/* Metrics row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-studio-900/40 rounded-lg px-3 py-2.5 border border-studio-800/50">
              <p className="text-[10px] uppercase tracking-widest text-studio-500 mb-1">Pacing</p>
              <p className="text-[12px] text-studio-200 leading-snug">{analysis.pacing}</p>
            </div>
            <div className="bg-studio-900/40 rounded-lg px-3 py-2.5 border border-studio-800/50">
              <p className="text-[10px] uppercase tracking-widest text-studio-500 mb-1">Visual Storytelling</p>
              <p className="text-[12px] text-studio-200 leading-snug">
                {typeof analysis.visualStorytelling === 'object'
                  ? `${analysis.visualStorytelling.score} — ${analysis.visualStorytelling.notes}`
                  : analysis.visualStorytelling}
              </p>
            </div>
          </div>

          {/* Dialogue assessment */}
          {analysis.dialogue && (
            <Section title="Dialogue" accent="brass">
              <div className="bg-studio-900/40 rounded-lg px-3 py-2.5 border border-studio-800/50 space-y-2">
                <p className="text-[12px] text-studio-200 leading-snug">
                  {typeof analysis.dialogue === 'object'
                    ? analysis.dialogue.assessment
                    : analysis.dialogue}
                </p>
                {analysis.dialogue?.flaggedLines?.length > 0 && (
                  <div className="pt-1 space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-amber-600">Flagged lines</p>
                    {analysis.dialogue.flaggedLines.map((line, i) => (
                      <p key={i} className="text-[11px] text-amber-400/80 italic border-l-2 border-amber-700 pl-2">
                        "{line}"
                      </p>
                    ))}
                    {analysis.dialogue.suggestion && (
                      <p className="text-[11px] text-studio-400 pt-1">
                        <span className="text-studio-500">Suggestion — </span>
                        {analysis.dialogue.suggestion}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Director's Intent alignment */}
          {Array.isArray(analysis.directorIntentAlignment) && analysis.directorIntentAlignment.length > 0 && (
            <Section title="Director's Intent Alignment" accent="brass">
              <ul className="space-y-1.5">
                {analysis.directorIntentAlignment.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px]">
                    <span className={item.startsWith('✓') ? 'text-emerald-500' : item.startsWith('⚠') ? 'text-amber-500' : 'text-studio-500'}>
                      {item.startsWith('✓') || item.startsWith('⚠') ? '' : '→'}
                    </span>
                    <span className="text-studio-300">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Findings */}
          {analysis.findings?.length > 0 && (
            <Section title={`${analysis.findings.length} Finding${analysis.findings.length !== 1 ? 's' : ''}`} accent="amber">
              <div className="space-y-2">
                {analysis.findings.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-studio-800/50 bg-studio-900/30 px-3 py-2.5 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-studio-400 uppercase tracking-wide">
                        {f.dimension?.replace(/_/g, ' ')}
                      </span>
                      <SeverityBadge severity={f.severity} />
                    </div>
                    <p className="text-[12px] text-studio-200 leading-snug">{f.message}</p>
                    {f.evidence?.map((ev, j) => (
                      <p key={j} className="text-[11px] text-amber-400/70 italic border-l-2 border-amber-800 pl-2 mt-1">
                        "{ev}"
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* No findings */}
          {analysis.findings?.length === 0 && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <span className="text-emerald-500">✓</span>
              Scene is aligned with all Director's Memory rules. No issues detected.
            </div>
          )}
        </div>
      )}

      {/* Rewrite proposal panel */}
      <div className="border-t border-studio-800/60 px-4 py-3">
        <p className="text-[10px] uppercase tracking-widest text-studio-500 mb-2 font-medium">
          Propose Rewrite
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runPropose()}
            placeholder='e.g. "Make this more tense without adding melodrama."'
            className="flex-1 min-w-0 bg-studio-900/60 border border-studio-700 rounded px-3 py-1.5 text-[12px] text-studio-200 placeholder-studio-600 focus:outline-none focus:border-brass-600 transition-colors"
          />
          <button
            onClick={runPropose}
            disabled={proposing || !instruction.trim()}
            className="px-3 py-1.5 rounded bg-brass-500/90 text-studio-950 text-[11px] font-semibold hover:bg-brass-400 transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            {proposing ? 'Proposing…' : 'Propose'}
          </button>
        </div>
        {proposed && (
          <p className="text-emerald-400 text-[11px] mt-2">
            ✓ Revision proposed — see Revision Review tab.
          </p>
        )}
      </div>
    </div>
  )
}
