import React, { useEffect, useState, useCallback } from 'react'
import { useProject } from '../store/ProjectStore.jsx'
import SceneIntelligencePanel from './SceneIntelligencePanel.jsx'

export default function ScreenplayEditor({ scene, onNavigateToRevisions }) {
  const { dispatch } = useProject()
  const [text, setText] = useState(scene.screenplay)
  const [showMeta, setShowMeta] = useState(true)
  const [showIntelligence, setShowIntelligence] = useState(false)

  useEffect(() => {
    setText(scene.screenplay)
  }, [scene.id, scene.screenplay])

  // Live continuous auto-save while typing (debounced 350ms)
  useEffect(() => {
    if (text !== scene.screenplay) {
      const timer = setTimeout(() => {
        dispatch({ type: 'UPDATE_SCENE_TEXT', payload: { sceneId: scene.id, screenplay: text } })
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [text, scene.id, scene.screenplay, dispatch])

  function commit() {
    if (text !== scene.screenplay) {
      dispatch({ type: 'UPDATE_SCENE_TEXT', payload: { sceneId: scene.id, screenplay: text } })
    }
  }

  const handleProposed = useCallback(() => {
    if (onNavigateToRevisions) onNavigateToRevisions()
  }, [onNavigateToRevisions])

  return (
    <div className="h-full flex flex-col">
      {/* Scene header */}
      <div className="px-5 py-3.5 border-b border-studio-800 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-studio-500">
            Scene {String(scene.number).padStart(2, '0')}
          </p>
          <h2 className="font-serif text-lg text-studio-100">{scene.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {onNavigateToRevisions && (
            <button
              onClick={() => onNavigateToRevisions('history')}
              className="text-xs px-2.5 py-1.5 border border-studio-700 rounded hover:border-studio-500 text-studio-400 hover:text-studio-200 transition-colors flex items-center gap-1.5"
            >
              <span>History</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-studio-800 text-studio-300 font-mono">
                v{scene.history?.length || 1}
              </span>
            </button>
          )}
          <button
            onClick={() => setShowIntelligence((v) => !v)}
            className={`text-xs px-2.5 py-1.5 border rounded transition-colors ${
              showIntelligence
                ? 'border-brass-600 text-brass-400 bg-brass-950/30'
                : 'border-studio-700 text-studio-400 hover:border-studio-500 hover:text-studio-200'
            }`}
          >
            {showIntelligence ? '▾ Intelligence' : '▸ Intelligence'}
          </button>
          <button
            onClick={() => setShowMeta((v) => !v)}
            className="text-xs px-2.5 py-1.5 border border-studio-700 rounded hover:border-studio-500 text-studio-400 hover:text-studio-200 transition-colors"
          >
            {showMeta ? 'Hide notes' : 'Show notes'}
          </button>
        </div>
      </div>

      {/* Scene metadata */}
      {showMeta && (
        <div className="px-5 py-3 border-b border-studio-800 bg-studio-900/60 text-sm space-y-1.5 shrink-0">
          <p className="text-studio-400">
            <span className="text-studio-500">Emotional goal — </span>
            {scene.emotionalGoal}
          </p>
          <p className="text-studio-400">
            <span className="text-studio-500">Continuity notes — </span>
            {scene.continuityNotes}
          </p>
          <p className="text-studio-400">
            <span className="text-studio-500">Summary — </span>
            {scene.summary}
          </p>
        </div>
      )}

      {/* Screenplay textarea */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          spellCheck={false}
          className="slug-line w-full h-full min-h-[420px] bg-transparent text-studio-100 text-[15px] leading-relaxed resize-none whitespace-pre-wrap"
        />
      </div>

      {/* AI Intelligence panel — collapsible, attached to the bottom */}
      {showIntelligence && (
        <SceneIntelligencePanel
          scene={scene}
          onPropose={handleProposed}
        />
      )}
    </div>
  )
}
