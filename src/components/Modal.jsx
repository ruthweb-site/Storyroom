import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ title, subtitle, onClose, children, wide }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} max-h-[80vh] flex flex-col bg-studio-900 border border-studio-700 rounded-lg overflow-hidden shadow-2xl`}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-studio-800 shrink-0">
          <div>
            <p className="text-studio-100 font-medium text-sm">{title}</p>
            {subtitle && <p className="text-studio-500 text-xs mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-studio-500 hover:text-studio-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
