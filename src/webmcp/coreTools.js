// StoryRoom WebMCP Core Tools Implementation
//
// Clean, robust implementation of the 8 required WebMCP tools.
// Operates on real application state, logs to activity feed,
// and enforces strict structured schemas.
//
// AI operations (analyzeScene, checkContinuity, proposeRewrite) delegate
// to aiIntelligence.js which handles Gemini API + demo fallback.

import {
  analyzeScene as aiAnalyzeScene,
  checkContinuity as aiCheckContinuity,
  proposeRewrite as aiProposeRewrite,
  getAIStatus,
} from './aiIntelligence.js'

export { getAIStatus }

const NUMBER_WORDS = (() => {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
  const teens = [
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ]
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
  const map = {}
  teens.forEach((w, i) => (map[w] = 10 + i))
  ones.forEach((w, i) => {
    if (w) map[w] = i
  })
  tens.forEach((t, ti) => {
    if (!t) return
    map[t] = ti * 10
    ones.forEach((o, oi) => {
      if (o) map[`${t}-${o}`] = ti * 10 + oi
    })
  })
  return map
})()

function wordToNumber(word) {
  if (!word) return null
  const clean = String(word).toLowerCase().trim()
  if (NUMBER_WORDS[clean] !== undefined) return NUMBER_WORDS[clean]
  const n = parseInt(clean, 10)
  return Number.isFinite(n) ? n : null
}

export function findScene(project, sceneId) {
  if (!project || !project.scenes) return null
  if (!sceneId) return null
  const cleanId = String(sceneId).trim().toLowerCase()
  return (
    project.scenes.find((s) => {
      const matchId = s.id && s.id.toLowerCase() === cleanId
      const matchNum = String(s.number) === cleanId || `scene-${s.number}` === cleanId || `scene ${s.number}` === cleanId
      const matchTitle = s.title && s.title.toLowerCase() === cleanId
      return matchId || matchNum || matchTitle
    }) || null
  )
}

export function findCharacter(project, { characterId, characterName, name } = {}) {
  if (!project || !project.characters) return null
  const targetId = characterId ? String(characterId).trim().toLowerCase() : null
  const targetName = (characterName || name) ? String(characterName || name).trim().toLowerCase() : null

  if (targetId) {
    const found = project.characters.find((c) => c.id && c.id.toLowerCase() === targetId)
    if (found) return found
  }

  if (targetName) {
    return (
      project.characters.find((c) => c.name && c.name.toLowerCase() === targetName) ||
      project.characters.find((c) => c.name && c.name.toLowerCase().includes(targetName)) ||
      project.characters.find((c) => targetName.includes(c.name.toLowerCase())) ||
      null
    )
  }
  return null
}

// --- 1. get_story_context -----------------------------------------------------

export async function getStoryContext({ project, logActivity }) {
  if (!project) {
    throw new Error('Project state is currently unavailable.')
  }

  const result = {
    title: project.title || 'Untitled Project',
    genre: project.genre || 'Drama',
    logline: project.logline || '',
    directorIntent: project.directorIntent || '',
    directorsMemory: project.directorsMemory || [],
    characters: (project.characters || []).map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      age: c.age,
      description: c.description,
      personality: c.personality,
      relationships: c.relationships,
      emotionalArc: c.emotionalArc,
    })),
    locations: (project.locations || []).map((loc) => ({
      id: loc.id,
      name: loc.name,
      description: loc.description,
    })),
    sceneList: (project.scenes || []).map((s) => ({
      id: s.id,
      number: s.number,
      title: s.title,
      location: s.location,
      timeOfDay: s.timeOfDay,
      summary: s.summary,
      characterCount: (s.characters || []).length,
    })),
    relevantStoryFacts: [
      `Format: Feature screenplay (${(project.scenes || []).length} active scenes).`,
      `Tone & Atmosphere: ${project.tone || 'Restrained, observational, tense'}.`,
      `Directorial focus: ${project.directorIntent ? project.directorIntent.slice(0, 140) + '...' : 'Subtext and visual restraint'}.`,
      `Standing memory rules: ${(project.directorsMemory || []).length} creative rules enforced in context.`,
      `Core protagonist: ${project.characters?.[0]?.name || 'Riya Mehta'} (${project.characters?.[0]?.role || 'Protagonist'}).`,
    ],
  }

  if (logActivity) {
    logActivity(
      'get_story_context',
      {},
      `Agent retrieved story context for "${result.title}" (${result.characters.length} characters, ${result.locations.length} locations, ${result.sceneList.length} scenes).`
    )
  }

  return result
}

