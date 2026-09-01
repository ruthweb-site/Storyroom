import React from 'react'
import { Activity, Clock, Terminal, CheckCircle2, AlertTriangle, Clock4, XCircle } from 'lucide-react'
import { useProject } from '../store/ProjectStore.jsx'

function formatTimestamp(isoString) {
  if (!isoString) return '10:42:18'
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return '10:42:18'
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  } catch {
    return '10:42:18'
  }
}

function getResultBadge(entry) {
  const status = (entry.result || entry.status || 'success').toLowerCase()

  if (status === 'waiting for director' || status === 'waiting_for_director' || status === 'pending' || entry.tool === 'propose_rewrite' && !entry.resolved) {
    return {
      label: 'WAITING FOR DIRECTOR',
      className: 'bg-brass-500/15 border-brass-500/40 text-brass-400 font-bold',
      dot: 'bg-brass-400',
    }
  }

  if (status === 'warning' || status === 'flagged') {
    return {
      label: 'WARNING',
      className: 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold',
      dot: 'bg-amber-400',
    }
  }

  if (status === 'error') {
    return {
      label: 'ERROR',
      className: 'bg-rose-500/15 border-rose-500/40 text-rose-400 font-bold',
      dot: 'bg-rose-400',
    }
  }

  return {
    label: 'SUCCESS',
    className: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold',
    dot: 'bg-emerald-400',
  }
}

export default function AgentActivityPanel() {
  const { project } = useProject()
  const activities = project.activity || []

  return (
    <div className="h-full flex flex-col min-h-0 bg-studio-950">
      {/* Activity Header */}
      <div className="px-4 py-3 border-b border-studio-800 bg-studio-900/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Activity size={14} className="text-brass-400" />
          <span className="text-[11px] tracking-[0.16em] uppercase font-semibold text-studio-300">
            Agent Activity Timeline
          </span>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-mono text-studio-400 bg-studio-800 rounded border border-studio-700/60">
          {activities.length} Events
        </span>
      </div>

      {/* Activity Timeline List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {activities.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-studio-800 rounded-lg">
            <p className="text-xs text-studio-500">
              No tool events logged yet. Click "Run Agent Demo" or execute an agent request to see the live WebMCP activity sequence.
            </p>
          </div>
        ) : (
          <div className="relative border-l border-studio-800/90 ml-3 space-y-4 pl-4">
            {activities.map((entry, idx) => {
              const badge = getResultBadge(entry)
              const timeStr = formatTimestamp(entry.timestamp)
              const actionText = entry.action || entry.outputSummary || entry.tool

              return (
                <div
                  key={entry.id || idx}
                  className="relative group bg-studio-900/40 border border-studio-800/60 rounded-lg p-2.5 transition-colors hover:border-studio-700/80"
                >
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[23px] top-3.5 w-2.5 h-2.5 rounded-full ${badge.dot} ring-4 ring-studio-950`}
                  />

                  {/* 1. Timestamp */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-studio-300 tracking-wider">
                      {timeStr}
                    </span>
                    {/* 4. Result Badge */}
                    <span
                      className={`text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded border uppercase ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* 2. Agent Action */}
                  <p className="text-xs text-studio-100 font-medium leading-snug mb-1.5">
                    {actionText}
                  </p>

                  {/* 3. Tool Identifier */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-brass-400">
                    <Terminal size={10} className="text-brass-500 shrink-0" />
                    <span>{entry.tool}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
