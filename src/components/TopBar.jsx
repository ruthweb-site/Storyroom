import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useProject } from '../store/ProjectStore.jsx'
import { useAuth } from '../store/AuthStore.jsx'
import { useWebMCP } from '../webmcp/WebMCPProvider.jsx'
import { getAIStatus } from '../webmcp/aiIntelligence.js'
import {
  Film,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Layers,
  Clapperboard,
  RotateCcw,
  LogIn,
} from 'lucide-react'

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="w-6 h-6 rounded-sm border border-brass-500/60 flex items-center justify-center shrink-0">
        <span className="w-2 h-2 rounded-full bg-brass-500" />
      </span>
      <span className="font-serif text-lg tracking-wide text-studio-100 font-bold">StoryRoom</span>
    </span>
  )
}

function SaveStatus({ status }) {
  const saving = status === 'saving'
  return (
    <span className="flex items-center gap-1.5 text-xs text-studio-500">
      <span className={`w-1.5 h-1.5 rounded-full ${saving ? 'bg-brass-500 rec-dot' : 'bg-emerald-500'}`} />
      {saving ? 'Saving…' : 'All changes saved'}
    </span>
  )
}

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { project, projects = [], dispatch, saveStatus } = useProject()
  const { user, isAuthenticated, logout } = useAuth()
  const registry = useWebMCP()
  const inStudio = location.pathname.startsWith('/studio')

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)

  function handleReset() {
    if (confirm('Reset all StoryRoom demo data back to default? This clears edits on the demo reel.')) {
      dispatch({ type: 'RESET_DEMO' })
      navigate('/dashboard')
    }
  }

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
    navigate('/login')
  }

  return (
    <header className="h-14 shrink-0 border-b border-studio-700 flex items-center justify-between px-5 bg-studio-900 z-40 relative">
      {/* Left Branding & Project Selector */}
      <div className="flex items-center gap-4 min-w-0">
        <Link to="/dashboard" className="shrink-0 hover:opacity-90 transition-opacity">
          <Logo />
        </Link>

        {inStudio && (
          <>
            <span className="text-studio-700 hidden sm:inline">/</span>
            <div className="relative">
              <button
                onClick={() => setProjectMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-studio-800 transition-colors text-left"
              >
                <span className="text-sm font-serif font-bold text-studio-100 truncate max-w-[200px]">
                  {project?.title || 'Production'}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wide px-1.5 py-0.5 rounded border border-studio-700 text-studio-400 shrink-0 hidden sm:inline">
                  {project?.genre || 'Film'}
                </span>
                <ChevronDown size={13} className="text-studio-400" />
              </button>

              {/* Project Dropdown */}
              {projectMenuOpen && (
                <div
                  className="absolute left-0 top-full mt-2 w-64 rounded-xl bg-studio-900 border border-studio-700 shadow-2xl p-2 z-50 animate-fadeIn"
                  onClick={() => setProjectMenuOpen(false)}
                >
                  <div className="px-2 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-studio-500">
                    Switch Production
                  </div>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        dispatch({ type: 'SELECT_PROJECT', payload: { projectId: p.id } })
                        navigate(`/studio/${p.id}`)
                      }}
                      className={`w-full px-2.5 py-2 rounded-lg text-left text-xs font-serif font-semibold transition-colors flex items-center justify-between ${
                        p.id === project?.id
                          ? 'bg-brass-500/10 text-brass-300 border border-brass-500/30'
                          : 'text-studio-300 hover:bg-studio-800'
                      }`}
                    >
                      <span className="truncate">{p.title}</span>
                      <span className="text-[10px] font-mono opacity-60 uppercase">{p.genre}</span>
                    </button>
                  ))}
                  <div className="border-t border-studio-800 mt-1.5 pt-1.5">
                    <Link
                      to="/dashboard"
                      className="block px-2.5 py-1.5 rounded-lg text-xs font-mono text-studio-400 hover:text-brass-300 hover:bg-studio-800 transition-colors"
                    >
                      View All Productions Slate →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {(() => {
          const ai = getAIStatus()
          return ai.hasKey ? (
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] px-2 py-1 rounded border border-brass-500/40 text-brass-400 font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-brass-400 animate-pulse" />
              Gemini AI
            </span>
          ) : (
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] px-2 py-1 rounded border border-studio-700 text-studio-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-studio-600" />
              Intelligence Engine
            </span>
          )
        })()}

        {inStudio && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('storyroom:run-agent-demo'))}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md bg-brass-500 text-studio-950 hover:bg-brass-400 shadow-sm transition-all"
            title="Start deterministic 9-step WebMCP judge demonstration"
          >
            <Sparkles size={13} />
            <span>Run Agent Demo</span>
          </button>
        )}

        {inStudio && <SaveStatus status={saveStatus} />}

        <span className="hidden lg:flex items-center gap-1.5 text-xs text-studio-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {registry.definitions.length} Tools Online
        </span>

        {/* Director Profile / Auth Menu */}
        <div className="relative">
          {isAuthenticated ? (
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-studio-700 hover:border-brass-500/60 bg-studio-950/60 transition-all text-xs"
            >
              <span className="text-base leading-none">{user?.avatar || '🎬'}</span>
              <span className="font-semibold text-studio-200 hidden sm:inline max-w-[120px] truncate">
                {user?.name || 'Director'}
              </span>
              <ChevronDown size={12} className="text-studio-500" />
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brass-500/50 text-brass-300 hover:bg-brass-500 hover:text-studio-950 text-xs font-semibold transition-all"
            >
              <LogIn size={13} />
              <span>Director Login</span>
            </Link>
          )}

          {/* User Profile Dropdown */}
          {userMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-studio-900 border border-studio-700 shadow-2xl p-3 z-50 animate-fadeIn space-y-2.5"
              onClick={() => setUserMenuOpen(false)}
            >
              <div className="pb-2 border-b border-studio-800">
                <p className="text-xs font-bold text-studio-100 font-serif">{user?.name}</p>
                <p className="text-[11px] text-brass-400 font-mono">{user?.role || 'Director'}</p>
                <p className="text-[10px] text-studio-500 font-mono truncate">{user?.studio || user?.email}</p>
              </div>

              <div className="space-y-1 text-xs">
                <Link
                  to="/"
                  className="block px-2.5 py-1.5 rounded-lg text-studio-300 hover:bg-studio-800 hover:text-studio-100 transition-colors"
                >
                  StoryRoom Home & Overview
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-2.5 py-1.5 rounded-lg text-studio-300 hover:bg-studio-800 hover:text-studio-100 transition-colors"
                >
                  Production Slate
                </Link>
                <Link
                  to="/login"
                  className="block px-2.5 py-1.5 rounded-lg text-studio-300 hover:bg-studio-800 hover:text-studio-100 transition-colors"
                >
                  Switch Director Profile
                </Link>
                <button
                  onClick={handleReset}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-studio-400 hover:bg-studio-800 hover:text-brass-300 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw size={12} />
                  <span>Reset Demo Reel Data</span>
                </button>
              </div>

              <div className="pt-2 border-t border-studio-800">
                <button
                  onClick={handleLogout}
                  className="w-full px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
