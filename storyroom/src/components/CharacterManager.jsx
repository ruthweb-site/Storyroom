import React, { useState, useMemo } from 'react'
import {
  Users,
  User,
  Plus,
  Trash2,
  Edit3,
  Check,
  Clapperboard,
  Sparkles,
  HeartHandshake,
  TrendingUp,
  Brain,
  Search,
  MapPin,
  Clock
} from 'lucide-react'
import { useProject } from '../store/ProjectStore.jsx'

export default function CharacterManager({ onSelectScene }) {
  const { project, dispatch } = useProject()
  const [selectedId, setSelectedId] = useState(project.characters[0]?.id || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(null)

  const selectedCharacter = useMemo(() => {
    return project.characters.find((c) => c.id === selectedId) || project.characters[0] || null
  }, [project.characters, selectedId])

  // Get scenes featuring this character
  const scenesForCharacter = useMemo(() => {
    if (!selectedCharacter) return []
    return project.scenes.filter((s) => {
      const byId = Array.isArray(s.characters) && s.characters.includes(selectedCharacter.id)
      const byName =
        s.screenplay &&
        s.screenplay.toUpperCase().includes(selectedCharacter.name.toUpperCase().split(' ')[0])
      return byId || byName
    })
  }, [project.scenes, selectedCharacter])

  const filteredCharacters = useMemo(() => {
    if (!searchQuery.trim()) return project.characters
    const q = searchQuery.toLowerCase()
    return project.characters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    )
  }, [project.characters, searchQuery])

  function handleSelect(char) {
    setSelectedId(char.id)
    setIsEditing(false)
    setEditForm(null)
  }

  function startEditing() {
    if (!selectedCharacter) return
    setEditForm({ ...selectedCharacter })
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
    setEditForm(null)
  }

  function saveChanges() {
    if (!editForm || !selectedCharacter) return
    dispatch({
      type: 'UPDATE_CHARACTER',
      payload: {
        characterId: selectedCharacter.id,
        patch: {
          name: editForm.name,
          age: parseInt(editForm.age, 10) || selectedCharacter.age,
          role: editForm.role,
          description: editForm.description,
          personality: editForm.personality,
          relationships: editForm.relationships,
          emotionalArc: editForm.emotionalArc,
        },
      },
    })
    setIsEditing(false)
  }

  function handleAddCharacter() {
    const newId = `char-${Date.now().toString(36)}`
    const newChar = {
      id: newId,
      name: 'NEW CHARACTER',
      age: 28,
      role: 'Supporting Role',
      description: 'Brief description of background and visual demeanor.',
      personality: 'Key psychological traits and vocal cadence.',
      relationships: 'Connection to primary characters.',
      emotionalArc: 'How this character changes across the story.',
    }
    dispatch({
      type: 'ADD_CHARACTER',
      payload: newChar,
    })
    setSelectedId(newId)
    setEditForm(newChar)
    setIsEditing(true)
  }

  function handleDeleteCharacter(characterId) {
    if (project.characters.length <= 1) {
      alert('You must keep at least one character in the project.')
      return
    }
    if (confirm(`Remove character "${selectedCharacter?.name}" from project?`)) {
      dispatch({
        type: 'DELETE_CHARACTER',
        payload: { characterId },
      })
      const remaining = project.characters.filter((c) => c.id !== characterId)
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id)
      }
      setIsEditing(false)
    }
  }

  function getInitials(name) {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <div className="h-full flex flex-col min-h-0 bg-studio-950">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-studio-800 bg-studio-900/50 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-brass-500" />
            <h1 className="text-sm font-semibold tracking-wider text-studio-100 uppercase">
              Character Browser
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-studio-800 text-brass-400 border border-studio-700">
              {project.characters.length} Profiles
            </span>
          </div>
          <p className="text-xs text-studio-400 mt-0.5">
            Cast roster, psychological profiles, relationships, and scene distribution.
          </p>
        </div>

        <button
          onClick={handleAddCharacter}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brass-500/10 text-brass-400 hover:bg-brass-500/20 border border-brass-500/30 rounded-md transition-all shadow-sm"
        >
          <Plus size={14} />
          <span>New Character</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-[300px,1fr]">
        {/* Left Character List */}
        <div className="border-r border-studio-800 flex flex-col min-h-0 bg-studio-900/30">
          {/* Search bar */}
          <div className="p-3 border-b border-studio-800">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-studio-500"
              />
              <input
                type="text"
                placeholder="Search characters or roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-studio-900 border border-studio-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-studio-200 placeholder-studio-500 focus:outline-none focus:border-brass-500/60 transition-colors"
              />
            </div>
          </div>

          {/* Character Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredCharacters.map((char) => {
              const isSelected = selectedCharacter?.id === char.id
              const scenesCount = project.scenes.filter(
                (s) =>
                  (Array.isArray(s.characters) && s.characters.includes(char.id)) ||
                  (s.screenplay &&
                    s.screenplay.toUpperCase().includes(char.name.toUpperCase().split(' ')[0]))
              ).length

              return (
                <div
                  key={char.id}
                  onClick={() => handleSelect(char)}
                  className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-studio-900/90 border-brass-500/60 shadow-md shadow-black/40'
                      : 'bg-studio-900/30 border-studio-800/80 hover:bg-studio-900/60 hover:border-studio-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar Badge */}
                    <div
                      className={`w-10 h-10 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-gradient-to-br from-brass-500/30 to-brass-600/10 text-brass-300 border border-brass-500/40'
                          : 'bg-studio-800 text-studio-400 border border-studio-700'
                      }`}
                    >
                      {getInitials(char.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h3
                          className={`text-sm font-semibold truncate ${
                            isSelected ? 'text-brass-300' : 'text-studio-200 group-hover:text-white'
                          }`}
                        >
                          {char.name}
                        </h3>
                        <span className="text-[10px] font-mono text-studio-400 shrink-0 bg-studio-800 px-1.5 py-0.5 rounded border border-studio-700/60">
                          Age {char.age}
                        </span>
                      </div>

                      <p className="text-[11px] text-studio-400 truncate mb-1.5">{char.role}</p>

                      <div className="flex items-center gap-2 text-[10px] text-studio-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Clapperboard size={11} className="text-studio-500" />
                          {scenesCount} scene{scenesCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredCharacters.length === 0 && (
              <div className="text-center py-8 text-studio-500 text-xs">
                No characters found matching "{searchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-studio-950 flex flex-col">
          {selectedCharacter ? (
            <div className="p-6 max-w-4xl w-full mx-auto space-y-6">
              {/* Dossier Header */}
              <div className="border border-studio-800 rounded-xl p-5 bg-gradient-to-b from-studio-900/80 to-studio-900/30 backdrop-blur-sm shadow-sm relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-brass-500/20 to-brass-600/5 text-brass-400 border border-brass-500/30 flex items-center justify-center font-mono font-bold text-lg shadow-inner">
                      {getInitials(isEditing ? editForm?.name : selectedCharacter.name)}
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm?.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="bg-studio-900 border border-brass-500/60 rounded px-2.5 py-1 text-lg font-bold text-studio-100 focus:outline-none"
                        />
                      ) : (
                        <h2 className="text-xl font-bold text-studio-100 tracking-wide">
                          {selectedCharacter.name}
                        </h2>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Role"
                              value={editForm?.role || ''}
                              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                              className="bg-studio-900 border border-studio-700 rounded px-2 py-0.5 text-xs text-studio-200"
                            />
                            <div className="flex items-center gap-1 text-xs text-studio-400">
                              <span>Age:</span>
                              <input
                                type="number"
                                value={editForm?.age || ''}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, age: e.target.value })
                                }
                                className="w-16 bg-studio-900 border border-studio-700 rounded px-2 py-0.5 text-xs text-studio-200"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-brass-500/10 text-brass-400 border border-brass-500/30">
                              {selectedCharacter.role}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-mono bg-studio-800 text-studio-300 border border-studio-700">
                              Age: {selectedCharacter.age}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-mono bg-studio-800 text-studio-400 border border-studio-700">
                              ID: {selectedCharacter.id}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveChanges}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-brass-500 text-studio-950 hover:bg-brass-400 rounded-md transition-colors font-semibold shadow-sm"
                        >
                          <Check size={13} />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1.5 text-xs font-medium bg-studio-800 text-studio-300 hover:bg-studio-700 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={startEditing}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-studio-800 text-studio-200 hover:bg-studio-700 hover:text-white border border-studio-700 rounded-md transition-colors"
                        >
                          <Edit3 size={13} />
                          Edit Profile
                        </button>
                        <button
                          onClick={() => handleDeleteCharacter(selectedCharacter.id)}
                          title="Delete Character"
                          className="p-1.5 text-studio-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Dossier Attributes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Description */}
                <div className="border border-studio-800 rounded-lg p-4 bg-studio-900/40">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-brass-400" />
                    <h3 className="text-xs font-semibold tracking-wider text-studio-200 uppercase">
                      Description & Demeanor
                    </h3>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editForm?.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full bg-studio-900 border border-studio-700 rounded p-2 text-xs text-studio-200 focus:outline-none focus:border-brass-500/60 leading-relaxed resize-none"
                    />
                  ) : (
                    <p className="text-xs text-studio-300 leading-relaxed">
                      {selectedCharacter.description || (
                        <span className="italic text-studio-500">No description provided.</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Personality */}
                <div className="border border-studio-800 rounded-lg p-4 bg-studio-900/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={14} className="text-brass-400" />
                    <h3 className="text-xs font-semibold tracking-wider text-studio-200 uppercase">
                      Personality & Psychology
                    </h3>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editForm?.personality || ''}
                      onChange={(e) => setEditForm({ ...editForm, personality: e.target.value })}
                      rows={3}
                      className="w-full bg-studio-900 border border-studio-700 rounded p-2 text-xs text-studio-200 focus:outline-none focus:border-brass-500/60 leading-relaxed resize-none"
                    />
                  ) : (
                    <p className="text-xs text-studio-300 leading-relaxed">
                      {selectedCharacter.personality || (
                        <span className="italic text-studio-500">No personality notes.</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Relationships */}
                <div className="border border-studio-800 rounded-lg p-4 bg-studio-900/40">
                  <div className="flex items-center gap-2 mb-2">
                    <HeartHandshake size={14} className="text-brass-400" />
                    <h3 className="text-xs font-semibold tracking-wider text-studio-200 uppercase">
                      Relationships & Dynamics
                    </h3>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editForm?.relationships || ''}
                      onChange={(e) =>
                        setEditForm({ ...editForm, relationships: e.target.value })
                      }
                      rows={3}
                      className="w-full bg-studio-900 border border-studio-700 rounded p-2 text-xs text-studio-200 focus:outline-none focus:border-brass-500/60 leading-relaxed resize-none"
                    />
                  ) : (
                    <p className="text-xs text-studio-300 leading-relaxed">
                      {selectedCharacter.relationships || (
                        <span className="italic text-studio-500">No relationship notes.</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Emotional Arc */}
                <div className="border border-studio-800 rounded-lg p-4 bg-studio-900/40">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-brass-400" />
                    <h3 className="text-xs font-semibold tracking-wider text-studio-200 uppercase">
                      Emotional Arc & Trajectory
                    </h3>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editForm?.emotionalArc || ''}
                      onChange={(e) => setEditForm({ ...editForm, emotionalArc: e.target.value })}
                      rows={3}
                      className="w-full bg-studio-900 border border-studio-700 rounded p-2 text-xs text-studio-200 focus:outline-none focus:border-brass-500/60 leading-relaxed resize-none"
                    />
                  ) : (
                    <p className="text-xs text-studio-300 leading-relaxed">
                      {selectedCharacter.emotionalArc || (
                        <span className="italic text-studio-500">No emotional arc defined.</span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Scenes Appearing In */}
              <div className="border border-studio-800 rounded-xl p-5 bg-studio-900/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clapperboard size={15} className="text-brass-400" />
                    <h3 className="text-xs font-semibold tracking-wider text-studio-200 uppercase">
                      Scenes Appearing In ({scenesForCharacter.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-studio-500 font-mono">
                    {scenesForCharacter.length} of {project.scenes.length} Scenes
                  </span>
                </div>

                {scenesForCharacter.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {scenesForCharacter.map((scene) => (
                      <div
                        key={scene.id}
                        onClick={() => onSelectScene && onSelectScene(scene.id)}
                        className={`p-3 rounded-lg border border-studio-800 bg-studio-900/50 hover:bg-studio-900/90 hover:border-brass-500/40 transition-all ${
                          onSelectScene ? 'cursor-pointer' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-brass-400 bg-brass-500/10 px-1.5 py-0.5 rounded border border-brass-500/20">
                              Scene {String(scene.number).padStart(2, '0')}
                            </span>
                            <h4 className="text-xs font-medium text-studio-200 truncate max-w-[130px]">
                              {scene.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] font-mono text-studio-500">
                            <Clock size={10} />
                            <span>{scene.timeOfDay}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-studio-400 mb-2">
                          <MapPin size={11} className="text-studio-500 shrink-0" />
                          <span className="truncate">{scene.location}</span>
                        </div>

                        <p className="text-[11px] text-studio-400 line-clamp-2 leading-relaxed bg-studio-950/60 p-2 rounded border border-studio-800/60">
                          {scene.summary || scene.emotionalGoal}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed border-studio-800 rounded-lg">
                    <p className="text-xs text-studio-500">
                      This character does not currently appear in any scenes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-studio-500 text-xs">
              Select a character from the browser to inspect their profile.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
