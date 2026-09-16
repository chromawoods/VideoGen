import React from 'react'
import { Video, Key } from 'lucide-react'
import { cn } from '../../lib/utils'
import { ApiKeyDrawer } from './ApiKeyDrawer'

interface HeaderProps {
  apiKey: string
  hasEnvKey: boolean
  isKeyAvailable: boolean
  showApiKeyInput: boolean
  onToggleApiKeyInput: () => void
  onApiKeyChange: (val: string) => void
  onCloseApiKeyInput: () => void
}

export function Header({
  apiKey,
  hasEnvKey,
  isKeyAvailable,
  showApiKeyInput,
  onToggleApiKeyInput,
  onApiKeyChange,
  onCloseApiKeyInput,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090e]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/25">
            <div className="w-full h-full bg-[#090b12] rounded-[10px] flex items-center justify-center">
              <Video className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                VideoGen
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Studio AI
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleApiKeyInput}
            className={cn(
              'flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer',
              isKeyAvailable
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            )}
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {hasEnvKey
                ? 'VIDEO_GEN_API_KEY Active'
                : apiKey
                  ? 'API Key Set'
                  : 'Set API Key'}
            </span>
          </button>
        </div>
      </div>

      {showApiKeyInput && (
        <ApiKeyDrawer
          apiKey={apiKey}
          hasEnvKey={hasEnvKey}
          onApiKeyChange={onApiKeyChange}
          onClose={onCloseApiKeyInput}
        />
      )}
    </header>
  )
}
