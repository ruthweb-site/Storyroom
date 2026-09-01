import React, { createContext, useContext, useState, useEffect } from 'react'

const AUTH_STORAGE_KEY = 'storyroom.auth.v2'

const DEFAULT_DIRECTOR = {
  id: 'dir-rudranan',
  name: 'Director Rudranan',
  email: 'director@storyroom.film',
  role: 'Lead Director & Screenwriter',
  studio: 'Antigravity Pictures',
  bio: 'Auteur filmmaker specializing in psychological thrillers, neo-noir atmospheres, and character subtext.',
  avatar: '🎬',
  passcode: '1234',
}

const GUEST_DIRECTOR = {
  id: 'dir-guest',
  name: 'Guest Director / Judge',
  email: 'judge@webmcp-challenge.dev',
  role: 'WebMCP Evaluator',
  studio: 'WebMCP Hackathon Jury',
  bio: 'Evaluating autonomous agent screenplay operations and Human-in-the-Loop decision systems.',
  avatar: '🏆',
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.warn('Auth load failed', e)
    }
    // Return default director so existing demo access remains smooth
    return DEFAULT_DIRECTOR
  })

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    } catch (e) {
      console.warn('Auth save failed', e)
    }
  }, [user])

  function login(email, passcode, name = 'Director', studio = 'Independent Studio') {
    const newUser = {
      id: `dir-${Date.now().toString(36)}`,
      name: name || 'Director',
      email: email || 'director@storyroom.film',
      role: 'Director & Screenwriter',
      studio: studio || 'Studio Workspace',
      bio: 'Film director creating original narrative cinema with AI agent pair-programming.',
      avatar: '🎬',
    }
    setUser(newUser)
    return newUser
  }

  function loginAsDirector() {
    setUser(DEFAULT_DIRECTOR)
    return DEFAULT_DIRECTOR
  }

  function loginAsGuest() {
    setUser(GUEST_DIRECTOR)
    return GUEST_DIRECTOR
  }

  function logout() {
    setUser(null)
  }

  function updateProfile(updates) {
    setUser((prev) => (prev ? { ...prev, ...updates } : null))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        loginAsDirector,
        loginAsGuest,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
