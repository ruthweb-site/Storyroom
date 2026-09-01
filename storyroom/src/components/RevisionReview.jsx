import React, { useState, useMemo } from 'react'
import { useProject } from '../store/ProjectStore.jsx'
import { useWebMCP } from '../webmcp/WebMCPProvider.jsx'

// Word-level diff highlighter
function computeDiff(originalStr = '', proposedStr = '') {
  const origLines = originalStr.split('\n')
  const propLines = proposedStr.split('\n')
  const maxLines = Math.max(origLines.length, propLines.length)
  const diffRows = []

  for (let i = 0; i < maxLines; i++) {
    const orig = origLines[i]
    const prop = propLines[i]

    if (orig === undefined) {
      diffRows.push({ type: 'added', orig: null, prop, origWords: [], propWords: [{ text: prop, type: 'added' }] })
    } else if (prop === undefined) {
      diffRows.push({ type: 'removed', orig, prop: null, origWords: [{ text: orig, type: 'removed' }], propWords: [] })
    } else if (orig === prop) {
      diffRows.push({ type: 'unchanged', orig, prop, origWords: [{ text: orig, type: 'same' }], propWords: [{ text: prop, type: 'same' }] })
    } else {
      // Line differs — compute word tokens
      const oWords = orig.split(/(\s+)/)
      const pWords = prop.split(/(\s+)/)
      const oSet = new Set(oWords.filter((w) => w.trim()))
      const pSet = new Set(pWords.filter((w) => w.trim()))

      const origTokens = oWords.map((w) => ({
        text: w,
        type: !w.trim() ? 'space' : pSet.has(w) ? 'same' : 'removed',
      }))
      const propTokens = pWords.map((w) => ({
        text: w,
        type: !w.trim() ? 'space' : oSet.has(w) ? 'same' : 'added',
      }))

      diffRows.push({ type: 'modified', orig, prop, origWords: origTokens, propWords: propTokens })
    }
  }

  return diffRows
}