// --- 2. get_current_scene -----------------------------------------------------

export async function getCurrentScene({ project, sceneId, logActivity }) {
  if (!project) throw new Error('Project state is currently unavailable.')
  if (!sceneId) throw new Error('Parameter "sceneId" is required.')

  const scene = findScene(project, sceneId)
  if (!scene) {
    if (logActivity) {
      logActivity('get_current_scene', { sceneId }, `Scene "${sceneId}" not found.`, 'error')
    }
    throw new Error(`Scene not found for identifier "${sceneId}". Available scenes: ${project.scenes.map((s) => `Scene ${s.number}`).join(', ')}.`)
  }

  const characterProfiles = (scene.characters || []).map((cid) => {
    const char = project.characters?.find((c) => c.id === cid)
    return char ? { id: char.id, name: char.name, role: char.role } : { id: cid, name: cid }
  })

  const result = {
    id: scene.id,
    sceneNumber: scene.number,
    title: scene.title,
    location: scene.location,
    time: scene.timeOfDay,
    characters: characterProfiles,
    screenplay: scene.screenplay,
    emotionalGoal: scene.emotionalGoal || 'Establish scene tension through visual beats.',
    continuityNotes: scene.continuityNotes || '',
  }

  if (logActivity) {
    logActivity(
      'get_current_scene',
      { sceneId },
      `Agent inspected Scene ${String(scene.number).padStart(2, '0')}: "${scene.title}" (${scene.location} - ${scene.timeOfDay}).`
    )
  }

  return result
}

// --- 3. search_scenes ---------------------------------------------------------

