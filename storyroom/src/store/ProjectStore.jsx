import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { makeDemoProject } from '../data/demoData.js'

const STORAGE_KEY = 'storyroom.projects.v2'
const ProjectContext = createContext(null)

function loadInitialState() {
  const demo = makeDemoProject()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.projects && Array.isArray(parsed.projects)) {
        const active = parsed.projects.find((p) => p.id === parsed.activeProjectId) || parsed.projects[0] || demo
        return {
          ...active,
          activeProjectId: active.id,
          projects: parsed.projects,
        }
      } else if (parsed.id) {
        // Migration from v1 single project state
        return {
          ...parsed,
          activeProjectId: parsed.id,
          projects: [parsed],
        }
      }
    }
  } catch (e) {
    console.warn('StoryRoom: failed to read localStorage, reseeding demo data.', e)
  }
  return {
    ...demo,
    activeProjectId: demo.id,
    projects: [demo],
  }
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function withUpdatedTimestamp(state, action) {
  if (action.type === 'RESET_DEMO' || action.type === 'ADD_ACTIVITY' || action.type === 'SELECT_PROJECT') return state
  const updatedActive = { ...state, updatedAt: new Date().toISOString() }
  const updatedProjects = (state.projects || []).map((p) => (p.id === state.id ? updatedActive : p))
  return {
    ...updatedActive,
    projects: updatedProjects,
  }
}

function ensureSceneHistory(scene) {
  if (scene.history && scene.history.length > 0) return scene.history
  return [
    {
      version: 1,
      label: 'Version 1 (Original)',
      type: 'original',
      screenplay: scene.screenplay,
      timestamp: new Date().toISOString(),
      reason: 'Initial screenplay draft',
      author: 'Director',
    },
  ]
}