function DiffViewer({ originalText, proposedText }) {
  const [viewMode, setViewMode] = useState('side-by-side') // 'side-by-side' | 'unified'
  const diffRows = useMemo(() => computeDiff(originalText, proposedText), [originalText, proposedText])

  const stats = useMemo(() => {
    let additions = 0
    let deletions = 0
    diffRows.forEach((r) => {
      if (r.type === 'added') additions++
      else if (r.type === 'removed') deletions++
      else if (r.type === 'modified') {
        additions++
        deletions++
      }
    })
    return { additions, deletions }
  }, [diffRows])

  return (
    <div className="border border-studio-800 rounded-lg overflow-hidden bg-studio-950 font-mono text-[12px]">
      {/* Diff Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-studio-900/80 border-b border-studio-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-studio-400 font-sans font-medium uppercase tracking-wider text-[10px]">
            Visual Compare
          </span>
          <div className="flex items-center gap-2 font-sans text-[11px]">
            <span className="text-emerald-400">+{stats.additions} lines</span>
            <span className="text-rose-400">-{stats.deletions} lines</span>
          </div>
        </div>
        <div className="flex items-center gap-1 font-sans">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-studio-800 text-studio-100 font-medium'
                : 'text-studio-500 hover:text-studio-300'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('unified')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              viewMode === 'unified'
                ? 'bg-studio-800 text-studio-100 font-medium'
                : 'text-studio-500 hover:text-studio-300'
            }`}
          >
            Unified Diff
          </button>
        </div>
      </div>

      {/* Side-by-side layout */}
      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-2 divide-x divide-studio-800/80 max-h-[440px] overflow-y-auto">
          {/* Original Column */}
          <div className="p-3 bg-rose-950/5">
            <p className="font-sans text-[10px] uppercase tracking-widest text-rose-400/80 font-bold mb-2 pb-1 border-b border-rose-900/20">
              ORIGINAL DRAFT
            </p>
            <div className="space-y-0.5 leading-relaxed">
              {diffRows.map((row, idx) => (
                <div
                  key={`orig-${idx}`}
                  className={`px-1.5 py-0.5 rounded ${
                    row.type === 'removed'
                      ? 'bg-rose-950/40 text-rose-300 line-through decoration-rose-500/60'
                      : row.type === 'modified'
                      ? 'bg-rose-950/20 text-rose-200'
                      : row.type === 'added'
                      ? 'opacity-20 select-none text-studio-700'
                      : 'text-studio-400'
                  }`}
                >
                  {row.origWords.length > 0 ? (
                    row.origWords.map((tok, ti) => (
                      <span
                        key={ti}
                        className={
                          tok.type === 'removed'
                            ? 'bg-rose-900/60 text-rose-200 px-0.5 rounded font-semibold'
                            : ''
                        }
                      >
                        {tok.text}
                      </span>
                    ))
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Proposed Column */}
          <div className="p-3 bg-emerald-950/5">
            <p className="font-sans text-[10px] uppercase tracking-widest text-emerald-400/80 font-bold mb-2 pb-1 border-b border-emerald-900/20">
              AI PROPOSED REVISION
            </p>
            <div className="space-y-0.5 leading-relaxed">
              {diffRows.map((row, idx) => (
                <div
                  key={`prop-${idx}`}
                  className={`px-1.5 py-0.5 rounded ${
                    row.type === 'added'
                      ? 'bg-emerald-950/40 text-emerald-300'
                      : row.type === 'modified'
                      ? 'bg-emerald-950/20 text-emerald-200'
                      : row.type === 'removed'
                      ? 'opacity-20 select-none text-studio-700'
                      : 'text-studio-100'
                  }`}
                >
                  {row.propWords.length > 0 ? (
                    row.propWords.map((tok, ti) => (
                      <span
                        key={ti}
                        className={
                          tok.type === 'added'
                            ? 'bg-emerald-800/60 text-emerald-100 px-0.5 rounded font-semibold'
                            : ''
                        }
                      >
                        {tok.text}
                      </span>
                    ))
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Unified view */}
      {viewMode === 'unified' && (
        <div className="p-3 max-h-[440px] overflow-y-auto space-y-1">
          {diffRows.map((row, idx) => {
            if (row.type === 'unchanged') {
              return (
                <div key={idx} className="text-studio-400 px-2 py-0.5">
                  <span className="text-studio-600 mr-2 select-none"> </span>
                  {row.orig}
                </div>
              )
            }
            if (row.type === 'removed') {
              return (
                <div key={idx} className="bg-rose-950/40 text-rose-300 px-2 py-0.5 rounded">
                  <span className="text-rose-500 mr-2 select-none">-</span>
                  {row.orig}
                </div>
              )
            }
            if (row.type === 'added') {
              return (
                <div key={idx} className="bg-emerald-950/40 text-emerald-300 px-2 py-0.5 rounded">
                  <span className="text-emerald-500 mr-2 select-none">+</span>
                  {row.prop}
                </div>
              )
            }
            // modified
            return (
              <div key={idx} className="space-y-0.5">
                <div className="bg-rose-950/30 text-rose-300/90 px-2 py-0.5 rounded">
                  <span className="text-rose-500 mr-2 select-none">-</span>
                  {row.orig}
                </div>
                <div className="bg-emerald-950/30 text-emerald-300 px-2 py-0.5 rounded font-medium">
                  <span className="text-emerald-500 mr-2 select-none">+</span>
                  {row.prop}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RevisionCard({ revision, scene }) {
  const registry = useWebMCP()
  const [comparing, setComparing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null) // 'accepted' | 'rejected'
  const [errorMsg, setErrorMsg] = useState(null)

  async function handleDecision(decision) {
    setBusy(true)
    setErrorMsg(null)
    try {
      if (decision === 'accepted' || decision === 'approved') {
        // Step 1: Explicit Human Approval in trusted store
        if (registry.approveRevision) {
          registry.approveRevision(revision.id)
        }
        // Step 2: Commit approved revision via WebMCP apply_revision
        const res = await registry.callTool('apply_revision', { revisionId: revision.id })
        if (res?.success === false) {
          setErrorMsg(res.message || res.error)
          return
        }
        setFeedback('accepted')
      } else if (decision === 'rejected') {
        if (registry.rejectRevision) {
          registry.rejectRevision(revision.id)
        }
        setFeedback('rejected')
      }
      setTimeout(() => setFeedback(null), 3500)
    } catch (err) {
      setErrorMsg(err.message || 'Action failed.')
    } finally {
      setBusy(false)
    }
  }

  const sceneNumber = scene ? String(scene.number).padStart(2, '0') : '—'
  const sceneTitle = scene?.title || 'Unknown Scene'

  const directorIntentRules = revision.directorIntentAlignment?.length > 0
    ? revision.directorIntentAlignment
    : [
        'Prefer visual storytelling over exposition.',
        'Characters rarely say exactly what they feel.',
        'Keep emotional moments restrained.',
        'Silence can carry emotion.',
      ]

  const continuityNotes = revision.continuityConsiderations?.length > 0
    ? revision.continuityConsiderations
    : ['Character names and core facts preserved.', 'Preserves scene timeline and props.']

  const potentialRisk = revision.potentialRisks?.length > 0
    ? (Array.isArray(revision.potentialRisks) ? revision.potentialRisks.join(' ') : revision.potentialRisks)
    : 'Relies heavily on actor subtext and precise editing timing rather than verbal explanation.'

  const isPending = revision.status === 'pending' || revision.status === 'approved'

  return (
    <div className="border border-studio-700 bg-studio-900/90 rounded-xl overflow-hidden shadow-2xl transition-all">
      {/* Header */}
      <div className="px-6 py-4 bg-studio-950 border-b border-studio-800 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-brass-500/10 border border-brass-500/30 text-brass-400">
              <span className="w-1.5 h-1.5 rounded-full bg-brass-400 animate-pulse" />
              AI PROPOSED REVISION
            </span>
            <span className="text-studio-600 text-xs">•</span>
            <span className="text-studio-400 text-xs font-mono">
              {new Date(revision.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <h3 className="font-serif text-lg text-studio-100 font-semibold tracking-wide">
            Scene {sceneNumber} <span className="text-studio-500 font-normal">/</span> {sceneTitle.toUpperCase()}
          </h3>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {(revision.status === 'applied' || revision.status === 'accepted') && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 shadow-sm">
              <span>✓</span> Accepted & Applied by Director
            </span>
          )}
          {revision.status === 'approved' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 shadow-sm">
              <span>✓</span> Approved by Director
            </span>
          )}
          {revision.status === 'rejected' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-400">
              <span>✕</span> Rejected by Director
            </span>
          )}
          {revision.status === 'pending' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-brass-950/50 border border-brass-500/50 text-brass-300 animate-pulse">
              Pending Director Approval
            </span>
          )}
        </div>
      </div>

      {/* Success / Feedback Alert */}
      {feedback === 'accepted' && (
        <div className="px-6 py-3 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-studio-950 flex items-center justify-center font-bold text-[10px]">✓</span>
            <span>Screenplay updated successfully! Version history logged.</span>
          </div>
          <span className="text-emerald-400/80 text-[11px]">Principle honored: The Human Decides</span>
        </div>
      )}
      {feedback === 'rejected' && (
        <div className="px-6 py-3 bg-rose-950/80 border-b border-rose-500/40 text-rose-300 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-rose-500 text-studio-950 flex items-center justify-center font-bold text-[10px]">✕</span>
            <span>Revision rejected. The screenplay remains unchanged.</span>
          </div>
          <span className="text-rose-400/80 text-[11px]">Human Decision: Preserved Original Script</span>
        </div>
      )}

      {/* Main Body */}
      <div className="p-6 space-y-6">
        {/* Compare / Screenplay Content */}
        {comparing ? (
          <DiffViewer originalText={revision.originalText} proposedText={revision.proposedText} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Original Card */}
            <div className="border border-studio-800 rounded-lg p-4 bg-studio-950/50 flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-studio-800/80">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-studio-500">
                  ORIGINAL
                </span>
                <span className="text-[10px] text-studio-600 font-mono">Current Script</span>
              </div>
              <pre className="slug-line flex-1 whitespace-pre-wrap font-mono text-[12px] text-studio-400 leading-relaxed overflow-y-auto max-h-[300px] select-text">
                {revision.originalText}
              </pre>
            </div>

            {/* Proposed Card */}
            <div className="border border-brass-600/30 rounded-lg p-4 bg-brass-950/10 flex flex-col shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-brass-600/20">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brass-400">
                  PROPOSED
                </span>
                <span className="text-[10px] text-brass-500/80 font-mono">AI Revision</span>
              </div>
              <pre className="slug-line flex-1 whitespace-pre-wrap font-mono text-[12px] text-studio-100 leading-relaxed overflow-y-auto max-h-[300px] select-text">
                {revision.proposedText}
              </pre>
            </div>
          </div>
        )}

        {/* Structured Context: WHY, DIRECTOR'S INTENT, CONTINUITY, RISKS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* WHY */}
          <div className="bg-studio-950/70 border border-studio-800/80 rounded-lg p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-brass-500 text-xs">◆</span>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-studio-300">
                WHY
              </h4>
            </div>
            <p className="text-xs text-studio-300 leading-relaxed">
              {revision.reason || 'Restrained subtext pass aligning scene actions with emotional beats.'}
            </p>
          </div>

          {/* POTENTIAL RISK */}
          <div className="bg-studio-950/70 border border-studio-800/80 rounded-lg p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">⚠</span>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400/90">
                POTENTIAL RISK
              </h4>
            </div>
            <p className="text-xs text-studio-400 leading-relaxed">
              {potentialRisk}
            </p>
          </div>

          {/* DIRECTOR'S INTENT */}
          <div className="bg-studio-950/70 border border-studio-800/80 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-brass-400 text-xs">★</span>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-studio-300">
                DIRECTOR'S INTENT
              </h4>
            </div>
            <ul className="space-y-1.5">
              {directorIntentRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-studio-300">
                  <span className="text-brass-500 flex-shrink-0 mt-0.5">✓</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTINUITY */}
          <div className="bg-studio-950/70 border border-studio-800/80 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-xs">◎</span>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-studio-300">
                CONTINUITY
              </h4>
            </div>
            <ul className="space-y-1.5">
              {continuityNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-studio-300">
                  <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {errorMsg && (
          <div className="px-4 py-2.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="pt-3 border-t border-studio-800 flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => setComparing((c) => !c)}
            className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-2 ${
              comparing
                ? 'bg-studio-800 border-studio-600 text-studio-100'
                : 'border-studio-700 hover:border-studio-500 text-studio-300 hover:text-studio-100'
            }`}
          >
            <span>⚖</span>
            <span>{comparing ? 'Close Visual Diff' : 'COMPARE'}</span>
          </button>

          {isPending ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDecision('rejected')}
                disabled={busy}
                className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wide border border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 hover:border-rose-700 transition-all disabled:opacity-40 flex items-center gap-1.5"
              >
                <span>✕</span>
                <span>REJECT REVISION</span>
              </button>
              <button
                onClick={() => handleDecision('accepted')}
                disabled={busy}
                className="px-6 py-2 rounded-lg text-xs font-bold tracking-wider uppercase bg-brass-500 text-studio-950 hover:bg-brass-400 shadow-lg shadow-brass-900/30 transition-all disabled:opacity-40 flex items-center gap-2"
              >
                <span>✓</span>
                <span>ACCEPT REVISION</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-studio-500 italic">
              Decision resolved on {new Date(revision.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SceneVersionHistoryView({ scenes, onRestore }) {
  const [selectedSceneId, setSelectedSceneId] = useState(scenes[0]?.id)
  const currentScene = scenes.find((s) => s.id === selectedSceneId) || scenes[0]

  const history = currentScene?.history || [
    {
      version: 1,
      label: 'Version 1 (Original)',
      type: 'original',
      screenplay: currentScene?.screenplay,
      timestamp: new Date().toISOString(),
      reason: 'Initial screenplay draft',
      author: 'Director',
    },
  ]

  const [expandedVersion, setExpandedVersion] = useState(history[history.length - 1]?.version)

  return (
    <div className="space-y-6">
      {/* Scene selector tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-studio-800">
        {scenes.map((s) => {
          const isSelected = s.id === currentScene?.id
          const count = s.history?.length || 1
          return (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSceneId(s.id)
                setExpandedVersion((s.history || [])[(s.history || []).length - 1]?.version || 1)
              }}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                isSelected
                  ? 'bg-brass-500 text-studio-950 font-bold'
                  : 'bg-studio-900 border border-studio-800 text-studio-400 hover:text-studio-200'
              }`}
            >
              <span>Scene {String(s.number).padStart(2, '0')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-studio-950/20 text-studio-950' : 'bg-studio-800 text-studio-500'}`}>
                v{count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected Scene Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-serif text-lg text-studio-100 font-semibold">
            Scene {String(currentScene.number).padStart(2, '0')}: {currentScene.title}
          </h4>
          <p className="text-xs text-studio-500 mt-0.5">
            {history.length} recorded version{history.length !== 1 ? 's' : ''} in immutable revision timeline
          </p>
        </div>
      </div>

      {/* Version timeline cards */}
      <div className="space-y-3">
        {history.map((ver) => {
          const isExpanded = expandedVersion === ver.version
          const isCurrentActive = ver.screenplay === currentScene.screenplay

          const badgeColor =
            ver.type === 'original'
              ? 'bg-studio-800 text-studio-300 border-studio-700'
              : ver.type === 'ai_proposal'
              ? 'bg-brass-950/60 text-brass-400 border-brass-600/40'
              : ver.type === 'director_accepted'
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-600/40'
              : 'bg-studio-800 text-studio-400 border-studio-700'

          return (
            <div
              key={ver.version}
              className={`border rounded-lg overflow-hidden transition-all ${
                isCurrentActive ? 'border-brass-600/50 bg-studio-900/80' : 'border-studio-800 bg-studio-950/50'
              }`}
            >
              <div
                onClick={() => setExpandedVersion(isExpanded ? null : ver.version)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-studio-900/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                    {ver.label || `Version ${ver.version}`}
                  </span>
                  {isCurrentActive && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                      Active on Screenplay
                    </span>
                  )}
                  <span className="text-xs text-studio-500 hidden sm:inline">
                    — {ver.reason}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-studio-600 font-mono">
                    {new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-studio-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-studio-800 space-y-4">
                  <div className="p-3 bg-studio-950 rounded border border-studio-800/80">
                    <p className="text-[10px] uppercase tracking-widest text-studio-500 font-bold mb-2">
                      Screenplay Text (Version {ver.version})
                    </p>
                    <pre className="slug-line whitespace-pre-wrap font-mono text-[12px] text-studio-200 leading-relaxed max-h-[260px] overflow-y-auto">
                      {ver.screenplay}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-studio-500">
                      Author: <strong className="text-studio-300">{ver.author || 'Director'}</strong>
                    </span>
                    {!isCurrentActive && onRestore && (
                      <button
                        onClick={() => onRestore(currentScene.id, ver.version)}
                        className="px-3 py-1.5 rounded text-xs font-medium border border-brass-600/60 text-brass-300 hover:bg-brass-500 hover:text-studio-950 transition-colors"
                      >
                        Restore Version {ver.version} to Screenplay
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RevisionReview({ initialTab = 'revisions' }) {
  const { project, dispatch } = useProject()
  const [activeTab, setActiveTab] = useState(initialTab)

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
  }, [initialTab])

  const sceneById = useMemo(
    () => Object.fromEntries(project.scenes.map((s) => [s.id, s])),
    [project.scenes]
  )

  const sortedRevisions = useMemo(() => {
    return [...project.revisions].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (b.status === 'pending' && a.status !== 'pending') return 1
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }, [project.revisions])

  const pendingCount = sortedRevisions.filter((r) => r.status === 'pending').length

  function handleRestoreVersion(sceneId, versionNumber) {
    if (confirm(`Restore Version ${versionNumber} to active screenplay?`)) {
      dispatch({
        type: 'RESTORE_SCENE_VERSION',
        payload: { sceneId, versionNumber },
      })
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          tool: 'apply_revision',
          input: { sceneId, versionNumber },
          outputSummary: `Director restored Scene ${sceneById[sceneId]?.number || sceneId} to Version ${versionNumber}.`,
          status: 'success',
        },
      })
    }
  }

  return (
    <div className="h-full flex flex-col min-h-0 bg-studio-950 text-studio-200">
      {/* Central Product Principle Banner */}
      <div className="px-6 py-3 bg-gradient-to-r from-brass-950/60 via-studio-900 to-studio-950 border-b border-brass-500/20 shrink-0 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-brass-400 animate-ping" />
          <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-brass-400">
            THE AGENT PROPOSES. THE HUMAN DECIDES.
          </span>
        </div>
        <span className="text-xs text-studio-500 hidden md:inline">
          The agent never silently overwrites the screenplay.
        </span>
      </div>

      {/* Tabs Toolbar */}
      <div className="px-6 py-2.5 border-b border-studio-800 bg-studio-900/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('revisions')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'revisions'
                ? 'bg-studio-800 text-studio-100 shadow-sm border border-studio-700'
                : 'text-studio-400 hover:text-studio-200'
            }`}
          >
            <span>Revision Proposals</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brass-500 text-studio-950">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-studio-800 text-studio-100 shadow-sm border border-studio-700'
                : 'text-studio-400 hover:text-studio-200'
            }`}
          >
            <span>Scene Version History</span>
          </button>
        </div>

        <span className="text-xs text-studio-500">
          {project.scenes.length} Scenes in Project
        </span>
      </div>

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {activeTab === 'revisions' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {pendingCount > 0 && (
              <div className="p-4 rounded-xl bg-brass-950/70 border border-brass-500/50 flex items-center justify-between flex-wrap gap-3 shadow-lg shadow-brass-950/40 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-brass-400 animate-ping shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brass-300">
                      DIRECTOR REVIEW REQUIRED
                    </h4>
                    <p className="text-xs text-studio-200 mt-0.5">
                      Review the proposed revision before the agent can continue.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold text-brass-400 bg-brass-500/10 px-2.5 py-1 rounded-full border border-brass-500/30">
                    {pendingCount} Pending Decision{pendingCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {sortedRevisions.length === 0 ? (
              <div className="border border-dashed border-studio-800 rounded-xl p-12 text-center space-y-3 bg-studio-900/20">
                <div className="w-10 h-10 rounded-full bg-studio-800 flex items-center justify-center mx-auto text-studio-500 text-lg">
                  ✍
                </div>
                <h3 className="font-serif text-lg text-studio-200">No Revisions Proposed Yet</h3>
                <p className="text-xs text-studio-500 max-w-md mx-auto leading-relaxed">
                  When you or an external WebMCP agent asks for a screenplay rewrite (e.g. <em>"Make Scene 7 more tense"</em>), the proposed revision will appear here for your review and approval.
                </p>
              </div>
            ) : (
              sortedRevisions.map((rev) => {
                const scene = sceneById[rev.sceneId]
                return <RevisionCard key={rev.id} revision={rev} scene={scene} />
              })
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-5xl mx-auto">
            <SceneVersionHistoryView
              scenes={project.scenes}
              onRestore={handleRestoreVersion}
            />
          </div>
        )}
      </div>
    </div>
  )
}
