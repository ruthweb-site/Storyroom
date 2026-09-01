import React from 'react'
import { useProject } from '../store/ProjectStore.jsx'

function Row({ label, value }) {
  return (
    <div className="border border-studio-800 rounded-lg px-4 py-3.5 bg-studio-900/40">
      <p className="text-[11px] tracking-[0.14em] uppercase text-studio-500 mb-1.5">{label}</p>
      <p className="text-studio-200 text-sm leading-relaxed">{value}</p>
    </div>
  )
}

export default function StoryOverview() {
  const { project } = useProject()

  return (
    <div className="h-full overflow-y-auto px-5 py-5">
      <p className="text-[11px] tracking-[0.18em] uppercase text-studio-500 mb-1">Story</p>
      <h2 className="font-serif text-2xl text-studio-100 mb-1">{project.title}</h2>
      <p className="text-studio-500 text-sm mb-5">
        {project.genre} · {project.scenes.length} scenes · {project.characters.length} characters
      </p>

      <div className="space-y-3">
        <Row label="Logline" value={project.logline} />
        <Row label="Tone" value={project.tone} />
        <Row label="Director's intent" value={project.directorIntent} />
      </div>

      <div className="mt-6">
        <p className="text-[11px] tracking-[0.14em] uppercase text-studio-500 mb-2">Cast</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {project.characters.map((c) => (
            <div key={c.id} className="border border-studio-800 rounded-lg px-3.5 py-3 bg-studio-900/30">
              <p className="text-studio-200 text-sm font-medium">{c.name}</p>
              <p className="text-studio-500 text-xs mt-0.5">
                {c.role} · Age {c.age}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
