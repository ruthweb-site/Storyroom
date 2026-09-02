// StoryRoom AI Intelligence Layer
//
// Implements the three core screenplay AI operations:
//   analyzeScene(scene, projectContext)
//   checkContinuity(scene, previousScenes, characters)
//   proposeRewrite(scene, instruction, directorMemory, storyContext)
//
// Architecture:
//   1. Attempts a real Gemini API call if VITE_GEMINI_API_KEY is configured.
//   2. Falls back to a high-quality deterministic demo mode when no API key
//      is present — demo mode is selected automatically and transparently.
//   3. Every response returns the same structured JSON schema.
//
// SYSTEM ROLE (injected into every AI call):
//   "You are the AI creative assistant inside a professional filmmaking workspace.
//    You assist the director but do not replace the director.
//    Respect the director's creative intent.
//    Never invent established story facts without clearly identifying them.
//    Preserve character continuity.
//    Prefer cinematic visual storytelling.
//    Do not automatically modify the screenplay.
//    Return a proposed revision for human approval."

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CANDIDATE_MODELS = [
  import.meta.env.VITE_GEMINI_MODEL,
  'gemini-1.5-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro',
].filter(Boolean)

let activeModel = CANDIDATE_MODELS[0] || 'gemini-1.5-flash'

function hasApiKey() {
  return typeof GEMINI_API_KEY === 'string' && GEMINI_API_KEY.trim().length > 20
}

// ---------------------------------------------------------------------------
// Prompt builder helpers
// ---------------------------------------------------------------------------

function systemRole() {
  return `You are the AI creative assistant inside a professional filmmaking workspace called StoryRoom.

Your responsibilities:
- Assist the director but never replace the director's creative judgment.
- Respect and enforce the Director's Memory rules in every response.
- Never invent story facts, character backgrounds, or plot points not established in the script.
- Preserve character continuity and emotional consistency across scenes.
- Prefer cinematic visual storytelling over on-the-nose dialogue.
- Do NOT automatically modify the screenplay — always propose a revision for human review.
- Keep your reasoning concise and useful. No chain-of-thought. Return structured JSON only.`
}

function formatScene(scene) {
  if (!scene) return '(no scene)'
  return `Scene ${scene.number}: "${scene.title}"
Location: ${scene.location} — ${scene.timeOfDay}
Emotional Goal: ${scene.emotionalGoal || 'Not specified'}
Characters: ${(scene.characters || []).join(', ')}

SCREENPLAY:
${scene.screenplay || '(empty)'}`
}

function formatCharacters(characters) {
  if (!characters || characters.length === 0) return '(no characters)'
  return characters.map((c) =>
    `- ${c.name} (${c.role}, Age ${c.age}): ${c.description || ''}\n  Arc: ${c.emotionalArc || ''}`
  ).join('\n')
}

function formatDirectorsMemory(rules) {
  if (!rules || rules.length === 0) return '(no rules defined)'
  return rules.map((r, i) => `${i + 1}. ${r}`).join('\n')
}

function formatPreviousScenes(scenes) {
  if (!scenes || scenes.length === 0) return '(no previous scenes)'
  return scenes.slice(-3).map((s) =>
    `Scene ${s.number} — ${s.title} [${s.location}, ${s.timeOfDay}]\n${s.summary || ''}`
  ).join('\n\n')
}

// ---------------------------------------------------------------------------
// Real Gemini API call with automatic model cascade
// ---------------------------------------------------------------------------

async function callGemini(prompt) {
  let lastError = null

  // Try candidate models in order if one returns 404 / unavailable
  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemRole() }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1800,
            responseMimeType: 'application/json',
          },
        }),
      })

      if (response.ok) {
        activeModel = model
        const data = await response.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) throw new Error('Gemini returned an empty response.')

        try {
          return JSON.parse(text)
        } catch {
          const match = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/)
          if (match) return JSON.parse(match[1])
          throw new Error('Gemini response was not valid JSON.')
        }
      }

      // If model not found or unavailable, try next candidate
      const errText = await response.text().catch(() => response.statusText)
      lastError = new Error(`Gemini API (${model}) returned ${response.status}: ${errText.slice(0, 150)}`)
    } catch (e) {
      lastError = e
    }
  }

  throw lastError || new Error('All Gemini candidate models failed.')
}

