import type { ImageToVideoProps, VideoConfig } from '@/lib/generator'

type VideoTagsProps = {
  model: ImageToVideoProps['model']
  resolution: VideoConfig['resolution']
  durationSeconds: VideoConfig['durationSeconds']
  aspectRatio: VideoConfig['aspectRatio']
}

export function VideoTags({
  model,
  resolution,
  durationSeconds,
  aspectRatio,
}: VideoTagsProps) {
  return (
    <>
      <div className="flex flex-wrap justify-center items-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
        <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200">
          Model: {model}
        </span>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
        <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200">
          Ratio: {aspectRatio}
        </span>
        <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200">
          Resolution: {resolution}
        </span>
        <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200">
          Duration: {durationSeconds}s
        </span>
      </div>
    </>
  )
}
