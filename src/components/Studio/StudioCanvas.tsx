import { useState } from 'react'
import { Download, RefreshCw, Sparkles } from 'lucide-react'
import { cn, getErrorMessage } from '../../lib/utils'
import { downloadVideo } from '../../lib/media'
import { PlaceholderPlayhead } from './PlaceholderPlayhead'

interface StudioCanvasProps {
  generatedVideoUrl: string | null
  selectedImage: string | null
  aspectRatio: '16:9' | '9:16'
  model: string
  prompt: string
  isGenerating: boolean
  generationStage: string
  progress: number
  onError?: (msg: string) => void
}

export function StudioCanvas({
  generatedVideoUrl,
  selectedImage,
  aspectRatio,
  model,
  prompt,
  isGenerating,
  generationStage,
  progress,
  onError,
}: StudioCanvasProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadVideo = async () => {
    if (!generatedVideoUrl) return
    setIsDownloading(true)

    try {
      await downloadVideo(generatedVideoUrl, 'veo_generated_video.mp4')
    } catch (err: unknown) {
      console.error('Download error:', err)
      onError?.(getErrorMessage(err, 'Failed to download video file.'))
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
      {/* Studio Canvas Window Header */}
      <div className="px-4 py-3 bg-studio-panel/90 border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-2 font-mono text-slate-400">
            {generatedVideoUrl
              ? 'veo_output.mp4'
              : selectedImage
                ? 'source_input.jpg'
                : 'studio_preview.mp4'}
          </span>
        </div>
        <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-400">
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
            {aspectRatio === '16:9' ? '1280x720 (720p)' : '720x1280 (720p)'}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {model}
          </span>
        </div>
      </div>

      {/* Dynamic Viewport */}
      <div className="relative bg-studio-abyss flex items-center justify-center p-6 min-h-[420px] overflow-hidden">
        {generatedVideoUrl ? (
          /* Generated Video Output */
          <div
            className={cn(
              'relative rounded-xl overflow-hidden border border-purple-500/30 shadow-2xl transition-all duration-500 flex flex-col items-center justify-center bg-black group',
              aspectRatio === '16:9' && 'w-full aspect-video max-h-[420px]',
              aspectRatio === '9:16' && 'w-72 aspect-[9/16]'
            )}
          >
            <video
              src={generatedVideoUrl}
              controls
              autoPlay
              loop
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleDownloadVideo}
                disabled={isDownloading}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-600/90 hover:bg-purple-600 text-white text-xs font-medium shadow-lg backdrop-blur-md transition-all disabled:opacity-60 cursor-pointer"
              >
                {isDownloading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isDownloading ? 'Saving...' : 'Download'}</span>
              </button>
            </div>
          </div>
        ) : selectedImage ? (
          /* Uploaded Image Keyframe Preview */
          <div
            className={cn(
              'relative rounded-xl overflow-hidden border border-white/15 shadow-2xl transition-all duration-500 flex flex-col items-center justify-center bg-black/60 group',
              aspectRatio === '16:9' && 'w-full aspect-video max-h-[400px]',
              aspectRatio === '9:16' && 'w-72 aspect-[9/16]'
            )}
          >
            <img
              src={selectedImage}
              alt="Source input preview"
              className="w-full h-full object-cover"
            />

            {/* Overlay during generation */}
            {isGenerating ? (
              <div className="absolute inset-0 bg-studio-base/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-base font-bold text-white tracking-tight">
                    Veo Synthesis in Progress
                  </h4>
                  <p className="text-xs text-purple-300/90 font-mono">
                    {generationStage}
                  </p>
                </div>
                <div className="w-48 bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {progress}% • 720p • 4.0s
                </span>
              </div>
            ) : (
              /* Idle overlay for loaded image */
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4 pointer-events-none">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-purple-600/80 text-white backdrop-blur-md">
                    Input Keyframe Ready
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-200 line-clamp-1 italic">
                    {prompt
                      ? `"${prompt}"`
                      : 'Enter motion prompt and click generate to synthesize video'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Aspect Ratio: {aspectRatio} • 4 Seconds • Veo Model
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Initial Placeholder Canvas */
          <div
            className={cn(
              'relative rounded-xl overflow-hidden border border-white/15 shadow-2xl transition-all duration-500 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-studio-gradient-from via-studio-gradient-via to-studio-gradient-to',
              aspectRatio === '16:9' && 'w-full aspect-video max-h-[360px]',
              aspectRatio === '9:16' && 'w-64 aspect-[9/16]'
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-cyan-500/10 to-transparent pointer-events-none opacity-60" />

            <div className="relative z-10 space-y-4 max-w-md">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-xl shadow-purple-600/30 animate-float">
                <div className="w-full h-full bg-studio-badge rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-cyan-300" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Veo Video Studio
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 px-2">
                  Select or drag-and-drop a source image and enter a motion
                  prompt to synthesize video.
                </p>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200">
                  Target: {aspectRatio}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200">
                  Model: {model}
                </span>
              </div>
            </div>

            {/* Isolated GPU-Accelerated Playhead Overlay */}
            <PlaceholderPlayhead />
          </div>
        )}
      </div>
    </div>
  )
}
