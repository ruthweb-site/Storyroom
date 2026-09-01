import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/AuthStore.jsx'
import {
  Clapperboard,
  Sparkles,
  ShieldCheck,
  Film,
  KeyRound,
  UserCheck,
  ArrowRight,
  Tv,
  Award,
  Video,
  CheckCircle2,
} from 'lucide-react'

export default function LoginPage() {
  const { login, loginAsDirector, loginAsGuest, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [activeTab, setActiveTab] = useState('quick') // 'quick' | 'signin' | 'register'
  const [email, setEmail] = useState('director@storyroom.film')
  const [passcode, setPasscode] = useState('1234')
  const [name, setName] = useState('')
  const [studio, setStudio] = useState('')
  const [creativeFocus, setCreativeFocus] = useState('Psychological Thriller')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleSuccess() {
    navigate(from, { replace: true })
  }

  function handleQuickGuest() {
    setLoading(true)
    setTimeout(() => {
      loginAsGuest()
      handleSuccess()
    }, 350)
  }

  function handleQuickDirector() {
    setLoading(true)
    setTimeout(() => {
      loginAsDirector()
      handleSuccess()
    }, 350)
  }

  function handleSignIn(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setTimeout(() => {
      if (!email.trim()) {
        setError('Please enter a director email or studio ID.')
        setLoading(false)
        return
      }
      login(email, passcode, 'Director', studio || 'Independent Studio')
      handleSuccess()
    }, 400)
  }

  function handleRegister(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setTimeout(() => {
      if (!name.trim()) {
        setError('Please enter your Director name.')
        setLoading(false)
        return
      }
      login(email || `${name.toLowerCase().replace(/\s+/g, '')}@storyroom.film`, passcode, name, studio || 'Auteur Pictures')
      handleSuccess()
    }, 450)
  }

  return (
    <div className="min-h-screen bg-studio-950 text-studio-100 flex flex-col justify-between selection:bg-brass-500 selection:text-studio-950 relative overflow-hidden">
      {/* Cinematic Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(197,160,89,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(30,35,45,0.8),transparent_50%)] pointer-events-none" />
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-brass-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-studio-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brass-400 to-brass-600 flex items-center justify-center text-studio-950 font-bold shadow-lg shadow-brass-900/30">
            <Film size={20} />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-wide text-studio-100 block leading-tight">
              StoryRoom
            </span>
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-brass-400">
              Agent-Native Filmmaking Studio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-studio-400 font-mono hidden sm:inline">
            WebMCP Challenge Edition
          </span>
          <span className="px-2.5 py-1 rounded-full bg-brass-500/10 border border-brass-500/30 text-brass-400 text-xs font-mono font-medium">
            v2.4
          </span>
        </div>
      </header>

      {/* Main Login Stage */}
      <main className="max-w-xl w-full mx-auto px-6 py-8 relative z-10">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-studio-900/90 border border-studio-700 text-studio-300 text-xs font-mono mb-2 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Director Workspace & WebMCP Suite</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-studio-100 font-bold tracking-tight">
            Enter the Director's Room
          </h1>
          <p className="text-studio-400 text-sm max-w-md mx-auto leading-relaxed">
            Where human auteurs craft cinematic narratives alongside external AI agents through real WebMCP tools.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-studio-900/90 backdrop-blur-xl border border-studio-700/80 rounded-2xl p-7 shadow-2xl shadow-black/80 space-y-6">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-studio-950/80 rounded-xl border border-studio-800 text-xs font-medium">
            <button
              onClick={() => { setActiveTab('quick'); setError(null) }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'quick'
                  ? 'bg-studio-800 text-brass-300 font-bold shadow-sm border border-studio-700'
                  : 'text-studio-400 hover:text-studio-200'
              }`}
            >
              <Sparkles size={13} />
              <span>1-Click Entry</span>
            </button>

            <button
              onClick={() => { setActiveTab('signin'); setError(null) }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'signin'
                  ? 'bg-studio-800 text-brass-300 font-bold shadow-sm border border-studio-700'
                  : 'text-studio-400 hover:text-studio-200'
              }`}
            >
              <KeyRound size={13} />
              <span>Director Login</span>
            </button>

            <button
              onClick={() => { setActiveTab('register'); setError(null) }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-studio-800 text-brass-300 font-bold shadow-sm border border-studio-700'
                  : 'text-studio-400 hover:text-studio-200'
              }`}
            >
              <UserCheck size={13} />
              <span>New Director</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <span className="font-bold">✕</span>
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: 1-Click Fast Entry (For Judges & Instant Demo) */}
          {activeTab === 'quick' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-gradient-to-r from-brass-950/40 via-studio-900 to-studio-950 border border-brass-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brass-400 flex items-center gap-1.5">
                    <Award size={14} />
                    <span>Evaluation & Demo Mode</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Instant Access
                  </span>
                </div>
                <p className="text-xs text-studio-300 leading-relaxed">
                  Enter directly with full access to <strong>THE LAST FRAME</strong> demo project, the 8-step screenplay intelligence agent, and live WebMCP tool endpoints.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleQuickDirector}
                  disabled={loading}
                  className="p-4 rounded-xl bg-brass-500 hover:bg-brass-400 text-studio-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-brass-900/30 flex flex-col items-center justify-center gap-2 text-center group disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-full bg-studio-950/20 flex items-center justify-center text-studio-950 group-hover:scale-110 transition-transform">
                    <Clapperboard size={18} />
                  </div>
                  <span>Enter as Lead Director</span>
                  <span className="text-[10px] lowercase font-normal opacity-80 font-mono">
                    (Director Rudranan)
                  </span>
                </button>

                <button
                  onClick={handleQuickGuest}
                  disabled={loading}
                  className="p-4 rounded-xl bg-studio-800 hover:bg-studio-700 border border-studio-600 text-studio-100 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex flex-col items-center justify-center gap-2 text-center group disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-full bg-studio-700/60 flex items-center justify-center text-brass-300 group-hover:scale-110 transition-transform">
                    <Tv size={18} />
                  </div>
                  <span>Enter as Judge / Guest</span>
                  <span className="text-[10px] lowercase font-normal text-studio-400 font-mono">
                    (Hackathon Evaluator)
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Director Sign In */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-studio-300 uppercase tracking-wider font-mono">
                  Director Email or Studio ID
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@studio.film"
                  className="w-full px-4 py-2.5 rounded-lg bg-studio-950 border border-studio-700 text-studio-100 text-sm focus:outline-none focus:border-brass-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-studio-300 uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>Passcode / Key</span>
                  <span className="text-[10px] text-studio-500 font-normal">Demo: 1234</span>
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 rounded-lg bg-studio-950 border border-studio-700 text-studio-100 text-sm focus:outline-none focus:border-brass-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-brass-500 hover:bg-brass-400 text-studio-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-brass-900/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Authenticating…' : 'Sign In to Production Studio'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* TAB 3: New Director Profile */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-studio-300 uppercase tracking-wider font-mono">
                  Director Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Christopher Nolan, Sofia Coppola"
                  className="w-full px-4 py-2 rounded-lg bg-studio-950 border border-studio-700 text-studio-100 text-sm focus:outline-none focus:border-brass-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-studio-300 uppercase tracking-wider font-mono">
                    Production House / Studio
                  </label>
                  <input
                    type="text"
                    value={studio}
                    onChange={(e) => setStudio(e.target.value)}
                    placeholder="e.g. Syncopy, A24"
                    className="w-full px-4 py-2 rounded-lg bg-studio-950 border border-studio-700 text-studio-100 text-sm focus:outline-none focus:border-brass-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-studio-300 uppercase tracking-wider font-mono">
                    Creative Focus
                  </label>
                  <select
                    value={creativeFocus}
                    onChange={(e) => setCreativeFocus(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-studio-950 border border-studio-700 text-studio-100 text-sm focus:outline-none focus:border-brass-500"
                  >
                    <option value="Psychological Thriller">Psychological Thriller</option>
                    <option value="Neo-Noir Mystery">Neo-Noir Mystery</option>
                    <option value="Sci-Fi Speculative">Sci-Fi Speculative</option>
                    <option value="Indie Drama">Indie Drama</option>
                    <option value="Action Cinema">Action Cinema</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-brass-500 hover:bg-brass-400 text-studio-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-brass-900/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Creating Director Profile…' : 'Create Profile & Enter Studio'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* Footer Security / Principle Note */}
          <div className="pt-4 border-t border-studio-800 flex items-center justify-between text-[11px] text-studio-500 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-brass-400" />
              <span>Human-In-The-Loop Enforced</span>
            </span>
            <span>WebMCP Connected</span>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="px-8 py-4 text-center text-xs text-studio-600 border-t border-studio-900 relative z-10">
        <p>StoryRoom Filmmaking Suite • The Agent Proposes. The Human Decides.</p>
      </footer>
    </div>
  )
}
