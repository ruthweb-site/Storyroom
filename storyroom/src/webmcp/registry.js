// StoryRoom WebMCP Tool Registry & Browser Integration
//
// Exposes the 8 required WebMCP tools through document.modelContext.registerTool(...)
// and navigator.modelContext.registerTool(...).
// Operates on real application state, logs every call to the activity feed,
// and enforces strict JSON schemas with structured outputs and error handling.

import {
  getStoryContext,
  getCurrentScene,
  searchScenes,
  getCharacter,
  checkContinuity,
  analyzeScene,
  proposeRewrite,
  applyRevision,
  approveRevisionFromUI,
  rejectRevisionFromUI,
} from './coreTools.js'

export function createWebMCPRegistry({ getProject, dispatch }) {
  const toolLog = []

  function logActivity(toolName, input, outputSummary, status = 'success', action = null, result = null) {
    const actionText = action || outputSummary || toolName
    const resultText =
      result ||
      (status === 'flagged' || status === 'warning'
        ? 'WARNING'
        : status === 'waiting_for_director' || status === 'pending'
        ? 'WAITING FOR DIRECTOR'
        : status === 'error'
        ? 'ERROR'
        : 'SUCCESS')

    if (dispatch) {
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: { tool: toolName, input, outputSummary, status, action: actionText, result: resultText },
      })
    }
    toolLog.push({ toolName, input, outputSummary, status, action: actionText, result: resultText, at: Date.now() })
  }

  // Define the 8 required WebMCP tools with names, titles, descriptions, and strict inputSchemas
  const definitions = [
    {
      name: 'get_story_context',
      title: 'Get Story Context',
      description:
        "Retrieve the project's essential context: title, genre, logline, director's intent, characters, locations, scene index, and relevant story facts.",
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
      execute: async () => {
        const project = getProject()
        return await getStoryContext({ project, logActivity })
      },
    },
    {
      name: 'get_current_scene',
      title: 'Get Current Scene',
      description:
        'Retrieve the complete record for a scene by number or ID, including screenplay text, characters, location, time of day, and emotional goal.',
      inputSchema: {
        type: 'object',
        properties: {
          sceneId: {
            type: 'string',
            description: 'Scene number (e.g. "4", "scene-4", or "The Report")',
          },
        },
        required: ['sceneId'],
      },
      execute: async (input = {}) => {
        const project = getProject()
        if (!input.sceneId) {
          throw new Error('WebMCP Error: "sceneId" is required for get_current_scene.')
        }
        return await getCurrentScene({ project, sceneId: input.sceneId, logActivity })
      },
    },
    {
      name: 'search_scenes',
      title: 'Search Scenes',
      description:
        'Search across scene screenplay text, titles, summaries, and character appearances. Supports filtering by character, location, and time of day.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Free-text search query (matches dialogue, action, scene summaries)',
          },
          character: {
            type: 'string',
            description: 'Optional character filter (e.g. "Riya", "Arjun", "Kabir")',
          },
          location: {
            type: 'string',
            description: 'Optional location filter (e.g. "Cafe", "Editing Studio", "Railway Station")',
          },
          timeOfDay: {
            type: 'string',
            description: 'Optional time of day filter (e.g. "DAY", "NIGHT", "DAWN")',
          },
        },
        required: [],
      },
      execute: async (input = {}) => {
        const project = getProject()
        return await searchScenes({
          project,
          query: input.query || '',
          character: input.character,
          location: input.location,
          timeOfDay: input.timeOfDay,
          logActivity,
        })
      },
    },
    {
      name: 'get_character',
      title: 'Get Character Profile',
      description:
        'Retrieve detailed character profile, personality, relationships, emotional arc, and the list of scenes they appear in.',
      inputSchema: {
        type: 'object',
        properties: {
          characterName: {
            type: 'string',
            description: 'Character name or ID (e.g. "Riya", "Arjun", "Kabir", "char-riya")',
          },
        },
        required: ['characterName'],
      },
      execute: async (input = {}) => {
        const project = getProject()
        const name = input.characterName || input.name || input.characterId
        if (!name) {
          throw new Error('WebMCP Error: "characterName" is required for get_character.')
        }
        return await getCharacter({ project, characterName: name, logActivity })
      },
    },
    {
      name: 'check_continuity',
      title: 'Check Continuity',
      description:
        'Audit the screenplay for contradictions: character age mentions vs profiles, inconsistent location naming, timeline discrepancies, and prop label variations.',
      inputSchema: {
        type: 'object',
        properties: {
          sceneId: {
            type: 'string',
            description: 'Optional scene identifier to scope continuity checks to a single scene',
          },
        },
        required: [],
      },
      execute: async (input = {}) => {
        const project = getProject()
        return await checkContinuity({ project, sceneId: input.sceneId, logActivity })
      },
    },
    {
      name: 'analyze_scene',
      title: 'Analyze Scene Pacing & Subtext',
      description:
        "Evaluate a scene's pacing, emotional intensity, dialogue subtext, visual storytelling, and alignment with Director's Memory creative rules.",
      inputSchema: {
        type: 'object',
        properties: {
          sceneId: {
            type: 'string',
            description: 'Scene number or ID to analyze (e.g. "scene-4")',
          },
        },
        required: ['sceneId'],
      },
      execute: async (input = {}) => {
        const project = getProject()
        if (!input.sceneId) {
          throw new Error('WebMCP Error: "sceneId" is required for analyze_scene.')
        }
        return await analyzeScene({ project, sceneId: input.sceneId, logActivity })
      },
    },
    {
      name: 'propose_rewrite',
      title: 'Propose Screenplay Rewrite',
      description:
        "Draft a revised screenplay version that increases restraint, subtext, or tension per Director's Memory. Does NOT overwrite live script; creates a pending revision for human approval.",
      inputSchema: {
        type: 'object',
        properties: {
          sceneId: {
            type: 'string',
            description: 'Scene number or ID to rewrite (e.g. "scene-4")',
          },
          instruction: {
            type: 'string',
            description: 'Creative instruction or reasoning for the rewrite (e.g. "Make dialogue more restrained")',
          },
        },
        required: ['sceneId'],
      },
      execute: async (input = {}) => {
        const project = getProject()
        if (!input.sceneId) {
          throw new Error('WebMCP Error: "sceneId" is required for propose_rewrite.')
        }
        return await proposeRewrite({
          project,
          sceneId: input.sceneId,
          instruction: input.instruction,
          dispatch,
          logActivity,
        })
      },
    },
    {
      name: 'apply_revision',
      title: 'Apply Approved Revision',
      description:
        'Commit a director-approved screenplay revision to the project. Requires that the revision has already received explicit director approval via the StoryRoom UI. Returns HUMAN_APPROVAL_REQUIRED if called on unapproved/pending revisions.',
      inputSchema: {
        type: 'object',
        properties: {
          revisionId: {
            type: 'string',
            description: 'The unique ID of the already-approved revision to commit (e.g. "rev-xxxx")',
          },
        },
        required: ['revisionId'],
      },
      execute: async (input = {}) => {
        const project = getProject()
        if (!input.revisionId) {
          return {
            success: false,
            error: 'INVALID_INPUT',
            message: 'WebMCP Error: "revisionId" is required for apply_revision.',
          }
        }
        return await applyRevision({
          project,
          revisionId: input.revisionId,
          dispatch,
          logActivity,
        })
      },
    },
  ]

  const toolMap = new Map(definitions.map((d) => [d.name, d]))

  async function callTool(name, input = {}) {
    const def = toolMap.get(name)
    if (!def) {
      throw new Error(`Unknown WebMCP tool: "${name}". Available tools: ${definitions.map((d) => d.name).join(', ')}`)
    }
    return await def.execute(input)
  }

  // --- Real WebMCP Environment Registration (document.modelContext & navigator.modelContext) ---
  function registerWithWebMCP() {
    if (typeof window === 'undefined') return

    // Ensure document.modelContext exists (polyfilled host if not natively provided)
    if (!document.modelContext) {
      const toolRegistry = new Map()

      document.modelContext = {
        registerTool(toolOrDef, maybeFn) {
          if (typeof toolOrDef === 'string' && typeof maybeFn === 'function') {
            toolRegistry.set(toolOrDef, { name: toolOrDef, execute: maybeFn })
          } else if (toolOrDef && typeof toolOrDef.execute === 'function') {
            toolRegistry.set(toolOrDef.name, toolOrDef)
          } else if (toolOrDef && typeof maybeFn === 'function') {
            toolRegistry.set(toolOrDef.name, { ...toolOrDef, execute: maybeFn })
          }
        },
        unregisterTool(name) {
          toolRegistry.delete(name)
        },
        getTools() {
          return Array.from(toolRegistry.values()).map(({ name, title, description, inputSchema }) => ({
            name,
            title,
            description,
            inputSchema,
          }))
        },
        async callTool(name, input = {}) {
          const t = toolRegistry.get(name)
          if (!t) throw new Error(`Tool not found: ${name}`)
          return await t.execute(input)
        },
      }
    }

    // Mirror on navigator.modelContext for standards compatibility
    if (!navigator.modelContext) {
      try {
        Object.defineProperty(navigator, 'modelContext', {
          value: document.modelContext,
          writable: true,
          configurable: true,
        })
      } catch {
        // In case navigator is non-extensible
      }
    }

    // Mirror on window.modelContext for global convenience
    if (!window.modelContext) {
      window.modelContext = document.modelContext
    }

    // Register all 8 tools into document.modelContext and navigator.modelContext
    for (const def of definitions) {
      try {
        if (typeof document.modelContext?.registerTool === 'function') {
          document.modelContext.registerTool({
            name: def.name,
            title: def.title,
            description: def.description,
            inputSchema: def.inputSchema,
            execute: def.execute,
          }, def.execute)
        }

        if (navigator.modelContext && navigator.modelContext !== document.modelContext && typeof navigator.modelContext.registerTool === 'function') {
          navigator.modelContext.registerTool({
            name: def.name,
            title: def.title,
            description: def.description,
            inputSchema: def.inputSchema,
            execute: def.execute,
          }, def.execute)
        }
      } catch (e) {
        console.warn(`StoryRoom: Notice while registering "${def.name}" with modelContext:`, e)
      }
    }

    // Expose global debug handle for testing in browser console
    window.__STORYROOM_WEBMCP__ = {
      tools: definitions,
      callTool,
      getLog: () => toolLog,
      isModelContextAvailable: Boolean(document.modelContext?.registerTool),
    }
  }

  // Execute registration immediately
  registerWithWebMCP()

  return {
    definitions,
    callTool,
    getLog: () => toolLog,
    approveRevision: (revisionId) =>
      approveRevisionFromUI({
        project: getProject(),
        revisionId,
        dispatch,
        logActivity,
      }),
    rejectRevision: (revisionId) =>
      rejectRevisionFromUI({
        project: getProject(),
        revisionId,
        dispatch,
        logActivity,
      }),
    registerWithWebMCP,
  }
}
