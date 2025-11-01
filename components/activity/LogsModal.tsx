'use client'

import { X, Terminal } from 'lucide-react'

interface LogsModalProps {
  isOpen: boolean
  onClose: () => void
  planId: number
  output: string
}

export default function LogsModal({ isOpen, onClose, planId, output }: LogsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-navy-800 rounded-lg border border-navy-700 w-full max-w-6xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center">
              <Terminal className="w-6 h-6 text-accent-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Execution Logs</h2>
              <p className="text-sm text-slate-400">Plan #{planId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-navy-900 rounded-lg border border-navy-700 p-4 max-h-[600px] overflow-auto">
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-navy-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