// ---------------------------------------------------------------------------
// Demo Mode — Deterministic, high-quality scene-aware responses
// ---------------------------------------------------------------------------

const DEMO_ANALYZE = {
  default: {
    pacing: 'Deliberate and visually anchored — the scene earns its silences.',
    emotionalIntensity: 'Restrained grief, operating entirely beneath the surface.',
    dialogue: {
      assessment: 'Mostly effective subtext. One line is too direct.',
      flaggedLines: [
        'I feel so devastated and heartbroken, I can\'t believe my brother is gone and it\'s destroying me inside, and nobody will just look at the tape.',
      ],
      suggestion: 'Replace the emotional declaration with a behaviour or physical action that conveys the same feeling without stating it.',
    },
    conflict: 'Internal: investigative compulsion vs. institutional indifference.',
    characterConsistency: 'Consistent with Riya\'s profile. She does not ask for help — she presents evidence.',
    visualStorytelling: {
      score: '87/100',
      notes: 'Strong use of objects (tape, monitor, timestamp) to carry meaning. Room for more physical specificity in the final beat.',
    },
    directorIntentAlignment: [
      '✓ Prefers visual storytelling — achieved via the tape and timestamp',
      '✓ Maintains psychological tension — detective\'s indifference amplifies the dread',
      '⚠ Characters rarely say exactly what they feel — one line fails this rule',
      '✓ Avoids unnecessary exposition — the situation is communicated through procedure',
    ],
    findings: [
      {
        dimension: 'dialogue',
        severity: 'suggestion',
        message: '1 line states emotion directly, conflicting with Director\'s Memory: "Characters rarely say exactly what they feel."',
        evidence: ['I feel so devastated and heartbroken, I can\'t believe my brother is gone and it\'s destroying me inside, and nobody will just look at the tape.'],
      },
      {
        dimension: 'scene_stats',
        severity: 'info',
        message: 'Scene is 126 words. Evaluated against 8 active Director\'s Memory rules.',
      },
    ],
    _demo: true,
  },
  'scene-7': {
    pacing: 'Extremely slow, image-led. Every cut costs something.',
    emotionalIntensity: 'Pure dread in silence — the most exposed moment in the script.',
    dialogue: {
      assessment: 'No dialogue. All emotion is carried by physical action and the film image on screen.',
      flaggedLines: [],
      suggestion: 'Consider whether Riya makes any sound at all — a single involuntary exhale might be more devastating than continued silence.',
    },
    conflict: 'Riya\'s compulsion to see and understand vs. the impossibility of the image.',
    characterConsistency: 'Deeply consistent. Riya rewinds and replays — this is how she processes everything.',
    visualStorytelling: {
      score: '96/100',
      notes: 'The scene\'s entire meaning is visual. The reel, the monitor light, and Arjun\'s silent address to camera are maximally effective.',
    },
    directorIntentAlignment: [
      '✓ Prefer visual storytelling — the scene IS visual storytelling',
      '✓ Silence can carry emotional information — scene uses no dialogue at all',
      '✓ Keep emotional moments restrained — Riya\'s reaction is entirely physical, minimal',
      '✓ Maintain psychological tension — ends unresolved, rewinding',
    ],
    findings: [
      {
        dimension: 'pacing',
        severity: 'info',
        message: 'Scene is 76 words — the script\'s leanest emotional beat. This is appropriate for the material.',
      },
      {
        dimension: 'visual_storytelling',
        severity: 'info',
        message: 'Fully image-led. No dialogue to evaluate for subtext.',
      },
    ],
    _demo: true,
  },
}

