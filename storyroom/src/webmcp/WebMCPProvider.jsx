import React, { createContext, useContext, useMemo, useRef } from 'react'
import { useProject } from '../store/ProjectStore.jsx'
import { createWebMCPRegistry } from './registry.js'

const WebMCPContext = createContext(null)

export function WebMCPProvider({ children }) {
  const { project, dispatch } = useProject()
  const projectRef = useRef(project)
  projectRef.current = project

  const registry = useMemo(
    () =>
      createWebMCPRegistry({
        getProject: () => projectRef.current,
        dispatch,
      }),
    [dispatch]
  )

  return <WebMCPContext.Provider value={registry}>{children}</WebMCPContext.Provider>
}

export function useWebMCP() {
  const ctx = useContext(WebMCPContext)
  if (!ctx) throw new Error('useWebMCP must be used within a WebMCPProvider')
  return ctx
}