export async function searchScenes({ project, query, character, location, timeOfDay, logActivity }) {
  if (!project) throw new Error('Project state is currently unavailable.')

  const q = (query || '').toLowerCase().trim()
  const charFilter = (character || '').toLowerCase().trim()
  const locFilter = (location || '').toLowerCase().trim()
  const timeFilter = (timeOfDay || '').toLowerCase().trim()

  const matches = (project.scenes || []).filter((s) => {
    // Character filter
    if (charFilter) {
      const hasChar = s.characters?.some((cid) => {
        const char = project.characters?.find((c) => c.id === cid)
        return char && char.name.toLowerCase().includes(charFilter)
      }) || (s.screenplay && s.screenplay.toLowerCase().includes(charFilter))
      if (!hasChar) return false
    }

    // Location filter
    if (locFilter) {
      const matchLoc = s.location && s.location.toLowerCase().includes(locFilter)
      if (!matchLoc) return false
    }

    // Time of day filter
    if (timeFilter) {
      const matchTime = s.timeOfDay && s.timeOfDay.toLowerCase().includes(timeFilter)
      if (!matchTime) return false
    }

    // Full-text query
    if (q) {
      const charNames = (s.characters || [])
        .map((cid) => project.characters?.find((c) => c.id === cid)?.name || '')
        .join(' ')
        .toLowerCase()
      const haystack = `${s.title} ${s.summary} ${s.screenplay} ${s.location} ${s.emotionalGoal} ${charNames}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }

    return true
  })

  const results = matches.map((s) => ({
    id: s.id,
    number: s.number,
    title: s.title,
    location: s.location,
    timeOfDay: s.timeOfDay,
    summary: s.summary,
    characters: (s.characters || []).map((cid) => project.characters?.find((c) => c.id === cid)?.name || cid),
    screenplayExcerpt: s.screenplay ? s.screenplay.slice(0, 150) + '...' : '',
  }))

  if (logActivity) {
    logActivity(
      'search_scenes',
      { query, character, location, timeOfDay },
      `Agent searched scenes (query: "${query || '*'}", char: "${character || '*'}") → Found ${results.length} matching scene(s).`
    )
  }

  return {
    query: query || '',
    filters: { character: character || null, location: location || null, timeOfDay: timeOfDay || null },
    count: results.length,
    matchingScenes: results,
  }
}

// --- 4. get_character ---------------------------------------------------------

export async function getCharacter({ project, characterName, characterId, name, logActivity }) {
  if (!project) throw new Error('Project state is currently unavailable.')
  const queryName = characterName || name || characterId
  if (!queryName) {
    throw new Error('Parameter "characterName" or "characterId" is required.')
  }

  const character = findCharacter(project, { characterId, characterName: queryName })
  if (!character) {
    if (logActivity) {
      logActivity('get_character', { characterName: queryName }, `Character "${queryName}" not found.`, 'error')
    }
    throw new Error(`Character profile not found for "${queryName}". Available cast: ${project.characters.map((c) => c.name).join(', ')}.`)
  }

  // Find scenes character appears in
  const scenesWithChar = (project.scenes || []).filter((s) => {
    const byId = Array.isArray(s.characters) && s.characters.includes(character.id)
    const byName = s.screenplay && s.screenplay.toUpperCase().includes(character.name.toUpperCase().split(' ')[0])
    return byId || byName
  }).map((s) => ({
    sceneNumber: s.number,
    title: s.title,
    location: s.location,
    timeOfDay: s.timeOfDay,
    summary: s.summary,
  }))

  const result = {
    profile: {
      id: character.id,
      name: character.name,
      age: character.age,
      role: character.role,
      description: character.description,
      personality: character.personality,
    },
    relationships: character.relationships || 'No specific dynamics recorded.',
    emotionalArc: character.emotionalArc || 'No arc recorded.',
    scenes: scenesWithChar,
    sceneCount: scenesWithChar.length,
  }

  if (logActivity) {
    logActivity(
      'get_character',
      { characterName: character.name },
      `Agent retrieved character dossier for ${character.name} (${character.role}, appears in ${scenesWithChar.length} scene(s)).`
    )
  }

  return result
}

// --- 5. check_continuity ------------------------------------------------------

export async function checkContinuity({ project, sceneId, logActivity }) {
  if (!project) throw new Error('Project state is currently unavailable.')

  const issues = []

  // 1. Character Age contradictions
  const WINDOW = 40
  const ageMentionRe = /(turning|turns|just turned)\s+([a-z-]+|\d{1,3})/gi
  for (const scene of project.scenes || []) {
    let match
    while ((match = ageMentionRe.exec(scene.screenplay))) {
      const mentioned = wordToNumber(match[2])
      if (mentioned === null) continue
      const windowStart = Math.max(0, match.index - WINDOW)
      const preceding = scene.screenplay.slice(windowStart, match.index)
      for (const character of project.characters || []) {
        const firstName = character.name.split(' ')[0]
        if (!preceding.includes(firstName)) continue
        const diff = Math.abs(character.age - mentioned)
        if (diff > 0 && diff <= 5) {
          issues.push({
            type: 'character_age_contradiction',
            severity: 'warning',
            sceneNumber: scene.number,
            relatedScenes: [scene.number],
            explanation: `Scene ${scene.number} dialogue indicates ${firstName} is turning ${mentioned}, but the character profile defines ${character.name} as age ${character.age}.`,
            affectedEntity: character.name,
          })
        }
      }
    }
  }

  // 2. Location Naming inconsistencies across timeline
  const buildingRe = /\b([A-Za-z]+ (?:mill|warehouse|factory|plant|studio|apartment|station|yard))\b/gi
  const byLocation = new Map()
  for (const scene of project.scenes || []) {
    const found = new Set()
    let match
    while ((match = buildingRe.exec(scene.screenplay))) {
      found.add(match[1].toLowerCase())
    }
    if (found.size === 0) continue
    if (!byLocation.has(scene.location)) byLocation.set(scene.location, new Map())
    const perLoc = byLocation.get(scene.location)
    for (const phrase of found) {
      if (!perLoc.has(phrase)) perLoc.set(phrase, [])
      perLoc.get(phrase).push(scene.number)
    }
  }
  for (const [location, phraseMap] of byLocation.entries()) {
    if (phraseMap.size > 1) {
      const phrases = [...phraseMap.entries()].map(
        ([phrase, scenes]) => `"${phrase}" (Scene ${scenes.join(', ')})`
      )
      const allRelatedScenes = [...new Set([...phraseMap.values()].flat())]
      issues.push({
        type: 'location_naming_contradiction',
        severity: 'error',
        sceneNumber: allRelatedScenes[0],
        relatedScenes: allRelatedScenes,
        explanation: `Location "${location}" is described with conflicting terms: ${phrases.join(' vs. ')}. Pick a single consistent term.`,
        affectedEntity: location,
      })
    }
  }

  // 3. Prop / Reel consistency
  const reelRe = /TAKE\s*([0-9]+|[IVXLC]+)/gi
  const seenReels = new Map()
  for (const scene of project.scenes || []) {
    let match
    while ((match = reelRe.exec(scene.screenplay))) {
      const full = match[0].toUpperCase().replace(/\s+/g, ' ')
      if (!seenReels.has(full)) seenReels.set(full, [])
      seenReels.get(full).push(scene.number)
    }
  }
  if (seenReels.size > 1) {
    const variants = [...seenReels.entries()].map(([label, scenes]) => `"${label}" (Scene ${scenes.join(', ')})`)
    const allReelScenes = [...new Set([...seenReels.values()].flat())]
    issues.push({
      type: 'prop_label_inconsistency',
      severity: 'warning',
      sceneNumber: allReelScenes[0],
      relatedScenes: allReelScenes,
      explanation: `The key tape/reel prop is labeled inconsistently across scenes: ${variants.join(' vs. ')}.`,
      affectedEntity: 'TAKE 7',
    })
  }

  // Filter if scoped to a specific scene
  let filteredIssues = issues
  if (sceneId) {
    const target = findScene(project, sceneId)
    if (target) {
      filteredIssues = issues.filter((i) => i.relatedScenes.includes(target.number))
    }
  }

  const overallSeverity = filteredIssues.some((i) => i.severity === 'error')
    ? 'error'
    : filteredIssues.length > 0
    ? 'warning'
    : 'clean'

  const result = {
    scope: sceneId ? `Scene ${sceneId}` : 'Full Screenplay',
    issueCount: filteredIssues.length,
    severity: overallSeverity,
    explanation:
      filteredIssues.length === 0
        ? 'No character state, timeline, or location contradictions detected.'
        : `Detected ${filteredIssues.length} continuity issue(s): ${filteredIssues.map((i) => i.type).join(', ')}.`,
    issues: filteredIssues,
    relatedScenes: [...new Set(filteredIssues.flatMap((i) => i.relatedScenes))],
  }

  if (logActivity) {
    logActivity(
      'check_continuity',
      { sceneId: sceneId || 'all' },
      filteredIssues.length === 0
        ? 'Agent checked continuity: All characters, props, and timelines are consistent.'
        : `Agent checked continuity: Flagged ${filteredIssues.length} continuity issue(s) across Scene(s) ${result.relatedScenes.join(', ')}.`,
      overallSeverity === 'clean' ? 'success' : 'flagged'
    )
  }

  return result
}

// --- 6. analyze_scene ---------------------------------------------------------

export async function analyzeScene({ project, sceneId, logActivity }) {
  if (!project) throw new Error('Project state is currently unavailable.')
  if (!sceneId) throw new Error('Parameter "sceneId" is required.')

  const scene = findScene(project, sceneId)
  if (!scene) {
    if (logActivity) logActivity('analyze_scene', { sceneId }, `Scene "${sceneId}" not found for analysis.`, 'error')
    throw new Error(`Scene "${sceneId}" not found.`)
  }

  const projectContext = {
    characters: project.characters || [],
    directorsMemory: project.directorsMemory || [],
    scenes: project.scenes || [],
  }

  // Delegate to AI intelligence layer (real API or demo fallback)
  const result = await aiAnalyzeScene(scene, projectContext)

  if (logActivity) {
    const findingCount = result.findings?.length || 0
    logActivity(
      'analyze_scene',
      { sceneId, mode: result.mode },
      findingCount > 0
        ? `Agent analyzed Scene ${scene.number} ("${scene.title}"): ${findingCount} creative note(s) against Director's Memory.`
        : `Agent analyzed Scene ${scene.number} ("${scene.title}"): Dialogue and pacing align with Director's Memory.`
    )
  }

  return result
}

// --- 7. propose_rewrite -------------------------------------------------------

export async function proposeRewrite({ project, sceneId, instruction, reason, directive, dispatch, logActivity }) {
  if (!project) throw new Error('Project state is currently unavailable.')
  if (!sceneId) throw new Error('Parameter "sceneId" is required.')

  const scene = findScene(project, sceneId)
  if (!scene) {
    if (logActivity) logActivity('propose_rewrite', { sceneId }, `Scene "${sceneId}" not found.`, 'error')
    throw new Error(`Scene "${sceneId}" not found.`)
  }

  const userInstruction = instruction || directive || reason || 'Make dialogue more restrained and subtext-driven.'

  const storyContext = {
    characters: project.characters || [],
    scenes: project.scenes || [],
    title: project.title || '',
    tone: project.tone || '',
    directorIntent: project.directorIntent || '',
  }

  // Delegate to AI intelligence layer (real Gemini API or demo fallback)
  const aiResult = await aiProposeRewrite(
    scene,
    userInstruction,
    project.directorsMemory || [],
    storyContext
  )

  const revisionId = `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

  // Store pending revision — does NOT overwrite screenplay automatically
  if (dispatch) {
    dispatch({
      type: 'ADD_REVISION',
      payload: {
        id: revisionId,
        sceneId: scene.id,
        originalText: scene.screenplay,
        proposedText: aiResult.proposedText,
        reason: aiResult.reasoningSummary || userInstruction,
        instruction: userInstruction,
        continuityConsiderations: aiResult.continuityConsiderations,
        directorIntentAlignment: aiResult.directorIntentAlignment,
        potentialRisks: aiResult.potentialRisks,
        mode: aiResult.mode,
      },
    })
  }

  const result = {
    revisionId,
    sceneId: scene.id,
    sceneNumber: scene.number,
    sceneTitle: scene.title,
    original: scene.screenplay,
    proposed: aiResult.proposedText,
    proposedText: aiResult.proposedText,
    reason: aiResult.reasoningSummary || userInstruction,
    reasoningSummary: aiResult.reasoningSummary,
    continuityConsiderations: aiResult.continuityConsiderations,
    directorIntentAlignment: aiResult.directorIntentAlignment,
    potentialRisks: aiResult.potentialRisks,
    directorIntentConsidered: aiResult.directorIntentAlignment || [],
    risks: (aiResult.potentialRisks || []).join(' '),
    status: 'pending_director_review',
    mode: aiResult.mode,
  }

  if (logActivity) {
    const modeLabel = aiResult.mode === 'ai' ? '[AI]' : '[Demo]'
    logActivity(
      'propose_rewrite',
      { sceneId: scene.id, instruction: userInstruction, mode: aiResult.mode },
      `${modeLabel} Agent drafted a revision for Scene ${scene.number} ("${scene.title}") → Pending review in Revision Review.`
    )
  }

  return result
}

// --- 8. apply_revision (HUMAN-IN-THE-LOOP ENFORCED) ------------------------

export function approveRevisionFromUI({ project, revisionId, dispatch, logActivity }) {
  if (!project || !revisionId) return false
  const rev = (project.revisions || []).find((r) => r.id === revisionId)
  if (!rev || rev.status === 'applied' || rev.status === 'rejected') return false

  const targetScene = project.scenes?.find((s) => s.id === rev.sceneId)
  if (dispatch) {
    dispatch({
      type: 'APPROVE_REVISION',
      payload: { revisionId },
    })
  }

  if (logActivity) {
    logActivity(
      'human_decision',
      { revisionId },
      `Director approved revision for Scene ${targetScene ? String(targetScene.number).padStart(2, '0') : rev.sceneId}. Staged for commit.`,
      'success',
      'Director approved revision',
      'SUCCESS'
    )
  }
  return true
}

export function rejectRevisionFromUI({ project, revisionId, dispatch, logActivity }) {
  if (!project || !revisionId) return false
  const rev = (project.revisions || []).find((r) => r.id === revisionId)
  if (!rev) return false

  const targetScene = project.scenes?.find((s) => s.id === rev.sceneId)
  if (dispatch) {
    dispatch({
      type: 'REJECT_REVISION',
      payload: { revisionId },
    })
  }

  if (logActivity) {
    logActivity(
      'human_decision',
      { revisionId },
      `Director rejected proposed revision for Scene ${targetScene ? String(targetScene.number).padStart(2, '0') : rev.sceneId}. Screenplay preserved.`,
      'warning',
      'Director rejected proposed revision',
      'WARNING'
    )
  }
  return true
}

export async function applyRevision({ project, revisionId, dispatch, logActivity }) {
  if (!project) {
    return {
      success: false,
      error: 'PROJECT_UNAVAILABLE',
      message: 'Project state is currently unavailable.',
    }
  }

  if (!revisionId) {
    return {
      success: false,
      error: 'INVALID_INPUT',
      message: 'Parameter "revisionId" is required for apply_revision.',
    }
  }

  // 1. Verify revision exists
  const rev = (project.revisions || []).find((r) => r.id === revisionId)
  if (!rev) {
    const errorResponse = {
      success: false,
      error: 'REVISION_NOT_FOUND',
      message: `Revision with id "${revisionId}" was not found in active project.`,
    }
    if (logActivity) {
      logActivity(
        'apply_revision',
        { revisionId },
        `Revision "${revisionId}" not found.`,
        'error',
        'Attempted to apply unknown revision',
        'ERROR'
      )
    }
    return errorResponse
  }

  // 3. Verify revision belongs to current project
  const targetScene = project.scenes?.find((s) => s.id === rev.sceneId)
  if (!targetScene) {
    return {
      success: false,
      error: 'SCENE_NOT_FOUND',
      message: `Scene for revision "${revisionId}" does not belong to the current project.`,
    }
  }

  // 4. Verify revision has not already been applied
  if (rev.status === 'applied') {
    const errorResponse = {
      success: false,
      error: 'ALREADY_APPLIED',
      message: `Revision "${revisionId}" has already been applied to Scene ${targetScene.number}.`,
    }
    if (logActivity) {
      logActivity(
        'apply_revision',
        { revisionId },
        `Revision "${revisionId}" was already applied.`,
        'warning',
        'Attempted to re-apply committed revision',
        'WARNING'
      )
    }
    return errorResponse
  }

  // Check if revision was rejected
  if (rev.status === 'rejected') {
    const errorResponse = {
      success: false,
      error: 'REVISION_REJECTED',
      message: 'This revision was rejected by the director and cannot be applied.',
    }
    if (logActivity) {
      logActivity(
        'apply_revision',
        { revisionId },
        `Cannot apply rejected revision "${revisionId}".`,
        'warning',
        'Attempted to apply rejected revision',
        'WARNING'
      )
    }
    return errorResponse
  }

  // 2. CRITICAL HUMAN-IN-THE-LOOP CHECK:
  // An unapproved revision CANNOT be applied by external agents or scripts.
  if (rev.status !== 'approved') {
    const errorResponse = {
      success: false,
      error: 'HUMAN_APPROVAL_REQUIRED',
      message: 'This revision requires explicit director approval before it can be applied.',
    }
    if (logActivity) {
      logActivity(
        'apply_revision',
        { revisionId, currentStatus: rev.status },
        `Blocked unapproved revision application for Scene ${targetScene.number}. Human director approval required.`,
        'warning',
        'Blocked unapproved revision (Human approval required)',
        'WARNING'
      )
    }
    return errorResponse
  }

  // Revision is approved: commit to screenplay
  if (dispatch) {
    dispatch({
      type: 'APPLY_REVISION',
      payload: { revisionId },
    })
  }

  const result = {
    success: true,
    status: 'applied',
    revisionId,
    sceneId: rev.sceneId,
    sceneNumber: targetScene.number,
    sceneTitle: targetScene.title,
    appliedAt: new Date().toISOString(),
    updatedScreenplay: rev.proposedText,
  }

  if (logActivity) {
    logActivity(
      'apply_revision',
      { revisionId },
      `Revision applied to Scene ${String(targetScene.number).padStart(2, '0')} ("${targetScene.title}"). Screenplay updated.`,
      'success',
      'Revision applied',
      'SUCCESS'
    )
  }

  return result
}