const DEMO_CONTINUITY = {
  default: {
    issueCount: 2,
    severity: 'warning',
    explanation: 'Two continuity issues detected across the screenplay.',
    issues: [
      {
        type: 'character_age_contradiction',
        severity: 'warning',
        sceneNumber: 2,
        relatedScenes: [2],
        explanation: 'Scene 2 dialogue: "Arjun\'s turning thirty next month" — but the character profile defines Arjun Mehta as age 31. The dialogue implies he is not yet 30, which contradicts the established profile.',
        affectedEntity: 'Arjun Mehta',
      },
      {
        type: 'location_naming_contradiction',
        severity: 'warning',
        sceneNumber: 6,
        relatedScenes: [5, 6],
        explanation: 'Scenes 5–6 both describe the Editing Studio interior, but Scene 5 references "an old freight yard" while Scene 6 describes "the textile mill floor." These must align to the same consistent physical description.',
        affectedEntity: 'Editing Studio / Railway Station',
      },
    ],
    relatedScenes: [2, 5, 6],
    _demo: true,
  },
}

const DEMO_REWRITES = {
  'scene-7-tense': {
    proposedText: `INT. RIYA'S APARTMENT - NIGHT (LATER)

The room is dark except for the telecine rig's amber glow. RIYA threads the TAKE 7 reel with the practiced care of someone who does not trust herself to breathe wrong.

She kills the room light. Just the monitor now.

The image resolves: the studio floor, lit as they found it. ARJUN walks into frame from behind the camera. He moves like someone who knows exactly where the lens is.

He stops. Turns.

Looks directly into the lens. Into the room where she is sitting.

His mouth moves. Three words. Maybe two. The reel has no sound.

RIYA leans forward until her reflection overlaps his face on the glass. She mouths the syllables back at herself, trying to match the shape of them.

She stops.

Rewinds.

Plays it again. Frame by frame this time.

Her hand does not move.`,
    reasoningSummary: 'Grounded the scene in physical specificity — the darkened room, the amber glow, Riya killing the light to be alone with the image. Riya\'s physical closeness to the monitor is intensified. "Frame by frame" is added to mirror her investigative methodology established in Scene 1. The final still hand replaces the more general "plays it again" to anchor the tension in a physical image rather than continued action.',
    continuityConsiderations: [
      'Reel labeled "TAKE 7" — unchanged, consistent with Scene 3.',
      'Riya is described working with a telecine rig — consistent with her editing background.',
      'Arjun is still seen only in footage, not in person — preserves the established rule.',
    ],
    directorIntentAlignment: [
      '"Prefer visual storytelling" — scene is entirely image and physical behaviour',
      '"Silence can carry emotional information" — no dialogue, silence is the content',
      '"Keep emotional moments restrained" — Riya does not react visibly; her stillness is the reaction',
      '"Maintain psychological tension" — ends on a held breath, not a release',
    ],
    potentialRisks: [
      'Longer scene may slow the cut into Scene 8 — editor and director should time the reel sequence carefully.',
      'The "overlapping reflection" detail requires precision in the production design of the monitor placement.',
    ],
    _demo: true,
  },
  'scene-4-restrained': {
    proposedText: `INT. ARJUN'S APARTMENT - DAY

Cold morning light. RIYA sits across a makeshift table from a DETECTIVE (40s), tired, not unkind.

DETECTIVE
A timestamp on an old tape.

RIYA
After he was reported missing. Recorded after.

DETECTIVE
Cameras misdate all the time. Battery dies, clock resets.

A long pause. Riya does not look at him. She looks at the tape.

RIYA
Just look at the tape. Please.

Her voice doesn't rise. It doesn't need to.

The DETECTIVE softens, slides a box of tissues two inches closer, says nothing.

DETECTIVE
I'll flag the file. That's what I can do today.

Riya nods. Takes the tape back off the desk before he can stop her.`,
    reasoningSummary: 'Replaced the melodramatic multi-clause declaration with a single, quiet plea. The original line ("I feel so devastated and heartbroken...") told the audience how to feel. The revision shows Riya\'s restraint breaking in the smallest possible way — a two-word ask — which is far more devastating in context. The moment is clarified with a stage direction that names what the restraint is doing, without being prescriptive about performance.',
    continuityConsiderations: [
      'Scene still references tape 14 from Scene 1 — continuity maintained.',
      'Detective remains unnamed — consistent with Scene 4 continuity note.',
      'Location updated to Arjun\'s Apartment — matches current scene assignment.',
    ],
    directorIntentAlignment: [
      '"Characters rarely say exactly what they feel" — replaced direct grief declaration with restrained request',
      '"Keep emotional moments restrained" — the pause and the whisper do more work than the original speech',
      '"Avoid melodramatic dialogue" — removed the five-clause run-on emotional statement',
      '"Dialogue should sound natural" — "Just look at the tape. Please." is how a real person holds it together',
    ],
    potentialRisks: [
      'The restraint assumes strong performance — if played too flat, the audience may not register the grief.',
      'The stage direction ("Her voice doesn\'t rise. It doesn\'t need to.") should be treated as guidance for casting/rehearsal, not a performance note during shooting.',
    ],
    _demo: true,
  },
  default: {
    proposedText: null, // Will be generated dynamically
    reasoningSummary: 'Applied a restraint pass consistent with Director\'s Memory. On-the-nose emotional statements replaced with physical action and subtext.',
    continuityConsiderations: [
      'Character names and their roles remain unchanged.',
      'Location and time of day preserved.',
      'No new characters or props introduced.',
    ],
    directorIntentAlignment: [
      '"Characters rarely say exactly what they feel" — direct statements softened into implication',
      '"Prefer visual storytelling" — physical beats added where verbal explanation was removed',
      '"Keep emotional moments restrained" — removed heightened punctuation and exclamatory phrasing',
    ],
    potentialRisks: [
      'Relies on precise performance to communicate what the dialogue no longer states explicitly.',
    ],
    _demo: true,
  },
}

