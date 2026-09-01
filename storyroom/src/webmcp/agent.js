// Agent orchestrator
//
// Plans tool executions across the live WebMCP registry.
// Every step invokes a real WebMCP tool against real state and logs to the activity timeline.

const SCENE_NUMBER_RE = /\bscene\s*#?\s*(\d{1,2})\b/i
const CHAR_NAME_RE = /\b(riya|arjun|kabir)\b/i

export async function runAgent(instruction, { registry }) {
  const steps = []
  const record = (label) => steps.push(label)

  const lower = instruction.toLowerCase()

  // 1. Always ground the agent in current story context.
  record('Loading story context…')
  const context = await registry.callTool('get_story_context', {})

  let targetScene = null
  let targetCharacter = null
  let searchResult = null
  let continuityResult = null
  let analysis = null
  let revision = null

  // Check if instruction is about a specific character
  const charMatch = lower.match(CHAR_NAME_RE)
  const isCharacterQuery = charMatch || /character|arc|profile|cast/i.test(lower)

  if (isCharacterQuery) {
    const charName = charMatch ? charMatch[1] : 'Riya'
    record(`Retrieving character profile for "${charName}"…`)
    try {
      targetCharacter = await registry.callTool('get_character', { name: charName })
    } catch (e) {
      console.warn('Character lookup fallback:', e)
    }

    if (/scenes?|appear/i.test(lower) || /find scenes/i.test(lower)) {
      record(`Searching screenplay for scenes featuring "${charName}"…`)
      searchResult = await registry.callTool('search_scenes', { query: charName })
    }
  }

  // Check if instruction mentions a scene number
  const numMatch = instruction.match(SCENE_NUMBER_RE)
  if (numMatch) {
    const n = parseInt(numMatch[1], 10)
    targetScene = context.scenes.find((s) => s.number === n)
  }

  // If asking to search scenes
  if (!targetScene && (/find|search|where|involve/i.test(lower) || searchResult)) {
    if (!searchResult) {
      const q = instruction.replace(/find|scenes?|involving|about|where|the/gi, '').trim()
      if (q) {
        record(`Searching screenplay for "${q}"…`)
        searchResult = await registry.callTool('search_scenes', { query: q })
      }
    }
    if (searchResult && searchResult.results.length > 0) {
      targetScene = context.scenes.find((s) => s.id === searchResult.results[0].id)
    }
  }

  const wantsContinuity = /continuity|consisten|contradict|problem|error|check/i.test(lower) && !/rewrite|tense|improve/i.test(lower)
  const wantsRewrite = /rewrite|tense|tension|revise|make|propose|improve|draft/i.test(lower)
  const wantsAnalysis = /analy[sz]e|review|assess|tone|restrain|memory/i.test(lower) || wantsRewrite

  // If a scene is targeted or needed for analysis/rewrite
  if (targetScene || wantsContinuity || wantsRewrite || wantsAnalysis) {
    if (!targetScene) {
      targetScene = context.scenes.find((s) => s.number === 4) || context.scenes[0]
      record(`No scene named explicitly — inspecting Scene ${targetScene.number}, "${targetScene.title}".`)
    }

    record(`Inspecting Scene ${targetScene.number}: "${targetScene.title}"…`)
    const fullScene = await registry.callTool('get_current_scene', { sceneId: targetScene.id })

    if (wantsContinuity) {
      record(`Checking continuity for Scene ${targetScene.number} and referenced assets…`)
      continuityResult = await registry.callTool('check_continuity', { sceneId: targetScene.id })
    }

    if (wantsAnalysis) {
      record("Analyzing dialogue and actions against Director's Memory…")
      analysis = await registry.callTool('analyze_scene', { sceneId: targetScene.id })
    }

    const hasActionableFindings = analysis?.findings?.some((f) => f.severity === 'suggestion')
    if (wantsRewrite || hasActionableFindings) {
      const reason = hasActionableFindings
        ? analysis.findings.find((f) => f.severity === 'suggestion').message
        : `Creative pass requested: "${instruction}"`

      record(`Generating screenplay revision proposal for Scene ${targetScene.number}…`)
      revision = await registry.callTool('propose_rewrite', {
        sceneId: targetScene.id,
        reason,
        directive: instruction,
      })
    }
  }

  return {
    context,
    scene: targetScene,
    character: targetCharacter,
    searchResult,
    continuityResult,
    analysis,
    revision,
    steps,
  }
}
