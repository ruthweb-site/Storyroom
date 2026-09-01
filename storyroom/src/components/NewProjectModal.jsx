import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProject } from '../store/ProjectStore.jsx'
import {
  Film,
  Sparkles,
  Clapperboard,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Feather,
} from 'lucide-react'

const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: '1 opening scene, clean slate ready for your screenplay.',
    scenesCount: 1,
  },
  {
    id: 'short',
    name: 'Short Film (3 Scenes)',
    description: 'Beginning (Setup), Middle (Turning Point), and Climax.',
    scenesCount: 3,
  },
  {
    id: 'feature',
    name: 'Feature Treatment (8 Scenes)',
    description: 'Structured 8-scene sequence across full narrative arc.',
    scenesCount: 8,
  },
]

export default function NewProjectModal({ isOpen, onClose }) {
  const { dispatch } = useProject()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('Psychological Thriller')
  const [logline, setLogline] = useState('')
  const [tone, setTone] = useState('Tense, psychological, restrained')
  const [directorIntent, setDirectorIntent] = useState('Focus on cinematic visual storytelling over exposition.')
  const [selectedTemplate, setSelectedTemplate] = useState('blank')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please provide a film title.')
      return
    }

    setSubmitting(true)
    setError(null)

    // Generate template scenes
    const scenes = []
    const count = selectedTemplate === 'feature' ? 8 : selectedTemplate === 'short' ? 3 : 1

    for (let i = 1; i <= count; i++) {
      const sceneTitle =
        i === 1
          ? 'OPENING IMAGE'
          : i === 2
          ? 'THE INCITING EVENT'
          : i === 3
          ? 'THE CONFRONTATION'
          : `SEQUENCE ${String(i).padStart(2, '0')}`

      scenes.push({
        id: `scene-${i}-${Date.now().toString(36)}`,
        number: i,
        title: sceneTitle,
        slug: `INT. LOCATION ${i} - DAY`,
        location: `Location ${i}`,
        timeOfDay: i % 2 === 0 ? 'Night' : 'Day',
        characters: ['LEAD CHARACTER'],
        screenplay: `INT. LOCATION ${i} - ${i % 2 === 0 ? 'NIGHT' : 'DAY'}\n\nThe room is quiet. Shadows stretch across the floor.\n\nACTION BEGINS.\n\nA breath held. Tension builds in silence.`,
        emotionalGoal: `Establish narrative progression for Scene ${i}.`,
        tone: tone,
        history: [
          {
            version: 1,
            label: 'Version 1 (Original)',
            type: 'original',
            screenplay: `INT. LOCATION ${i} - ${i % 2 === 0 ? 'NIGHT' : 'DAY'}\n\nThe room is quiet. Shadows stretch across the floor.\n\nACTION BEGINS.\n\nA breath held. Tension builds in silence.`,
            timestamp: new Date().toISOString(),
            reason: 'Initial screenplay draft',
            author: 'Director',
          },
        ],
      })
    }

    dispatch({
      type: 'CREATE_PROJECT',
      payload: {
        title: title.trim().toUpperCase(),
        genre,
        logline: logline.trim() || 'A new original screenplay production.',
        tone,
        directorIntent,
        initialScenes: scenes,
      },
    })

    setTimeout(() => {
      setSubmitting(false)
      onClose()
      navigate('/studio/new')
    }, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-studio-900 border border-studio-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-studio-950 border-b border-studio-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brass-500/10 border border-brass-500/30 flex items-center justify-center text-brass-400">
              <Clapperboard size={18} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-studio-100 font-bold">
                Initialize New Production
              </h3>
              <p className="text-xs text-studio-400 font-mono">
                Create a blank screenplay canvas for AI agent collaboration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-studio-400 hover:text-studio-100 hover:bg-studio-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 font-mono">
              {error}
            </div>
          )}

          {/* Title & Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-semibold text-studio-300 uppercase tracking-wider font-mono">
                Film Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. THE WHISPER IN THE STATIC"
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-studio-950 border border-studio-700 text-studio-100 text-sm font-serif font-bold uppercase tracking-wide focus:outline-none focus:border-brass-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-studio-300 uppercase tracking-wider font-mono">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-studio-950 border border-studio-700 text-studio-100 text-xs focus:outline-none focus:border-brass-500"
              >
                <option value="Psychological Thriller">Psychological Thriller</option>
                <option value="Neo-Noir Mystery">Neo-Noir Mystery</option>
                <option value="Sci-Fi Speculative">Sci-Fi Speculative</option>
                <option value="Indie Drama">Indie Drama</option>
                <option value="Dark Comedy">Dark Comedy</option>
                <option value="Crime Procedural">Crime Procedural</option>
              </select>
            </div>
          </div>

          {/* Logline */}
          <div className="space-y-1.5">
            <label className="font-semibold text-studio-300 uppercase tracking-wider font-mono">
              Logline / Dramatic Premise
            </label>
            <textarea
              rows={2}
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              placeholder="A sound designer discovers a hidden frequency on an archival reel that predicts tomorrow's events..."
              className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-studio-100 text-xs focus:outline-none focus:border-brass-500 leading-relaxed"
            />
          </div>

          {/* Tone & Director Intent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-studio-300 uppercase tracking-wider font-mono">
                Atmospheric Tone
              </label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. Paranoic, tactile, restrained"
                className="w-full px-3 py-2 rounded-lg bg-studio-950 border border-studio-700 text-studio-100 text-xs focus:outline-none focus:border-brass-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-studio-300 uppercase tracking-wider font-mono">
                Director's Stylistic Intent
              </label>
              <input
                type="text"
                value={directorIntent}
                onChange={(e) => setDirectorIntent(e.target.value)}
                placeholder="e.g. Visual subtext, zero melodrama"
                className="w-full px-3 py-2 rounded-lg bg-studio-950 border border-studio-700 text-studio-100 text-xs focus:outline-none focus:border-brass-500"
              />
            </div>
          </div>

          {/* Screenplay Template Selection */}
          <div className="space-y-2 pt-1">
            <label className="font-semibold text-studio-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Layers size={13} className="text-brass-400" />
              <span>Starting Screenplay Structure</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {TEMPLATES.map((tmpl) => {
                const isSel = selectedTemplate === tmpl.id
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSel
                        ? 'bg-brass-950/40 border-brass-500 text-studio-100 shadow-md'
                        : 'bg-studio-950/60 border-studio-800 hover:border-studio-700 text-studio-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold text-xs ${isSel ? 'text-brass-300' : 'text-studio-200'}`}>
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] font-mono opacity-80">
                        {tmpl.scenesCount} Scene{tmpl.scenesCount > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-[11px] leading-tight opacity-75">{tmpl.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="pt-4 border-t border-studio-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-studio-400 hover:text-studio-200 hover:bg-studio-800 transition-colors text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-brass-500 hover:bg-brass-400 text-studio-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-brass-900/30 flex items-center gap-2 disabled:opacity-40"
            >
              <span>{submitting ? 'Creating Production…' : 'Open Film Studio'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
