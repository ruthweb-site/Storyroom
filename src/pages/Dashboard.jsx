import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProject } from '../store/ProjectStore.jsx'
import { useAuth } from '../store/AuthStore.jsx'
import { timeAgo } from '../lib/time.js'
import NewProjectModal from '../components/NewProjectModal.jsx'
import {
  Film,
  Plus,
  Clapperboard,
  Sparkles,
  Layers,
  Trash2,
  Tv,
  ArrowRight,
  User,
  ShieldCheck,
} from 'lucide-react'

export default function Dashboard() {
  const { project, projects = [], dispatch } = useProject()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [newProjectOpen, setNewProjectOpen] = useState(false)

  const allProjects = projects.length ? projects : [project]

  function handleSelectProject(projId) {
    dispatch({ type: 'SELECT_PROJECT', payload: { projectId: projId } })
    navigate(`/studio/${projId}`)
  }

  function handleDeleteProject(e, projId, title) {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete the production "${title}"?`)) {
      dispatch({ type: 'DELETE_PROJECT', payload: { projectId: projId } })
    }
  }

  return (
    <div className="film-texture h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Director Profile & Page Title */}
        <div className="mb-10 flex items-end justify-between gap-6 flex-wrap pb-6 border-b border-studio-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-brass-500 text-xs tracking-[0.2em] uppercase font-mono font-semibold">
                {user?.name || 'Director'} • {user?.studio || 'Independent Slate'}
              </p>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-studio-100 font-bold tracking-tight">
              Production Slate
            </h1>
            <p className="text-studio-400 mt-2 max-w-xl text-sm leading-relaxed">
              Open an active production to write, review scenes, and collaborate with your AI agent via real WebMCP tools.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setNewProjectOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-brass-500/60 bg-brass-500/10 text-brass-300 font-bold text-xs uppercase tracking-wider hover:bg-brass-500 hover:text-studio-950 shadow-md transition-all"
            >
              <Plus size={15} />
              <span>New Production</span>
            </button>

            <button
              onClick={() => {
                dispatch({ type: 'SELECT_PROJECT', payload: { projectId: 'the-last-frame' } })
                navigate('/studio/the-last-frame')
                setTimeout(() => window.dispatchEvent(new CustomEvent('storyroom:run-agent-demo')), 200)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brass-500 text-studio-950 font-bold text-xs uppercase tracking-wider hover:bg-brass-400 shadow-lg shadow-brass-900/30 transition-all"
            >
              <Sparkles size={15} />
              <span>⚡ Run Agent Demo</span>
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-studio-400">
              Active Films ({allProjects.length})
            </h2>
            <span className="text-xs text-studio-500 font-mono">
              Click any production to launch studio
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allProjects.map((p) => {
              const isDemo = p.id === 'the-last-frame'
              const pendingRevCount = (p.revisions || []).filter((r) => r.status === 'pending').length

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProject(p.id)}
                  className="group relative border border-studio-700/80 hover:border-brass-500/70 rounded-xl overflow-hidden bg-studio-900/90 hover:bg-studio-900 transition-all shadow-xl cursor-pointer flex flex-col justify-between"
                >
                  {/* Top Bar inside Card */}
                  <div className="p-6 border-b border-studio-800 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] tracking-[0.16em] uppercase font-mono px-2 py-0.5 rounded bg-studio-950 text-brass-400 border border-studio-800 font-semibold">
                          {p.genre || 'Film Project'}
                        </span>
                        {isDemo && (
                          <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-studio-800 text-studio-300">
                            Hackathon Demo Reel
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {pendingRevCount > 0 && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-brass-950/80 border border-brass-500/50 text-brass-300 font-medium animate-pulse">
                            {pendingRevCount} pending
                          </span>
                        )}
                        {!isDemo && (
                          <button
                            onClick={(e) => handleDeleteProject(e, p.id, p.title)}
                            className="p-1 rounded text-studio-600 hover:text-rose-400 hover:bg-studio-800 transition-colors"
                            title="Delete Production"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="font-serif text-2xl text-studio-100 group-hover:text-brass-400 transition-colors font-bold tracking-wide">
                      {p.title}
                    </h3>
                    <p className="text-studio-400 text-xs line-clamp-2 leading-relaxed">
                      {p.logline || 'Original screenplay in development.'}
                    </p>
                  </div>

                  {/* Card Meta Stats & CTA */}
                  <div className="p-6 bg-studio-950/40 flex items-center justify-between text-xs text-studio-400">
                    <div className="flex items-center gap-4 font-mono">
                      <span>{p.scenes?.length || 0} Scenes</span>
                      <span>•</span>
                      <span>{p.characters?.length || 0} Characters</span>
                      <span>•</span>
                      <span className="text-studio-500">{timeAgo(p.updatedAt)}</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-brass-400 font-semibold group-hover:translate-x-1 transition-transform">
                      <span>Open Studio</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Project Characters Spotlight */}
        {project?.characters?.length > 0 && (
          <div className="mt-14 pt-8 border-t border-studio-800/80 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-studio-400">
              Active Production Roster • {project.title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {project.characters.slice(0, 3).map((c) => (
                <div key={c.id} className="border border-studio-800 rounded-xl p-4 bg-studio-900/40 space-y-1">
                  <p className="text-studio-200 font-semibold text-sm">{c.name}</p>
                  <p className="text-brass-400 text-[10px] uppercase font-mono tracking-wider">{c.role}</p>
                  <p className="text-studio-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <NewProjectModal isOpen={newProjectOpen} onClose={() => setNewProjectOpen(false)} />
    </div>
  )
}
