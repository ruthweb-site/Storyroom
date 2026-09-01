import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Bot,
  UserCheck,
  X,
  ExternalLink,
  ChevronRight,
  Terminal,
  ShieldAlert,
  Check,
  XCircle,
} from 'lucide-react'
import { useWebMCP } from '../webmcp/WebMCPProvider.jsx'
import { useProject } from '../store/ProjectStore.jsx'

export const DEMO_STEPS = [
  {
    step: 1,
    title: 'Retrieve Story Context',
    agentPrompt: 'Retrieve story context.',
    tool: 'get_story_context',
    toolInput: {},
    uiLabel: '✓ Story context retrieved',
    actionText: 'Retrieved project context',
    resultStatus: 'SUCCESS',
    actor: 'agent',
    description: "Agent grounds itself in the project logline, genre, and 8 Director's Memory rules.",
  },
  {
    step: 2,
    title: 'Retrieve Scene 7',
    agentPrompt: 'Retrieve Scene 7.',
    tool: 'get_current_scene',
    toolInput: { sceneId: 'scene-7' },
    uiLabel: '✓ Scene 7 retrieved',
    actionText: 'Retrieved Scene 7',
    resultStatus: 'SUCCESS',
    actor: 'agent',
    description: 'Agent loads Scene 07 ("Take Seven, Played / The Mirror") screenplay text and metadata.',
  },
  {
    step: 3,
    title: "Check Riya's Emotional State",
    agentPrompt: "Check Riya's previous emotional state.",
    tool: 'get_character',
    toolInput: { name: 'Riya' },
    uiLabel: '✓ Riya profile retrieved',
    actionText: "Retrieved Riya's character profile",
    resultStatus: 'SUCCESS',
    actor: 'agent',
    description: "Agent reviews Riya's emotional arc: restrained grief and obsessive investigation.",
  },
  {
    step: 4,
    title: 'Check Scene 7 Continuity',
    agentPrompt: 'Check Scene 7 for continuity.',
    tool: 'check_continuity',
    toolInput: { sceneId: 'scene-7' },
    uiLabel: '✓ Continuity checked\n⚠ 1 potential issue found',
    actionText: 'Checked continuity',
    resultStatus: 'WARNING',
    actor: 'agent',
    description: 'Agent checks timeline and props — flags reel label and telecine environment.',
  },
  {
    step: 5,
    title: 'Analyze Scene 7 Against Memory',
    agentPrompt: 'Analyze Scene 7.',
    tool: 'analyze_scene',
    toolInput: { sceneId: 'scene-7' },
    uiLabel: '✓ Scene analyzed',
    actionText: 'Analyzed Scene 7 against Director\'s Memory',
    resultStatus: 'SUCCESS',
    actor: 'agent',
    description: 'Agent evaluates pacing and dialogue against Director\'s Memory ("Silence carries emotion").',
  },
  {
    step: 6,
    title: 'Propose Restrained Rewrite',
    agentPrompt: 'Make the scene more tense while respecting the director\'s style.',
    tool: 'propose_rewrite',
    toolInput: {
      sceneId: 'scene-7',
      instruction: 'Make the scene more tense while respecting the director\'s style.',
    },
    uiLabel: '✓ Revision proposed',
    actionText: 'Generated revision proposal',
    resultStatus: 'WAITING FOR DIRECTOR',
    actor: 'agent',
    description: 'Agent creates a pending proposal in Revision Review — does NOT overwrite screenplay!',
  },
  {
    step: 7,
    title: 'Show Revision Review',
    agentPrompt: 'DIRECTOR REVIEW REQUIRED: Review the proposed revision before the agent can continue.',
    tool: null,
    uiLabel: 'DIRECTOR REVIEW REQUIRED\nReview the proposed revision before the agent can continue.',
    actionText: 'Opened Revision Review for human decision',
    resultStatus: 'WAITING FOR DIRECTOR',
    actor: 'human_review',
    description: 'Automatic progression paused. The director must accept or reject the proposal before the agent can continue.',
  },
  {
    step: 8,
    title: 'Director Decision',
    agentPrompt: 'Director approved revision.',
    tool: null,
    uiLabel: '✓ Director approved revision\nStaged for commit',
    actionText: 'Director approved revision',
    resultStatus: 'SUCCESS',
    actor: 'human_decision',
    description: 'Human exercises sole editorial control: "The Agent Proposes. The Human Decides."',
  },
  {
    step: 9,
    title: 'Apply Revision',
    agentPrompt: 'Applying director-approved revision to screenplay.',
    tool: 'apply_revision',
    toolInput: {}, // Populated dynamically with revisionId
    uiLabel: '✓ Scene updated\n✓ Revision saved\n✓ Director approved change',
    actionText: 'Revision applied to screenplay',
    resultStatus: 'SUCCESS',
    actor: 'system',
    description: 'Screenplay text updated, version 3 logged to history, and activity recorded.',
  },
]

