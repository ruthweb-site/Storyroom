import React, { useState } from 'react'
import {
  BrainCircuit,
  Plus,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Lightbulb,
  FileText
} from 'lucide-react'
import { useProject } from '../store/ProjectStore.jsx'

const DEFAULT_MEMORY_RULES = [
  'Prefer visual storytelling over exposition.',
  'Keep emotional moments restrained.',
  'Avoid melodramatic dialogue.',
  'Characters rarely say exactly what they feel.',
  'Maintain psychological tension.',
  'Avoid unnecessary exposition.',
  'Dialogue should sound natural.',
  'Silence can carry emotional information.',
]

export default function DirectorsMemory() {
  const { project, dispatch } = useProject()
  const [newRule, setNewRule] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editText, setEditText] = useState('')
  const [editingIntent, setEditingIntent] = useState(false)
  const [intentText, setIntentText] = useState(project.directorIntent || '')

  const memoryRules = project.directorsMemory || []

  function handleAddRule(e) {
    if (e) e.preventDefault()
    if (!newRule.trim()) return
    dispatch({
      type: 'ADD_MEMORY_RULE',
      payload: { rule: newRule.trim() },
    })
    setNewRule('')
  }

  function handleRemoveRule(index) {
    dispatch({
      type: 'REMOVE_MEMORY_RULE',
      payload: { index },
    })
  }

  function startEdit(index, currentText) {
    setEditingIndex(index)
    setEditText(currentText)
  }

  function saveEdit(index) {
    if (!editText.trim()) return
    dispatch({
      type: 'UPDATE_MEMORY_RULE',
      payload: { index, rule: editText.trim() },
    })
    setEditingIndex(null)
    setEditText('')
  }

  function cancelEdit() {
    setEditingIndex(null)
    setEditText('')
  }

  function handleSaveIntent() {
    dispatch({
      type: 'UPDATE_DIRECTOR_INTENT',
      payload: { directorIntent: intentText },
    })
    setEditingIntent(false)
  }

  function handleResetRules() {
    if (confirm('Reset Director\'s Memory to the 8 standard creative rules?')) {
      DEFAULT_MEMORY_RULES.forEach((rule, idx) => {
        dispatch({
          type: idx === 0 ? 'UPDATE_MEMORY_RULE' : 'ADD_MEMORY_RULE',
          payload: { index: 0, rule },
        })
      })
      // Clear all and rebuild
      while (project.directorsMemory.length > 0) {
        dispatch({ type: 'REMOVE_MEMORY_RULE', payload: { index: 0 } })
      }
      DEFAULT_MEMORY_RULES.forEach((rule) => {
        dispatch({ type: 'ADD_MEMORY_RULE', payload: { rule } })
      })
    }
  }

  return (
    <div className="h-full flex flex-col min-h-0 bg-studio-950">
      {/* Header */}
      <div className="px-6 py-4 border-b border-studio-800 bg-studio-900/50 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit size={16} className="text-brass-500" />
            <h1 className="text-sm font-semibold tracking-wider text-studio-100 uppercase">
              DIRECTOR'S MEMORY
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-studio-800 text-brass-400 border border-studio-700">
              {memoryRules.length} Active Rules
            </span>
          </div>
          <p className="text-xs text-studio-400 mt-0.5 italic">
            "Creative rules the agent should remember."
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>WebMCP Live Sync</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl w-full mx-auto">
        {/* Director's Intent Card */}
        <div className="border border-studio-800 rounded-xl p-5 bg-gradient-to-b from-studio-900/80 to-studio-900/30 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-brass-400" />
              <h2 className="text-xs font-semibold tracking-wider text-studio-200 uppercase">
                Core Director's Intent
              </h2>
            </div>
            {editingIntent ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSaveIntent}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-brass-500 text-studio-950 hover:bg-brass-400 rounded transition-colors"
                >
                  <Check size={12} />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIntentText(project.directorIntent || '')
                    setEditingIntent(false)
                  }}
                  className="px-2 py-1 text-xs bg-studio-800 text-studio-300 hover:bg-studio-700 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingIntent(true)}
                className="flex items-center gap-1 text-xs text-studio-400 hover:text-studio-200"
              >
                <Edit3 size={12} />
                <span>Edit Intent</span>
              </button>
            )}
          </div>

          {editingIntent ? (
            <textarea
              value={intentText}
              onChange={(e) => setIntentText(e.target.value)}
              rows={3}
              className="w-full bg-studio-950 border border-studio-700 rounded-md p-2.5 text-xs text-studio-200 focus:outline-none focus:border-brass-500/60 leading-relaxed resize-none"
            />
          ) : (
            <p className="text-xs text-studio-300 leading-relaxed font-light">
              {project.directorIntent || (
                <span className="italic text-studio-500">No director intent statement on file.</span>
              )}
            </p>
          )}
        </div>

        {/* Creative Rules Section */}
        <div className="border border-studio-800 rounded-xl p-5 bg-studio-900/30 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-studio-800/80">
            <div>
              <h2 className="text-xs font-semibold tracking-wider text-studio-200 uppercase flex items-center gap-2">
                <Lightbulb size={14} className="text-brass-400" />
                Creative Standing Guidelines ({memoryRules.length})
              </h2>
              <p className="text-[11px] text-studio-400 mt-0.5">
                Every rule below is injected into the WebMCP <code className="text-brass-400 font-mono">get_story_context</code> and <code className="text-brass-400 font-mono">analyze_scene</code> tools.
              </p>
            </div>

            <button
              onClick={handleResetRules}
              className="flex items-center gap-1 text-[11px] text-studio-500 hover:text-studio-300 transition-colors"
              title="Reset to 8 default rules"
            >
              <RotateCcw size={11} />
              <span>Reset Defaults</span>
            </button>
          </div>

          {/* Add Rule Form */}
          <form onSubmit={handleAddRule} className="flex gap-2">
            <input
              type="text"
              placeholder="Add a new standing creative rule (e.g. 'Keep subtext buried in mundane actions')..."
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              className="flex-1 bg-studio-900 border border-studio-800 rounded-lg px-3.5 py-2 text-xs text-studio-200 placeholder-studio-500 focus:outline-none focus:border-brass-500/60 transition-colors"
            />
            <button
              type="submit"
              disabled={!newRule.trim()}
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-brass-500 text-studio-950 hover:bg-brass-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm shrink-0"
            >
              <Plus size={14} />
              <span>Add Rule</span>
            </button>
          </form>

          {/* Rules List */}
          <div className="space-y-2 pt-2">
            {memoryRules.map((rule, index) => {
              const isEditing = editingIndex === index

              return (
                <div
                  key={index}
                  className="group flex items-start gap-3 border border-studio-800 rounded-lg px-4 py-3 bg-studio-900/40 hover:bg-studio-900/80 hover:border-studio-700/80 transition-all"
                >
                  {/* Number Badge */}
                  <span className="text-brass-400 font-mono text-xs font-bold mt-0.5 shrink-0 bg-brass-500/10 px-1.5 py-0.5 rounded border border-brass-500/20">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Rule Content / Edit Field */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 bg-studio-950 border border-brass-500/60 rounded px-2.5 py-1 text-xs text-studio-100 focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(index)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                        <button
                          onClick={() => saveEdit(index)}
                          className="p-1 bg-brass-500 text-studio-950 rounded hover:bg-brass-400"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 text-[11px] bg-studio-800 text-studio-300 rounded hover:bg-studio-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-studio-200 leading-relaxed font-medium">
                        {rule}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => startEdit(index, rule)}
                        title="Edit Rule"
                        className="p-1 text-studio-400 hover:text-studio-200 hover:bg-studio-800 rounded transition-colors"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleRemoveRule(index)}
                        title="Delete Rule"
                        className="p-1 text-studio-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {memoryRules.length === 0 && (
              <div className="p-8 text-center border border-dashed border-studio-800 rounded-lg">
                <p className="text-xs text-studio-500 mb-2">
                  No creative rules currently set in Director's Memory.
                </p>
                <button
                  onClick={handleResetRules}
                  className="px-3 py-1.5 text-xs text-brass-400 bg-brass-500/10 border border-brass-500/30 rounded-md hover:bg-brass-500/20"
                >
                  Restore Default 8 Rules
                </button>
              </div>
            )}
          </div>
        </div>

        {/* WebMCP Context Inspector Card */}
        <div className="border border-studio-800/80 rounded-xl p-4 bg-studio-950/60 flex items-start gap-3">
          <ShieldCheck size={16} className="text-brass-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-studio-200">
              Real-time WebMCP Integration
            </p>
            <p className="text-studio-400 text-[11px] leading-relaxed">
              When the agent calls <code className="text-brass-400 font-mono">get_story_context</code>, all {memoryRules.length} rules above are packaged and provided directly into the agent's working context window so it adheres to your directorial choices across all scene analyses and rewrite proposals.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