// Deterministic rewrite pass for demo mode
function deterministicRewrite(scene, instruction) {
  let text = scene.screenplay
  let changed = false

  // Known melodramatic line fix
  const melodramaticRe = /I feel so devastated and heartbroken, I can'?t believe my brother is gone and it'?s destroying me inside, and nobody will just look at the tape\.?/i
  if (melodramaticRe.test(text)) {
    text = text.replace(melodramaticRe, "Just look at the tape. Please.\n\nHer voice doesn't rise. It doesn't need to.")
    changed = true
  }

  // Tense / tension instruction
  if (/tense|tension/i.test(instruction || '')) {
    const relaxedEnding = /She doesn't get it\. Not yet\.\n\nShe rewinds\. Plays it again\./i
    if (relaxedEnding.test(text)) {
      text = text.replace(
        relaxedEnding,
        'She leans forward until her reflection overlaps his face on the glass.\n\nShe rewinds. Plays it frame by frame. Her hand does not move.'
      )
      changed = true
    }
  }

  // Generic emotional restraint pass
  if (!changed) {
    text = text.replace(/\bI feel (so |really |absolutely )?([a-z]+)\b\.?/gi, '(a beat, unfinished)')
    changed = true
  }

  return { text, changed }
}

// Pick the best demo rewrite key from the instruction + scene
function getDemoRewriteKey(scene, instruction) {
  const lower = (instruction || '').toLowerCase()
  if (/tense|tension/i.test(lower) && scene?.id === 'scene-7') return 'scene-7-tense'
  if (/restrain|subtext|melodramat|direct|on.the.nose/i.test(lower) && scene?.id === 'scene-4') return 'scene-4-restrained'
  if (scene?.id === 'scene-4') return 'scene-4-restrained'
  if (scene?.id === 'scene-7') return 'scene-7-tense'
  return 'default'
}

// ---------------------------------------------------------------------------
// 1. analyzeScene
// ---------------------------------------------------------------------------

