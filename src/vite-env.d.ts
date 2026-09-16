/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VIDEO_GEN_API_KEY?: string
  readonly VITE_VIDEO_GEN_API_KEY?: string
  readonly [key: string]: string | boolean | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
