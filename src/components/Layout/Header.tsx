import { Video } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-studio-base/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/25">
            <div className="w-full h-full bg-studio-logo rounded-[10px] flex items-center justify-center">
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
      </div>
    </header>
  )
}