export async function analyzeScene(scene, projectContext) {
  if (!scene) throw new Error('analyzeScene: scene is required.')

  const { characters = [], directorsMemory = [], scenes = [] } = projectContext || {}
  const previousScenes = scenes.filter((s) => s.number < scene.number)

  // Demo mode
  if (!hasApiKey()) {
    const template = DEMO_ANALYZE[scene.id] || DEMO_ANALYZE.default
    return {
      sceneId: scene.id,
      sceneNumber: scene.number,
      sceneTitle: scene.title,
      pacing: template.pacing,
      emotionalIntensity: template.emotionalIntensity,
      dialogue: template.dialogue,
      conflict: template.conflict,
      characterConsistency: template.characterConsistency,
      visualStorytelling: template.visualStorytelling,
      directorIntentAlignment: template.directorIntentAlignment,
      findings: template.findings,
      mode: 'demo',
    }
  }

  // Real AI
  const prompt = `Analyze this screenplay scene. Return ONLY a JSON object with this exact structure — no markdown, no explanation outside the JSON:

{
  "pacing": "string",
  "emotionalIntensity": "string",
  "dialogue": { "assessment": "string", "flaggedLines": ["string"], "suggestion": "string" },
  "conflict": "string",
  "characterConsistency": "string",
  "visualStorytelling": { "score": "string", "notes": "string" },
  "directorIntentAlignment": ["string"],
  "findings": [{ "dimension": "string", "severity": "info|suggestion|warning", "message": "string" }]
}

DIRECTOR'S MEMORY (rules to evaluate against):
${formatDirectorsMemory(directorsMemory)}

CHARACTER PROFILES:
${formatCharacters(characters)}

PREVIOUS SCENES (context):
${formatPreviousScenes(previousScenes)}

CURRENT SCENE TO ANALYZE:
${formatScene(scene)}

Evaluate: pacing, emotional intensity, dialogue subtext, character consistency, visual storytelling, alignment with Director's Memory. Flag any lines that state emotion directly.`

  try {
    const result = await callGemini(prompt)
    return {
      sceneId: scene.id,
      sceneNumber: scene.number,
      sceneTitle: scene.title,
      ...result,
      mode: 'ai',
    }
  } catch (err) {
    console.warn('StoryRoom AI: analyzeScene API failed, falling back to demo.', err.message)
    const template = DEMO_ANALYZE[scene.id] || DEMO_ANALYZE.default
    return {
      sceneId: scene.id,
      sceneNumber: scene.number,
      sceneTitle: scene.title,
      ...template,
      mode: 'demo_fallback',
    }
  }
}

// ---------------------------------------------------------------------------
// 2. checkContinuity
// ---------------------------------------------------------------------------

export async function checkContinuity(scene, previousScenes, characters) {
  if (!scene) throw new Error('checkContinuity: scene is required.')

  // Demo mode
  if (!hasApiKey()) {
    const template = DEMO_CONTINUITY[scene.id] || DEMO_CONTINUITY.default
    return { ...template, mode: 'demo' }
  }

  const prompt = `You are a script supervisor. Check the following scene for continuity errors against previous scenes and character profiles.

Return ONLY this JSON — no markdown:
{
  "issueCount": number,
  "severity": "clean|warning|error",
  "explanation": "string",
  "issues": [{
    "type": "string",
    "severity": "warning|error",
    "sceneNumber": number,
    "relatedScenes": [number],
    "explanation": "string",
    "affectedEntity": "string"
  }],
  "relatedScenes": [number]
}

Check for:
1. Character age contradictions (stated age in dialogue vs. character profile)
2. Location naming inconsistencies (same place described with different names)
3. Timeline contradictions (events out of order, impossible timing)
4. Character state contradictions (knowledge, emotions, physical state)
5. Prop and object inconsistencies (labels, descriptions)

CHARACTER PROFILES:
${formatCharacters(characters)}

PREVIOUS SCENES:
${formatPreviousScenes(previousScenes)}

CURRENT SCENE:
${formatScene(scene)}`

  try {
    const result = await callGemini(prompt)
    return { ...result, mode: 'ai' }
  } catch (err) {
    console.warn('StoryRoom AI: checkContinuity API failed, falling back to demo.', err.message)
    const template = DEMO_CONTINUITY[scene.id] || DEMO_CONTINUITY.default
    return { ...template, mode: 'demo_fallback' }
  }
}

// ---------------------------------------------------------------------------
// 3. proposeRewrite
// ---------------------------------------------------------------------------