function baseReducer(state, action) {
  switch (action.type) {
    case 'RESET_DEMO': {
      const freshDemo = makeDemoProject()
      const otherProjects = (state.projects || []).filter((p) => p.id !== freshDemo.id)
      const allProjects = [freshDemo, ...otherProjects]
      return {
        ...freshDemo,
        activeProjectId: freshDemo.id,
        projects: allProjects,
      }
    }

    case 'SELECT_PROJECT': {
      const { projectId } = action.payload
      const target = (state.projects || []).find((p) => p.id === projectId)
      if (!target) return state
      return {
        ...target,
        activeProjectId: target.id,
        projects: state.projects,
      }
    }

    case 'CREATE_PROJECT': {
      const { title, genre, logline, tone, directorIntent, initialScenes } = action.payload
      const newId = `proj-${Date.now().toString(36)}`
      const defaultScene = {
        id: `scene-1-${Date.now().toString(36)}`,
        number: 1,
        title: 'OPENING SEQUENCE',
        slug: 'INT. PRODUCTION LOCATION - DAY',
        location: 'Main Studio',
        timeOfDay: 'Day',
        characters: ['LEAD CHARACTER'],
        screenplay: 'INT. PRODUCTION LOCATION - DAY\n\nA quiet room. The director adjusts the lens.\n\nACTION BEGINS.\n\nSilence carries the first moment.',
        emotionalGoal: 'Introduce atmosphere and visual storytelling.',
        tone: tone || 'Restrained, tense',
        history: [
          {
            version: 1,
            label: 'Version 1 (Original)',
            type: 'original',
            screenplay: 'INT. PRODUCTION LOCATION - DAY\n\nA quiet room. The director adjusts the lens.\n\nACTION BEGINS.\n\nSilence carries the first moment.',
            timestamp: new Date().toISOString(),
            reason: 'Initial screenplay draft',
            author: 'Director',
          },
        ],
      }

      const newProject = {
        id: newId,
        title: title || 'UNTITLED PRODUCTION',
        genre: genre || 'Psychological Thriller',
        logline: logline || 'An auteur filmmaker creates a new screenplay alongside the StoryRoom AI agent.',
        tone: tone || 'Tense, psychological, restrained',
        directorIntent: directorIntent || 'Focus on cinematic visual storytelling over excessive exposition.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scenes: initialScenes?.length ? initialScenes : [defaultScene],
        characters: [],
        locations: [
          {
            id: 'loc-1',
            name: 'Main Studio',
            type: 'Interior',
            description: 'Primary location for the production.',
            scenes: ['scene-1'],
          },
        ],
        directorsMemory: [
          'Prefer visual storytelling over exposition.',
          'Keep emotional moments restrained.',
          'Characters rarely say exactly what they feel.',
          'Maintain psychological tension.',
          'Silence can carry emotion.',
          'Dialogue should sound natural.',
        ],
        revisions: [],
        activity: [
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'Created new production',
            tool: 'project_init',
            input: { title: title || 'UNTITLED PRODUCTION' },
            outputSummary: `Production "${title || 'UNTITLED PRODUCTION'}" initialized. Ready for screenplay work.`,
            status: 'success',
          },
        ],
      }

      const allProjects = [...(state.projects || []), newProject]
      return {
        ...newProject,
        activeProjectId: newId,
        projects: allProjects,
      }
    }

    case 'DELETE_PROJECT': {
      const { projectId } = action.payload
      if (projectId === 'the-last-frame') return state // Preserve demo project
      const remaining = (state.projects || []).filter((p) => p.id !== projectId)
      const nextActive = remaining[0] || makeDemoProject()
      return {
        ...nextActive,
        activeProjectId: nextActive.id,
        projects: remaining.length ? remaining : [nextActive],
      }
    }

    case 'ADD_SCENE': {
      const { title, slug, location, timeOfDay, characters, screenplay, emotionalGoal } = action.payload || {}
      const nextNumber = (state.scenes || []).length + 1
      const newSceneId = `scene-${nextNumber}-${Date.now().toString(36)}`
      const defaultSlug = slug || `INT. LOCATION ${nextNumber} - DAY`
      const defaultScreenplay = screenplay || `${defaultSlug}\n\nThe scene opens in stillness.\n\nACTION BEGINS.\n\nCHARACTER\n(quietly)\nNew dialogue here.`

      const newScene = {
        id: newSceneId,
        number: nextNumber,
        title: title || `SCENE ${String(nextNumber).padStart(2, '0')}`,
        slug: defaultSlug,
        location: location || 'Studio Location',
        timeOfDay: timeOfDay || 'Day',
        characters: characters || ['LEAD CHARACTER'],
        screenplay: defaultScreenplay,
        emotionalGoal: emotionalGoal || 'Advance the dramatic arc.',
        tone: state.tone || 'Tense, restrained',
        history: [
          {
            version: 1,
            label: 'Version 1 (Original)',
            type: 'original',
            screenplay: defaultScreenplay,
            timestamp: new Date().toISOString(),
            reason: 'Scene created by Director',
            author: 'Director',
          },
        ],
      }

      return {
        ...state,
        scenes: [...(state.scenes || []), newScene],
      }
    }

    case 'DELETE_SCENE': {
      const { sceneId } = action.payload
      if ((state.scenes || []).length <= 1) return state // Keep at least 1 scene
      const updated = state.scenes
        .filter((s) => s.id !== sceneId)
        .map((s, idx) => ({ ...s, number: idx + 1 }))
      return {
        ...state,
        scenes: updated,
      }
    }

    case 'UPDATE_SCENE_TEXT': {
      const { sceneId, screenplay } = action.payload
      return {
        ...state,
        scenes: state.scenes.map((s) => {
          if (s.id !== sceneId) return s
          const hist = ensureSceneHistory(s)
          return {
            ...s,
            screenplay,
            history: hist,
          }
        }),
      }
    }

    case 'RESTORE_SCENE_VERSION': {
      const { sceneId, versionNumber } = action.payload
      return {
        ...state,
        scenes: state.scenes.map((s) => {
          if (s.id !== sceneId) return s
          const hist = ensureSceneHistory(s)
          const target = hist.find((h) => h.version === versionNumber)
          if (!target) return s
          const nextVer = hist.length + 1
          const restoredEntry = {
            version: nextVer,
            label: `Version ${nextVer} (Restored from v${versionNumber})`,
            type: 'restored',
            screenplay: target.screenplay,
            timestamp: new Date().toISOString(),
            reason: `Restored Version ${versionNumber} (${target.label})`,
            author: 'Director',
          }
          return {
            ...s,
            screenplay: target.screenplay,
            history: [...hist, restoredEntry],
          }
        }),
      }
    }

    case 'ADD_ACTIVITY': {
      const entry = { id: uid('act'), timestamp: new Date().toISOString(), ...action.payload }
      return { ...state, activity: [entry, ...state.activity].slice(0, 200) }
    }

    case 'ADD_REVISION': {
      const revId = uid('rev')
      const revision = {
        id: revId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        ...action.payload,
      }

      const updatedScenes = state.scenes.map((s) => {
        if (s.id !== action.payload.sceneId) return s
        const hist = ensureSceneHistory(s)
        const nextVer = hist.length + 1
        const aiProposalEntry = {
          version: nextVer,
          label: `Version ${nextVer} (AI Proposal)`,
          type: 'ai_proposal',
          screenplay: action.payload.proposedText,
          timestamp: new Date().toISOString(),
          reason: action.payload.reason || action.payload.instruction || 'AI revision proposed',
          author: 'AI Agent',
          revisionId: revId,
        }
        return { ...s, history: [...hist, aiProposalEntry] }
      })

      return {
        ...state,
        scenes: updatedScenes,
        revisions: [revision, ...state.revisions],
      }
    }

    case 'APPROVE_REVISION': {
      const { revisionId } = action.payload
      return {
        ...state,
        revisions: state.revisions.map((r) =>
          r.id === revisionId
            ? { ...r, status: 'approved', approvedAt: new Date().toISOString() }
            : r
        ),
      }
    }

    case 'REJECT_REVISION': {
      const { revisionId } = action.payload
      let updatedScenes = state.scenes
      const rev = state.revisions.find((r) => r.id === revisionId)
      if (rev) {
        updatedScenes = state.scenes.map((s) => {
          if (s.id !== rev.sceneId) return s
          const hist = ensureSceneHistory(s)
          const nextVer = hist.length + 1
          const rejectedEntry = {
            version: nextVer,
            label: `Version ${nextVer} (Rejected AI Proposal)`,
            type: 'director_rejected',
            screenplay: s.screenplay,
            timestamp: new Date().toISOString(),
            reason: `Rejected AI proposal: ${rev.reason}`,
            author: 'Director',
            revisionId: rev.id,
          }
          return { ...s, history: [...hist, rejectedEntry] }
        })
      }
      return {
        ...state,
        scenes: updatedScenes,
        revisions: state.revisions.map((r) =>
          r.id === revisionId
            ? { ...r, status: 'rejected', rejectedAt: new Date().toISOString() }
            : r
        ),
      }
    }

    case 'APPLY_REVISION': {
      const { revisionId } = action.payload
      const rev = state.revisions.find((r) => r.id === revisionId)
      if (!rev || rev.status !== 'approved') {
        return state // Strict security check: do not mutate if not approved!
      }

      const updatedScenes = state.scenes.map((s) => {
        if (s.id !== rev.sceneId) return s
        const hist = ensureSceneHistory(s)
        const nextVer = hist.length + 1
        const acceptedEntry = {
          version: nextVer,
          label: `Version ${nextVer} (Accepted by Director)`,
          type: 'director_accepted',
          screenplay: rev.proposedText,
          timestamp: new Date().toISOString(),
          reason: rev.reason || 'Accepted revision',
          author: 'Director',
          revisionId: rev.id,
        }
        return {
          ...s,
          screenplay: rev.proposedText,
          history: [...hist, acceptedEntry],
        }
      })

      return {
        ...state,
        scenes: updatedScenes,
        revisions: state.revisions.map((r) =>
          r.id === revisionId
            ? { ...r, status: 'applied', appliedAt: new Date().toISOString() }
            : r
        ),
      }
    }

    case 'RESOLVE_REVISION': {
      const { revisionId, status } = action.payload // 'accepted' | 'rejected' | 'approved'
      if (status === 'approved') {
        return baseReducer(state, { type: 'APPROVE_REVISION', payload: { revisionId } })
      }
      if (status === 'rejected') {
        return baseReducer(state, { type: 'REJECT_REVISION', payload: { revisionId } })
      }
      if (status === 'accepted' || status === 'applied') {
        // First ensure approved, then apply
        const approvedState = baseReducer(state, { type: 'APPROVE_REVISION', payload: { revisionId } })
        return baseReducer(approvedState, { type: 'APPLY_REVISION', payload: { revisionId } })
      }
      return state
    }

    case 'ADD_CHARACTER': {
      const newChar = {
        id: uid('char'),
        name: 'New Character',
        age: 30,
        role: 'Supporting',
        description: '',
        personality: '',
        relationships: '',
        emotionalArc: '',
        ...action.payload,
      }
      return { ...state, characters: [...state.characters, newChar] }
    }

    case 'UPDATE_CHARACTER': {
      const { characterId, patch } = action.payload
      return {
        ...state,
        characters: state.characters.map((c) =>
          c.id === characterId ? { ...c, ...patch } : c
        ),
      }
    }

    case 'DELETE_CHARACTER': {
      const { characterId } = action.payload
      return {
        ...state,
        characters: state.characters.filter((c) => c.id !== characterId),
      }
    }

    case 'ADD_LOCATION': {
      const newLoc = {
        id: uid('loc'),
        name: 'New Location',
        description: '',
        ...action.payload,
      }
      return { ...state, locations: [...state.locations, newLoc] }
    }

    case 'UPDATE_LOCATION': {
      const { locationId, patch } = action.payload
      return {
        ...state,
        locations: state.locations.map((loc) =>
          loc.id === locationId ? { ...loc, ...patch } : loc
        ),
      }
    }

    case 'DELETE_LOCATION': {
      const { locationId } = action.payload
      return {
        ...state,
        locations: state.locations.filter((loc) => loc.id !== locationId),
      }
    }

    case 'ADD_MEMORY_RULE': {
      const { rule } = action.payload
      if (!rule || !rule.trim()) return state
      return {
        ...state,
        directorsMemory: [...state.directorsMemory, rule.trim()],
      }
    }

    case 'REMOVE_MEMORY_RULE': {
      const { index } = action.payload
      return {
        ...state,
        directorsMemory: state.directorsMemory.filter((_, i) => i !== index),
      }
    }

    case 'UPDATE_MEMORY_RULE': {
      const { index, rule } = action.payload
      return {
        ...state,
        directorsMemory: state.directorsMemory.map((r, i) => (i === index ? rule : r)),
      }
    }

    case 'UPDATE_DIRECTOR_INTENT': {
      const { directorIntent } = action.payload
      return { ...state, directorIntent }
    }

    default:
      return state
  }
}

function reducer(state, action) {
  const next = baseReducer(state, action)
  if (next === state) return state
  return withUpdatedTimestamp(next, action)
}

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState)
  const [saveStatus, setSaveStatus] = React.useState('saved') // 'saved' | 'saving'
  const isFirstRender = React.useRef(true)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.warn('StoryRoom: failed to persist to localStorage.', e)
    }
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setSaveStatus('saving')
    const t = setTimeout(() => setSaveStatus('saved'), 450)
    return () => clearTimeout(t)
  }, [state])

  const value = useMemo(
    () => ({
      project: state,
      projects: state.projects || [state],
      dispatch,
      saveStatus,
    }),
    [state, saveStatus]
  )

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within a ProjectProvider')
  return ctx
}
