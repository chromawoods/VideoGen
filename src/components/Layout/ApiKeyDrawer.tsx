import React from 'react'
import { X } from 'lucide-react'

interface ApiKeyDrawerProps {
  apiKey: string
  hasEnvKey: boolean
  onApiKeyChange: (val: string) => void
  onClose: () => void
}

export function ApiKeyDrawer({
  apiKey,
  hasEnvKey,
  onApiKeyChange,
  onClose,
}: ApiKeyDrawerProps) {
  return (
    <div className="border-t border-white/5 bg-[#090d18] px-4 py-3 sm:px-8 animate-in slide-in-from-top-2 duration-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
            <span>API Key</span>
            {hasEnvKey && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                Active via VIDEO_GEN_API_KEY
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Used for @google/genai Veo video synthesis requests.
          </p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={
              hasEnvKey ? 'Overriding .env key (optional)...' : 'AIzaSy...'
            }
            className="text-xs bg-[#05070c] border border-white/15 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500 w-full sm:w-72 font-mono"
          />
          <button
            onClick={onClose}
            aria-label="Close API Key Configuration"
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
