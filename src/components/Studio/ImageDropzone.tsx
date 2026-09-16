import React from 'react'
import {
  Image as ImageIcon,
  Trash2,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { ImageFileInfo } from '../../hooks/useImageUpload'

interface ImageDropzoneProps {
  selectedImage: string | null
  imageFile: ImageFileInfo | null
  isDragging: boolean
  isGenerating: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onClearImage: () => void
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}

export function ImageDropzone({
  selectedImage,
  imageFile,
  isDragging,
  isGenerating,
  fileInputRef,
  onClearImage,
  onFileInputChange,
  onDragOver,
  onDragLeave,
  onDrop,
}: ImageDropzoneProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
          <span>Source Image</span>
          <span className="text-purple-400 text-[10px] font-mono">
            *required
          </span>
        </label>
        {selectedImage && (
          <button
            type="button"
            onClick={onClearImage}
            disabled={isGenerating}
            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center space-x-1 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={onFileInputChange}
        className="hidden"
      />

      {!selectedImage ? (
        /* Drag & Drop Designated Dropzone */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'group relative rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2.5',
            isDragging
              ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
              : 'border-white/15 bg-[#0a0d16]/80 hover:border-purple-500/50 hover:bg-white/5'
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-200">
              <span className="text-purple-400 underline underline-offset-2">
                Click to browse
              </span>{' '}
              or drag and drop
            </p>
            <p className="text-[10px] text-slate-500">
              PNG, JPG, or WEBP (up to 10MB)
            </p>
          </div>
        </div>
      ) : (
        /* Selected Image Preview & File Meta */
        <div className="relative rounded-xl border border-white/10 bg-[#0a0d16] p-3 flex items-center space-x-3.5">
          <img
            src={selectedImage}
            alt="Source preview"
            className="w-16 h-16 rounded-lg object-cover border border-white/10 bg-black/40 flex-shrink-0"
          />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-200 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">
                {imageFile?.name || 'Selected image'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
              <span>{imageFile?.size}</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating}
                className="text-purple-400 hover:text-purple-300 underline underline-offset-2 cursor-pointer"
              >
                Change image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
