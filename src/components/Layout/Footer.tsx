import React from 'react'

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500 mt-12 bg-[#05070c]">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>VideoGen Studio • Multimodal AI Video Synthesis.</span>
        <div className="flex items-center space-x-4 text-slate-400">
          <span>Vite 6</span>
          <span>•</span>
          <span>React 19</span>
          <span>•</span>
          <span>Tailwind 3</span>
          <span>•</span>
          <span>@google/genai</span>
        </div>
      </div>
    </footer>
  )
}