export default function HackathonDemoHUD({
  isOpen,
  onClose,
  onSelectScene,
  onOpenRevisions,
}) {
  const registry = useWebMCP()
  const { project, dispatch } = useProject()

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [stepOutput, setStepOutput] = useState(null)
  const [createdRevisionId, setCreatedRevisionId] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isRejected, setIsRejected] = useState(false)

  const autoPlayTimerRef = useRef(null)

  const currentStep = DEMO_STEPS[currentStepIndex] || DEMO_STEPS[0]
  const isStep7 = currentStepIndex === 6 // 0-indexed Step 7

  // Initialize demo on open: navigate to Scene 7
  useEffect(() => {
    if (isOpen) {
      if (onSelectScene) onSelectScene('scene-7')
      setCurrentStepIndex(0)
      setIsCompleted(false)
      setIsRejected(false)
      setIsAutoPlay(true)
      setStepOutput(null)
    }
  }, [isOpen])

  // Execute a specific demo step
  async function executeStep(index) {
    if (index >= DEMO_STEPS.length) {
      setIsCompleted(true)
      setIsRunning(false)
      return
    }

    const stepObj = DEMO_STEPS[index]
    setIsRunning(true)
    setStepOutput(null)

    try {
      if (stepObj.step === 1) {
        if (onSelectScene) onSelectScene('scene-7')
        const res = await registry.callTool('get_story_context', {})
        setStepOutput(res)
      } else if (stepObj.step === 2) {
        const res = await registry.callTool('get_current_scene', { sceneId: 'scene-7' })
        setStepOutput(res)
      } else if (stepObj.step === 3) {
        const res = await registry.callTool('get_character', { name: 'Riya' })
        setStepOutput(res)
      } else if (stepObj.step === 4) {
        const res = await registry.callTool('check_continuity', { sceneId: 'scene-7' })
        setStepOutput(res)
      } else if (stepObj.step === 5) {
        const res = await registry.callTool('analyze_scene', { sceneId: 'scene-7' })
        setStepOutput(res)
      } else if (stepObj.step === 6) {
        const res = await registry.callTool('propose_rewrite', {
          sceneId: 'scene-7',
          instruction: stepObj.agentPrompt,
        })
        setStepOutput(res)
        if (res?.revisionId) {
          setCreatedRevisionId(res.revisionId)
        }
      } else if (stepObj.step === 7) {
        // Step 7: Stop auto-progression and display RevisionReview component
        setIsAutoPlay(false)
        if (onOpenRevisions) onOpenRevisions('revisions')
        setStepOutput({
          mode: 'human_review',
          title: 'DIRECTOR REVIEW REQUIRED',
          message: 'Review the proposed revision before the agent can continue.',
        })
        // STOP here! Do NOT advance automatically to step 8 or call apply_revision!
      } else if (stepObj.step === 8) {
        // Step 8: Human Decision (Explicit Human Approval)
        const revId =
          createdRevisionId ||
          project.revisions?.find((r) => r.sceneId === 'scene-7' && r.status === 'pending')?.id ||
          project.revisions?.[0]?.id

        if (revId && registry.approveRevision) {
          registry.approveRevision(revId)
        }
        setStepOutput({ mode: 'human_decision', message: 'Director approved revision. Staged for commit.' })
      } else if (stepObj.step === 9) {
        // Step 9: Apply Revision via WebMCP tool
        const revId =
          createdRevisionId ||
          project.revisions?.find((r) => r.sceneId === 'scene-7' && r.status === 'approved')?.id ||
          project.revisions?.find((r) => r.sceneId === 'scene-7')?.id ||
          project.revisions?.[0]?.id

        if (revId) {
          const res = await registry.callTool('apply_revision', {
            revisionId: revId,
          })
          setStepOutput(res)
        }
        setIsCompleted(true)
      }
    } catch (err) {
      console.warn('Demo step execution error:', err)
    } finally {
      setIsRunning(false)
    }
  }

  // --- ACCEPT FLOW ---
  async function handleAcceptRevision() {
    setIsRunning(true)
    setIsRejected(false)
    try {
      const revId =
        createdRevisionId ||
        project.revisions?.find((r) => r.sceneId === 'scene-7' && (r.status === 'pending' || r.status === 'approved'))?.id ||
        project.revisions?.[0]?.id

      // 1. Mark revision as approved in store and log "Director approved revision"
      if (revId && registry.approveRevision) {
        registry.approveRevision(revId)
      }

      // 2. Continue to Step 8 ("Director Decision")
      setCurrentStepIndex(7) // Step 8 (0-indexed 7)
      setStepOutput({
        mode: 'human_decision',
        status: 'approved',
        message: 'Director approved revision. Staged for commit.',
      })

      // Short delay for visual clarity so judges see Step 8 state
      await new Promise((resolve) => setTimeout(resolve, 1200))

      // 3. Continue to Step 9 ("Apply Revision")
      setCurrentStepIndex(8) // Step 9 (0-indexed 8)
      if (revId) {
        const res = await registry.callTool('apply_revision', { revisionId: revId })
        setStepOutput(res)
      }
      setIsCompleted(true)
    } catch (err) {
      console.error('Accept revision error:', err)
    } finally {
      setIsRunning(false)
    }
  }

  // --- REJECT FLOW ---
  function handleRejectRevision() {
    setIsRunning(true)
    try {
      const revId =
        createdRevisionId ||
        project.revisions?.find((r) => r.sceneId === 'scene-7' && r.status === 'pending')?.id ||
        project.revisions?.[0]?.id

      // 1. Mark revision as rejected in store and log "Director rejected revision"
      if (revId && registry.rejectRevision) {
        registry.rejectRevision(revId)
      }

      // 2. Stop the demo and show rejected state
      setIsRejected(true)
      setIsAutoPlay(false)
      setStepOutput({
        mode: 'rejected',
        status: 'rejected',
        message: 'Revision rejected. The screenplay remains unchanged.',
      })
    } catch (err) {
      console.error('Reject revision error:', err)
    } finally {
      setIsRunning(false)
    }
  }

  // Handle step progression
  function nextStep() {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1
      setCurrentStepIndex(nextIdx)
      executeStep(nextIdx)
    } else {
      setIsCompleted(true)
    }
  }

  function restartDemo() {
    setCurrentStepIndex(0)
    setIsCompleted(false)
    setIsRejected(false)
    setStepOutput(null)
    setIsAutoPlay(true)
    if (onSelectScene) onSelectScene('scene-7')
    executeStep(0)
  }

  // Auto-play timer effect: stops automatically at Step 7 (index 6)
  useEffect(() => {
    if (isOpen && isAutoPlay && !isRunning && !isCompleted && !isRejected) {
      // Step 7 MUST pause automatically and NOT advance!
      if (currentStepIndex === 6) {
        return
      }
      const delay = currentStepIndex === 5 ? 2400 : 2000
      autoPlayTimerRef.current = setTimeout(() => {
        nextStep()
      }, delay)
    }
    return () => clearTimeout(autoPlayTimerRef.current)
  }, [isOpen, isAutoPlay, isRunning, currentStepIndex, isCompleted, isRejected])

  // Synchronize with external human decisions inside the RevisionReview modal
  useEffect(() => {
    if (currentStepIndex === 6 && !isRejected && !isCompleted && !isRunning) {
      const targetRev = project.revisions?.find(
        (r) => (r.id === createdRevisionId || r.sceneId === 'scene-7')
      )
      if (targetRev?.status === 'rejected') {
        setIsRejected(true)
        setIsAutoPlay(false)
        setStepOutput({
          mode: 'rejected',
          status: 'rejected',
          message: 'Revision rejected. The screenplay remains unchanged.',
        })
      } else if (targetRev?.status === 'approved' || targetRev?.status === 'applied') {
        handleAcceptRevision()
      }
    }
  }, [project.revisions, currentStepIndex, isRejected, isCompleted, isRunning, createdRevisionId])

  if (!isOpen) return null

  return (
    <aside
      aria-label="Hackathon Agent Demo Mode Controller"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-4xl bg-studio-950/95 backdrop-blur-md border-2 border-brass-500/80 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn"
    >
      {/* Top Banner Header */}
      <div className="px-5 py-2.5 bg-gradient-to-r from-brass-950/80 via-studio-900 to-studio-950 border-b border-brass-500/40 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-brass-400 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brass-400">
            HACKATHON AGENT DEMO MODE
          </span>
          <span className="text-xs text-studio-500 hidden sm:inline">•</span>
          <span className="text-xs text-studio-300 font-mono hidden sm:inline">
            Agent Proposes → Human Decides → Application Changes
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isStep7 && !isRejected && !isCompleted && (
            <button
              onClick={() => setIsAutoPlay((v) => !v)}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isAutoPlay
                  ? 'bg-brass-500 text-studio-950'
                  : 'bg-studio-800 text-studio-300 hover:text-studio-100'
              }`}
            >
              {isAutoPlay ? <Pause size={12} /> : <Play size={12} />}
              <span>{isAutoPlay ? 'Auto-Advancing' : 'Manual'}</span>
            </button>
          )}

          {isStep7 && !isRejected && !isCompleted && (
            <span className="px-2.5 py-1 rounded text-xs font-bold bg-brass-500/20 text-brass-300 border border-brass-500/40 flex items-center gap-1.5 animate-pulse">
              <ShieldAlert size={13} className="text-brass-400" />
              <span>PAUSED — DIRECTOR REVIEW REQUIRED</span>
            </span>
          )}

          <button
            onClick={restartDemo}
            className="p-1 rounded text-studio-400 hover:text-studio-200 hover:bg-studio-800 transition-colors flex items-center gap-1 text-xs px-2"
            title="Restart Demo Scenario"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Restart</span>
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded text-studio-400 hover:text-rose-400 hover:bg-studio-800 transition-colors"
            title="Exit Demo Mode"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Progress Track (9 Steps) */}
      <div className="px-5 pt-3 pb-2 border-b border-studio-800/80 bg-studio-900/40">
        <div className="grid grid-cols-9 gap-1.5 mb-1.5">
          {DEMO_STEPS.map((s, idx) => {
            const isPast = idx < currentStepIndex
            const isCurrent = idx === currentStepIndex
            return (
              <div
                key={s.step}
                onClick={() => {
                  if (!isRunning) {
                    setCurrentStepIndex(idx)
                    executeStep(idx)
                  }
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  isRejected && isCurrent
                    ? 'bg-rose-500 ring-2 ring-rose-500/50'
                    : isPast
                    ? 'bg-emerald-500'
                    : isCurrent
                    ? 'bg-brass-400 ring-2 ring-brass-400/50 shadow-sm animate-pulse'
                    : 'bg-studio-800'
                }`}
                title={`Step ${s.step}: ${s.title}`}
              />
            )
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-studio-400">
          <span className="font-mono font-bold text-brass-400">
            STEP {currentStep.step} OF 9
          </span>
          <span className="font-medium text-studio-300 truncate max-w-md">
            {currentStep.title}
          </span>
        </div>
      </div>

      {/* Step Detail Card */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Col 1: Agent & Prompt */}
        <div className="space-y-1.5 md:border-r border-studio-800/80 md:pr-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-studio-400">
            <Bot size={14} className="text-brass-400" />
            <span>Agent Intention</span>
          </div>
          <p className="text-xs text-studio-100 font-serif italic leading-snug">
            "{currentStep.agentPrompt}"
          </p>
          <p className="text-[11px] text-studio-400 leading-tight">
            {currentStep.description}
          </p>
        </div>

        {/* Col 2: WebMCP Tool & Execution */}
        <div className="space-y-1.5 md:border-r border-studio-800/80 md:pr-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-studio-400">
            <Terminal size={13} className="text-brass-400" />
            <span>WebMCP Tool Invocation</span>
          </div>
          {currentStep.tool ? (
            <div className="inline-block px-2.5 py-1 rounded bg-studio-900 border border-studio-700 font-mono text-xs text-brass-300 font-semibold shadow-inner">
              {currentStep.tool}()
            </div>
          ) : (
            <div className="inline-block px-2.5 py-1 rounded bg-brass-950/60 border border-brass-600/40 font-mono text-xs text-brass-300 font-semibold">
              HUMAN DECISION CHECKPOINT
            </div>
          )}
          <div className="text-[11px] font-mono text-studio-400">
            Action: <span className="text-studio-200">{currentStep.actionText}</span>
          </div>
        </div>

        {/* Col 3: UI Feedback & Controls */}
        <div className="space-y-3">
          {/* Rejection State */}
          {isRejected ? (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                <XCircle size={15} className="text-rose-400 shrink-0" />
                <span>REVISION REJECTED</span>
              </div>
              <p className="text-xs text-rose-200 leading-snug">
                Revision rejected. The screenplay remains unchanged.
              </p>
              <button
                onClick={restartDemo}
                className="w-full py-1.5 px-3 rounded bg-studio-800 hover:bg-studio-700 text-studio-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-studio-700"
              >
                <RotateCcw size={12} />
                <span>Run Demo Again</span>
              </button>
            </div>
          ) : isCompleted ? (
            /* Completion State */
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>FULL WORKFLOW COMPLETE!</span>
              </div>
              <p className="text-xs text-emerald-200/90 leading-snug">
                ✓ Scene updated<br />
                ✓ Revision saved<br />
                ✓ Director approved change
              </p>
              <button
                onClick={restartDemo}
                className="w-full py-1.5 px-3 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-emerald-600/40"
              >
                <RotateCcw size={12} />
                <span>Restart Demo</span>
              </button>
            </div>
          ) : isStep7 ? (
            /* Step 7: DIRECTOR REVIEW REQUIRED INTERACTIVE CONTROLS */
            <div className="p-3 rounded-lg bg-brass-950/70 border border-brass-500/60 space-y-2.5 animate-fadeIn">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-brass-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brass-400 animate-ping" />
                  DIRECTOR REVIEW REQUIRED
                </p>
                <p className="text-xs text-studio-200 font-medium mt-0.5 leading-snug">
                  Review the proposed revision before the agent can continue.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleRejectRevision}
                  disabled={isRunning}
                  className="flex-1 px-3 py-2 rounded-lg border border-rose-800/60 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold tracking-wide transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <X size={13} />
                  <span>REJECT</span>
                </button>

                <button
                  onClick={handleAcceptRevision}
                  disabled={isRunning}
                  className="flex-1 px-3 py-2 rounded-lg bg-brass-500 hover:bg-brass-400 text-studio-950 text-xs font-bold tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Check size={14} />
                  <span>ACCEPT REVISION</span>
                </button>
              </div>

              {onOpenRevisions && (
                <button
                  onClick={() => onOpenRevisions('revisions')}
                  className="w-full py-1 text-[11px] text-studio-400 hover:text-brass-300 transition-colors flex items-center justify-center gap-1"
                >
                  <span>Open Full Revision Review Card</span>
                  <ExternalLink size={11} />
                </button>
              )}
            </div>
          ) : (
            /* Regular Steps UI Feedback & Controls */
            <>
              <div className="p-2.5 rounded-lg bg-studio-900/90 border border-studio-800">
                <p className="text-[10px] uppercase tracking-widest text-studio-500 font-bold mb-1">
                  UI STATE REFLECTION
                </p>
                <div className="text-xs font-semibold whitespace-pre-line text-emerald-400 flex items-start gap-1.5">
                  <span>{currentStep.uiLabel}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={nextStep}
                  disabled={isRunning}
                  className="flex-1 px-4 py-2 rounded-lg bg-brass-500 hover:bg-brass-400 text-studio-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <span>Next Step</span>
                  <ArrowRight size={14} />
                </button>

                {currentStep.step >= 6 && onOpenRevisions && (
                  <button
                    onClick={() => onOpenRevisions('revisions')}
                    className="px-3 py-2 rounded-lg border border-studio-700 hover:border-brass-500 text-studio-300 hover:text-brass-300 text-xs font-medium transition-colors"
                    title="Open Revision Review"
                  >
                    View Card
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