export async function proposeRewrite(scene, instruction, directorMemory, storyContext) {
  if (!scene) throw new Error('proposeRewrite: scene is required.')

  const {
    characters = [],
    scenes = [],
    title = '',
    tone = '',
    directorIntent = '',
  } = storyContext || {}

  const previousScenes = scenes.filter((s) => s.number < scene.number).slice(-4)

  // Demo mode
  if (!hasApiKey()) {
    const demoKey = getDemoRewriteKey(scene, instruction)
    const template = DEMO_REWRITES[demoKey]

    let proposedText = template.proposedText
    if (!proposedText) {
      const { text } = deterministicRewrite(scene, instruction)
      proposedText = text
    }

    return {
      sceneId: scene.id,
      sceneNumber: scene.number,
      sceneTitle: scene.title,
      originalText: scene.screenplay,
      proposedText,
      reasoningSummary: template.reasoningSummary,
      continuityConsiderations: template.continuityConsiderations,
      directorIntentAlignment: template.directorIntentAlignment,
      potentialRisks: template.potentialRisks,
      instruction: instruction || 'Apply creative refinement.',
      mode: 'demo',
    }
  }

  // Real AI
  const charContext = characters
    .filter((c) => (scene.characters || []).includes(c.id) || (scene.screenplay || '').toUpperCase().includes(c.name.toUpperCase().split(' ')[0]))
    .slice(0, 3)

  const prompt = `You are the AI creative assistant in StoryRoom. A director has given you a specific instruction to rewrite a screenplay scene.

CRITICAL CONSTRAINTS:
- DO NOT automatically apply this change. Return a PROPOSED revision for human approval.
- Preserve all established facts, character names, locations, and plot events.
- Do not invent new characters, props, or plot points.
- Apply the Director's Memory rules strictly.
- Never make the scene more melodramatic. Always choose restraint.

Return ONLY this JSON — no markdown, no preamble:
{
  "proposedText": "string — the complete revised screenplay scene text",
  "reasoningSummary": "string — 2-4 sentences explaining the changes made and why",
  "continuityConsiderations": ["string"],
  "directorIntentAlignment": ["string — how each change serves a specific Director's Memory rule"],
  "potentialRisks": ["string — honest concerns about the proposed changes"]
}

PROJECT: ${title}
TONE: ${tone}
DIRECTOR'S INTENT: ${directorIntent}

DIRECTOR'S MEMORY (rules to follow):
${formatDirectorsMemory(directorMemory)}

RELEVANT CHARACTERS IN THIS SCENE:
${formatCharacters(charContext)}

PREVIOUS SCENES (for continuity):
${formatPreviousScenes(previousScenes)}

CURRENT SCENE (full text):
${formatScene(scene)}

DIRECTOR'S REWRITE INSTRUCTION: "${instruction}"

Propose a revision that honors the instruction while respecting all Director's Memory rules and character continuity.`

  try {
    const result = await callGemini(prompt)
    return {
      sceneId: scene.id,
      sceneNumber: scene.number,
      sceneTitle: scene.title,
      originalText: scene.screenplay,
      instruction: instruction || '',
      ...result,
      mode: 'ai',
    }
  } catch (err) {
    console.warn('StoryRoom AI: proposeRewrite API failed, falling back to demo.', err.message)
    const demoKey = getDemoRewriteKey(scene, instruction)
    const template = DEMO_REWRITES[demoKey]
    const { text } = deterministicRewrite(scene, instruction)

    return {
      sceneId: scene.id,
      sceneNumber: scene.number,
      sceneTitle: scene.title,
      originalText: scene.screenplay,
      proposedText: template.proposedText || text,
      reasoningSummary: template.reasoningSummary,
      continuityConsiderations: template.continuityConsiderations,
      directorIntentAlignment: template.directorIntentAlignment,
      potentialRisks: template.potentialRisks,
      instruction: instruction || '',
      mode: 'demo_fallback',
    }
  }
}

// ---------------------------------------------------------------------------
// Utility: check if API is available (for UI status)
// ---------------------------------------------------------------------------

export function getAIStatus() {
  return {
    hasKey: hasApiKey(),
    model: activeModel,
    mode: hasApiKey() ? 'ai' : 'demo',
    label: hasApiKey() ? `Gemini ${activeModel}` : 'Demo Intelligence',
  }
}
