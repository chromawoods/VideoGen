import React, { useState } from 'react'
import { Terminal, Copy, Check } from 'lucide-react'

const COMMANDS = [
  { cmd: 'bun run dev', desc: 'Start Vite development server with HMR' },
  { cmd: 'bun run build', desc: 'TypeScript check and Vite bundle creation' },
  { cmd: 'bun run preview', desc: 'Locally preview production build output' },
]

export function CommandsGuide() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCmd(text)
    setTimeout(() => {
      setCopiedCmd((prev) => (prev === text ? null : prev))
    }, 2000)
  }

  return (
    <section className="glass-panel rounded-2xl p-6 space-y-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">
            Available Package Commands
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          package.json scripts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {COMMANDS.map((s) => {
          const isCopied = copiedCmd === s.cmd
          return (
            <div
              key={s.cmd}
              onClick={() => copyToClipboard(s.cmd)}
              className="group p-3 rounded-xl bg-black/40 border border-white/5 hover:border-purple-500/40 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs font-mono text-purple-300">
                <span>{s.cmd}</span>
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 transition-opacity" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity text-slate-300" />
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">{s.desc}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
