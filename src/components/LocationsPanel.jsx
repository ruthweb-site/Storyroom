import React, { useState } from 'react'
import {
  MapPin,
  Coffee,
  Home,
  Building,
  Film,
  TrainTrack,
  Plus,
  Trash2,
  Edit3,
  Check,
  Clapperboard,
  Clock,
  Users
} from 'lucide-react'
import { useProject } from '../store/ProjectStore.jsx'

function getLocationIcon(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('cafe') || n.includes('coffee') || n.includes('bar') || n.includes('restaurant')) {
    return Coffee
  }
  if (n.includes('apartment') || n.includes('house') || n.includes('home') || n.includes('flat')) {
    return Home
  }
  if (n.includes('studio') || n.includes('set') || n.includes('cinema') || n.includes('stage')) {
    return Film
  }
  if (n.includes('station') || n.includes('rail') || n.includes('train') || n.includes('track')) {
    return TrainTrack
  }
  return Building
}

export default function LocationsPanel({ onSelectScene }) {
  const { project, dispatch } = useProject()
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  // Map scenes to a location by matching location name
  function getScenesForLocation(loc) {
    if (!loc || !loc.name) return []
    const target = loc.name.toLowerCase().trim()
    return project.scenes.filter((s) => {
      if (!s.location) return false
      const sceneLoc = s.location.toLowerCase().trim()
      return (
        sceneLoc === target ||
        sceneLoc.includes(target) ||
        target.includes(sceneLoc)
      )
    })
  }

  function startEdit(loc) {
    setEditingId(loc.id)
    setEditName(loc.name)
    setEditDesc(loc.description || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditDesc('')
  }

  function saveEdit(locId) {
    if (!editName.trim()) return
    dispatch({
      type: 'UPDATE_LOCATION',
      payload: {
        locationId: locId,
        patch: {
          name: editName.trim(),
          description: editDesc.trim(),
        },
      },
    })
    setEditingId(null)
  }

  function handleDeleteLocation(locId, locName) {
    if (project.locations.length <= 1) {
      alert('You must keep at least one location in the project.')
      return
    }
    if (confirm(`Remove location "${locName}"?`)) {
      dispatch({
        type: 'DELETE_LOCATION',
        payload: { locationId: locId },
      })
    }
  }

  function handleCreateLocation(e) {
    e.preventDefault()
    if (!newName.trim()) return
    const newLoc = {
      id: `loc-${Date.now().toString(36)}`,
      name: newName.trim(),
      description: newDesc.trim() || 'Visual tone and physical environment description.',
    }
    dispatch({
      type: 'ADD_LOCATION',
      payload: newLoc,
    })
    setNewName('')
    setNewDesc('')
    setIsAdding(false)
  }

  return (
    <div className="h-full flex flex-col min-h-0 bg-studio-950">
      {/* Header */}
      <div className="px-6 py-4 border-b border-studio-800 bg-studio-900/50 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-brass-500" />
            <h1 className="text-sm font-semibold tracking-wider text-studio-100 uppercase">
              Locations & Settings
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-studio-800 text-brass-400 border border-studio-700">
              {project.locations.length} Locations
            </span>
          </div>
          <p className="text-xs text-studio-400 mt-0.5">
            Every place visited across the screenplay and the specific scenes set in each environment.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brass-500/10 text-brass-400 hover:bg-brass-500/20 border border-brass-500/30 rounded-md transition-all shadow-sm"
        >
          <Plus size={14} />
          <span>Add Location</span>
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl w-full mx-auto">
        {/* Add Location Form (Expandable) */}
        {isAdding && (
          <form
            onSubmit={handleCreateLocation}
            className="p-4 border border-brass-500/40 rounded-xl bg-studio-900/80 space-y-3 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brass-300 flex items-center gap-1.5">
                <Plus size={13} />
                New Production Location
              </h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-studio-500 hover:text-studio-300"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-studio-400 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Central Rooftop"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-studio-950 border border-studio-700 rounded-md px-3 py-1.5 text-xs text-studio-200 focus:outline-none focus:border-brass-500/60"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-studio-400 mb-1">
                  Environmental Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rainy overlook with exposed neon signs..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-studio-950 border border-studio-700 rounded-md px-3 py-1.5 text-xs text-studio-200 focus:outline-none focus:border-brass-500/60"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium bg-brass-500 text-studio-950 hover:bg-brass-400 rounded-md transition-colors font-semibold"
              >
                Save Location
              </button>
            </div>
          </form>
        )}

        {/* Location Cards Grid */}
        <div className="space-y-4">
          {project.locations.map((loc) => {
            const IconComponent = getLocationIcon(loc.name)
            const scenesUsingLoc = getScenesForLocation(loc)
            const isEditingThis = editingId === loc.id

            return (
              <div
                key={loc.id}
                className="border border-studio-800 rounded-xl p-5 bg-gradient-to-b from-studio-900/60 to-studio-900/20 backdrop-blur-sm shadow-sm hover:border-studio-700/80 transition-all"
              >
                {/* Location Header */}
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-studio-800/80">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-brass-500/10 border border-brass-500/20 text-brass-400 flex items-center justify-center shrink-0">
                      <IconComponent size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {isEditingThis ? (
                        <div className="space-y-2 max-w-lg">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-studio-900 border border-brass-500/60 rounded px-2.5 py-1 text-sm font-semibold text-studio-100 w-full focus:outline-none"
                          />
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            rows={2}
                            className="bg-studio-900 border border-studio-700 rounded px-2.5 py-1 text-xs text-studio-300 w-full focus:outline-none focus:border-brass-500/60 resize-none"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h2 className="text-base font-semibold text-studio-100 tracking-wide">
                              {loc.name}
                            </h2>
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-studio-800 text-brass-400 border border-studio-700">
                              {scenesUsingLoc.length} Scene
                              {scenesUsingLoc.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-xs text-studio-400 mt-1 leading-relaxed">
                            {loc.description || (
                              <span className="italic text-studio-500">
                                No environment notes provided.
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isEditingThis ? (
                      <>
                        <button
                          onClick={() => saveEdit(loc.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-brass-500 text-studio-950 hover:bg-brass-400 rounded transition-colors"
                        >
                          <Check size={12} />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2.5 py-1 text-xs bg-studio-800 text-studio-300 hover:bg-studio-700 rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(loc)}
                          title="Edit Location"
                          className="p-1.5 text-studio-400 hover:text-studio-200 hover:bg-studio-800 rounded transition-colors"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(loc.id, loc.name)}
                          title="Delete Location"
                          className="p-1.5 text-studio-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Scenes Using This Location */}
                <div className="pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-mono tracking-wider uppercase text-studio-500 flex items-center gap-1.5">
                      <Clapperboard size={12} className="text-studio-500" />
                      Scenes set at this location ({scenesUsingLoc.length})
                    </p>
                  </div>

                  {scenesUsingLoc.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {scenesUsingLoc.map((scene) => (
                        <div
                          key={scene.id}
                          onClick={() => onSelectScene && onSelectScene(scene.id)}
                          className={`p-2.5 rounded-lg border border-studio-800/80 bg-studio-950/60 hover:bg-studio-900 hover:border-brass-500/30 transition-all ${
                            onSelectScene ? 'cursor-pointer' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[11px] font-bold text-brass-400">
                              Scene {String(scene.number).padStart(2, '0')}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[10px] text-studio-500">
                              <Clock size={10} />
                              {scene.timeOfDay}
                            </span>
                          </div>
                          <h4 className="text-xs font-medium text-studio-200 truncate mb-1">
                            {scene.title}
                          </h4>
                          <p className="text-[11px] text-studio-400 line-clamp-2 leading-relaxed">
                            {scene.summary || scene.emotionalGoal}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-2.5 rounded-lg border border-dashed border-studio-800 text-center">
                      <p className="text-[11px] text-studio-500">
                        No scenes currently take place at {loc.name}.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
