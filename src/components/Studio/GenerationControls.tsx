import React from 'react'
import {
  Film,
  Cpu,
  Sliders,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import {
  AVAILABLE_MODELS,
  GenerationState,
  VideoConfig,
} from '../../lib/generator'

interface GenerationControlsProps {
  model: (typeof AVAILABLE_MODELS)[number]
  onModelChange: (model: (typeof AVAILABLE_MODELS)[number]) => void
  aspectRatio: '16:9' | '9:16'
  onAspectRatioChange: (ratio: '16:9' | '9:16') => void
  durationSeconds: NonNullable<VideoConfig['durationSeconds']>
  onDurationSecondsChange: (
    duration: NonNullable<VideoConfig['durationSeconds']>
  ) => void
  prompt: string
  onPromptChange: (prompt: string) => void
  isGenerating: boolean
  generationState: GenerationState
  generationStage: string
  progress: number
  onGenerate: () => void
  children?: React.ReactNode
}

export function GenerationControls({
  model,
  onModelChange,
  aspectRatio,
  onAspectRatioChange,
  durationSeconds,
  onDurationSecondsChange,
  prompt,
  onPromptChange,
  isGenerating,
  generationState,
  generationStage,
  progress,
  onGenerate,
  children,
}: GenerationControlsProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 space-y-5 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center space-x-2">
          <Film className="w-5 h-5 text-purple-400" />
          <h2 className="font-semibold text-base text-slate-100">
            Video Generation Controls
          </h2>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
          Image-to-Video
        </span>
      </div>

      {/* Source Image Selector (passed as child) */}
      {children}

      {/* Model & Aspect Ratio Selectors */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>AI Model</span>
          </label>
          <select
            value={model}
            onChange={(e) =>
              onModelChange(e.target.value as (typeof AVAILABLE_MODELS)[number])
            }
            disabled={isGenerating}
            className="w-full text-xs bg-[#0f1422] border border-white/10 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center space-x-1">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Ratio</span>
          </label>
          <div className="flex rounded-lg border border-white/10 bg-[#0f1422] p-0.5">
            {(['16:9', '9:16'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                disabled={isGenerating}
                onClick={() => onAspectRatioChange(ratio)}
                className={cn(
                  'flex-1 text-[11px] py-1.5 rounded-md font-medium transition-all disabled:opacity-50 cursor-pointer',
                  aspectRatio === ratio
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Duration Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="duration-seconds"
            className="text-xs font-medium text-slate-400 flex items-center space-x-1"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Duration</span>
          </label>
          <span className="text-xs font-mono font-medium text-purple-300">
            {durationSeconds}s
          </span>
        </div>
        <input
          id="duration-seconds"
          type="range"
          min={1}
          max={12}
          step={1}
          value={durationSeconds}
          onChange={(e) =>
            onDurationSecondsChange(parseInt(e.target.value, 10))
          }
          disabled={isGenerating}
          aria-label="Duration (seconds)"
          className="w-full h-1.5 bg-[#0f1422] rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>1s</span>
          <span>6s</span>
          <span>12s</span>
        </div>
      </div>

      {/* Prompt Textarea */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
          <span>Describe the motion & scene</span>
          <span className="text-[10px] text-slate-500 font-mono">
            {prompt.length} chars
          </span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={isGenerating}
          rows={3}
          className="w-full text-xs sm:text-sm bg-[#0a0d16] border border-white/10 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/50 resize-none transition-all placeholder:text-slate-600 font-sans disabled:opacity-50"
          placeholder="e.g., Cinematic slow motion, gentle camera push-in, sunlight reflecting gracefully..."
        />
      </div>

      {/* Generate Button */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
        className={cn(
          'w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer',
          isGenerating
            ? 'bg-purple-900/50 text-purple-300 cursor-not-allowed border border-purple-500/30'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:shadow-purple-600/50 active:scale-[0.99]'
        )}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
            <span>Synthesizing Video... ({progress}%)</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Generate Video</span>
          </>
        )}
      </button>

      {/* Generation Progress Indicator */}
      {isGenerating && (
        <div className="space-y-2 pt-1 animate-in fade-in duration-300">
          <div className="flex justify-between text-[11px] text-slate-300 font-mono">
            <span className="truncate pr-2 text-purple-300">
              {generationStage}
            </span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(progress, 5)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Veo multimodal processing</span>
            <span>State: {generationState}</span>
          </div>
        </div>
      )}

      {/* Ready / Done Confirmation */}
      {!isGenerating && generationState === 'done' && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Video generation finished! Ready in canvas.</span>
          </div>
        </div>
      )}
    </div>
  )
}
