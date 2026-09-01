import React from 'react'
import { BookOpen, Clapperboard, Users, MapPin, BrainCircuit, Plus } from 'lucide-react'
import { useProject } from '../store/ProjectStore.jsx'

const SECTIONS = [
  { id: 'story', label: 'Story', icon: BookOpen },
  { id: 'scenes', label: 'Scenes', icon: Clapperboard },
  { id: 'characters', label: 'Characters', icon: Users },
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'memory', label: "Director's Memory", icon: BrainCircuit },
]

export default function ProjectNav({ activeSection, onSelectSection, activeSceneId, onSelectScene }) {
  const { project, dispatch } = useProject()
  const pendingBySceneId = new Set(
    (project.revisions || []).filter((r) => r.status === 'pending').map((r) => r.sceneId)
  )

  return (
    <nav className="h-full overflow-y-auto py-2">
      <p className="px-3.5 pt-2 pb-1.5 text-[10px] tracking-[0.18em] uppercase text-studio-600">
        Project
      </p>
      <ul>
        {SECTIONS.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          return (
            <li key={section.id}>
              <button
                onClick={() => onSelectSection(section.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors border-l-2 ${
                  isActive
                    ? 'border-brass-500 bg-studio-800/70 text-studio-100'
                    : 'border-transparent text-studio-400 hover:text-studio-200 hover:bg-studio-900'
                }`}
              >
                <Icon size={15} strokeWidth={1.75} className={isActive ? 'text-brass-500' : 'text-studio-500'} />
                {section.label}
              </button>

              {section.id === 'scenes' && isActive && (
                <ul className="pb-1.5">
                  {project.scenes.map((scene) => {
                    const sceneActive = activeSceneId === scene.id
                    const hasPending = pendingBySceneId.has(scene.id)
                    return (
                      <li key={scene.id}>
                        <button
                          onClick={() => onSelectScene(scene.id)}
                          className={`w-full flex items-center gap-2 pl-9 pr-3.5 py-1.5 text-left transition-colors ${
                            sceneActive ? 'text-brass-400 bg-studio-900 font-semibold' : 'text-studio-500 hover:text-studio-300 hover:bg-studio-900/60'
                          }`}
                        >
                          <span className="font-mono text-[11px] shrink-0">{String(scene.number).padStart(2, '0')}</span>
                          <span className="text-xs truncate">{scene.title}</span>
                          {hasPending && <span className="w-1.5 h-1.5 rounded-full bg-brass-500 rec-dot shrink-0 ml-auto" />}
                        </button>
                      </li>
                    )
                  })}
                  <li className="pt-1 px-4 pl-9">
                    <button
                      onClick={() => {
                        const nextNum = (project.scenes?.length || 0) + 1
                        dispatch({
                          type: 'ADD_SCENE',
                          payload: {
                            title: `SCENE ${String(nextNum).padStart(2, '0')}`,
                            slug: `INT. LOCATION ${nextNum} - DAY`,
                          },
                        })
                        setTimeout(() => {
                          const latest = project.scenes[project.scenes.length - 1]
                          if (latest) onSelectScene(latest.id)
                        }, 50)
                      }}
                      className="w-full flex items-center gap-1.5 py-1 px-2 text-[11px] font-mono text-brass-400/80 hover:text-brass-300 hover:bg-studio-800/80 rounded border border-dashed border-studio-700 hover:border-brass-500/50 transition-colors"
                    >
                      <Plus size={12} />
                      <span>Add New Scene</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
