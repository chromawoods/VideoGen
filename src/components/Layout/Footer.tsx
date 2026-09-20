export function Footer() {
  return (
    <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500 mt-12 bg-studio-abyss">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>VideoGen Studio • Multimodal AI Video Synthesis.</span>
        <div className="flex items-center space-x-4 text-slate-400">
          <a
            href="https://github.com/chromawoods/VideoGen"
            target="_blank"
            className="hover:text-white transition-colors"
          >
            github.com/chromawoods/VideoGen
          </a>
        </div>
      </div>
    </footer>
  )
}
