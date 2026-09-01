import React, { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useProject } from '../store/ProjectStore.jsx'
import ProjectNav from '../components/ProjectNav.jsx'
import StoryOverview from './StoryOverview.jsx'
import ScreenplayEditor from '../components/ScreenplayEditor.jsx'
import CharacterManager from '../components/CharacterManager.jsx'
import LocationsPanel from '../components/LocationsPanel.jsx'
import DirectorsMemory from '../components/DirectorsMemory.jsx'
import AgentPanel from '../components/AgentPanel.jsx'
import Modal from '../components/Modal.jsx'
import RevisionReview from '../components/RevisionReview.jsx'
import WebMCPToolRegistryPanel from '../components/WebMCPToolRegistryPanel.jsx'
import HackathonDemoHUD from '../components/HackathonDemoHUD.jsx'

export default function FilmStudio() {
  const { projectId } = useParams()
  const { project, projects = [], dispatch } = useProject()
  const [activeSection, setActiveSection] = useState('scenes')
  const [activeSceneId, setActiveSceneId] = useState(project?.scenes?.[0]?.id)
  const [revisionsOpen, setRevisionsOpen] = useState(false)
  const [revisionsTab, setRevisionsTab] = useState('revisions')
  const [toolsOpen, setToolsOpen] = useState(false)
  const [demoModeOpen, setDemoModeOpen] = useState(false)

  // Switch project if URL parameter specifies a different existing project
  React.useEffect(() => {
    if (projectId && projectId !== 'new' && project?.id !== projectId) {
      const match = projects.find((p) => p.id === projectId)
      if (match) {
        dispatch({ type: 'SELECT_PROJECT', payload: { projectId } })
      }
    }
  }, [projectId, project?.id, projects, dispatch])

  // Ensure active scene belongs to the current project
  React.useEffect(() => {
    if (project?.scenes?.length && (!activeSceneId || !project.scenes.some((s) => s.id === activeSceneId))) {
      setActiveSceneId(project.scenes[0].id)
    }
  }, [project, activeSceneId])

  React.useEffect(() => {
    function handleRunDemo() {
      setActiveSection('scenes')
      setActiveSceneId('scene-7')
      setDemoModeOpen(true)
    }
    window.addEventListener('storyroom:run-agent-demo', handleRunDemo)
    return () => window.removeEventListener('storyroom:run-agent-demo', handleRunDemo)
  }, [])

  if (!project) return <Navigate to="/dashboard" replace />

  const activeScene = project.scenes.find((s) => s.id === activeSceneId) || project.scenes[0]
  const pendingCount = (project.revisions || []).filter((r) => r.status === 'pending').length

  function selectScene(id) {
    setActiveSceneId(id)
    setActiveSection('scenes')
  }

  function openRevisions(tab = 'revisions') {
    setRevisionsTab(tab)
    setRevisionsOpen(true)
  }

  return (
    <div className="h-full flex flex-col min-h-0">

      {pendingCount > 0 && (
        <button
          onClick={() => openRevisions('revisions')}
          className="w-full px-5 py-1.5 bg-studio-900 border-b border-studio-800 text-xs text-studio-300 hover:bg-studio-800/60 transition-colors shrink-0 text-left flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brass-500 rec-dot" />
          {pendingCount} revision{pendingCount !== 1 ? 's' : ''} awaiting your review
          <span className="text-brass-400 ml-1">Review now →</span>
        </button>
      )}

      <div className="flex-1 min-h-0 grid grid-cols-[220px,1fr,340px]">
        <aside className="border-r border-studio-800 min-h-0 bg-studio-900/40 overflow-hidden">
          <ProjectNav
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            activeSceneId={activeScene?.id}
            onSelectScene={selectScene}
          />
        </aside>

        <section className="min-h-0 flex flex-col">
          {activeSection === 'story' && <StoryOverview />}
          {activeSection === 'scenes' && activeScene && (
            <ScreenplayEditor
              scene={activeScene}
              onNavigateToRevisions={(tab) => openRevisions(tab || 'revisions')}
            />
          )}
          {activeSection === 'characters' && <CharacterManager onSelectScene={selectScene} />}
          {activeSection === 'locations' && <LocationsPanel onSelectScene={selectScene} />}
          {activeSection === 'memory' && <DirectorsMemory />}
        </section>

        <aside className="border-l border-studio-800 min-h-0 bg-studio-900/40">
          <AgentPanel
            onRevisionProposed={(sceneId) => {
              setActiveSceneId(sceneId)
              openRevisions('revisions')
            }}
            onOpenToolRegistry={() => setToolsOpen(true)}
          />
        </aside>
      </div>

      {revisionsOpen && (
        <Modal
          title="Revision Review & History"
          subtitle="The Agent Proposes. The Human Decides."
          onClose={() => setRevisionsOpen(false)}
          wide
        >
          <RevisionReview initialTab={revisionsTab} />
        </Modal>
      )}

      {toolsOpen && (
        <Modal
          title="WebMCP Tool Registry"
          subtitle="Call any tool directly with your own input."
          onClose={() => setToolsOpen(false)}
          wide
        >
          <WebMCPToolRegistryPanel />
        </Modal>
      )}

      <HackathonDemoHUD
        isOpen={demoModeOpen}
        onClose={() => setDemoModeOpen(false)}
        onSelectScene={selectScene}
        onOpenRevisions={openRevisions}
      />
    </div>
  )
}
