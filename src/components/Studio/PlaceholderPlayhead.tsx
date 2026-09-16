import React, { useState, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'

export function PlaceholderPlayhead() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setSeconds((prev) => (prev >= 4 ? 0 : prev + 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying])

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev)
  }

  return (
    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 select-none">
      <button
        type="button"
        onClick={handleTogglePlay}
        className="hover:text-white transition-colors flex items-center space-x-1 cursor-pointer"
        aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 text-purple-400" />
        ) : (
          <Play className="w-3.5 h-3.5 text-purple-400" />
        )}
        <span className="font-mono">{isPlaying ? 'Previewing' : 'Paused'}</span>
      </button>

      <div className="flex-1 mx-3 bg-white/15 h-1 rounded-full overflow-hidden">
        <div
          className="bg-purple-400 h-full w-full rounded-full origin-left animate-playhead will-change-transform"
          style={{
            animationPlayState: isPlaying ? 'running' : 'paused',
          }}
        />
      </div>

      <span className="font-mono text-[10px]">00:0{seconds}s</span>
    </div>
  )
}
