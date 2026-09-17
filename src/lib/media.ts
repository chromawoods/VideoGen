/**
 * Video & Media Handling Utilities
 * Centralizes URL signing, authenticated media retrieval, and browser downloads.
 */

/**
 * Retrieve API key from environment variable.
 */
export function getApiKey(): string {
  if (typeof process !== 'undefined' && process.env?.VIDEO_GEN_API_KEY) {
    return process.env.VIDEO_GEN_API_KEY.trim()
  }
  throw new Error('VIDEO_GEN_API_KEY environment variable is not set.')
}

/**
 * Builds an authenticated media URL with API key and alt=media query params.
 */
export function buildAuthenticatedMediaUrl(url: string): string {
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }

  const resolvedApiKey = getApiKey()
  try {
    const parsed = new URL(url)
    if (resolvedApiKey && !parsed.searchParams.has('key')) {
      parsed.searchParams.set('key', resolvedApiKey)
    }
    if (!parsed.searchParams.has('alt')) {
      parsed.searchParams.set('alt', 'media')
    }
    return parsed.toString()
  } catch {
    const sep = url.includes('?') ? '&' : '?'
    const keyParam = resolvedApiKey
      ? `&key=${encodeURIComponent(resolvedApiKey)}`
      : ''
    return `${url}${sep}alt=media${keyParam}`
  }
}

/**
 * Fetches media bytes as a Blob with optional authentication.
 */
export async function fetchMediaBlob(url: string): Promise<Blob> {
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(
        `Failed to fetch media blob: ${res.status} ${res.statusText}`
      )
    }
    return res.blob()
  }

  const resolvedApiKey = getApiKey()
  const authenticatedUrl = buildAuthenticatedMediaUrl(url)

  const response = await fetch(authenticatedUrl, {
    headers: resolvedApiKey ? { 'x-goog-api-key': resolvedApiKey } : undefined,
  })

  if (!response.ok) {
    throw new Error(
      `Download failed with status ${response.status}: ${response.statusText}`
    )
  }

  return response.blob()
}

/**
 * Fetches media bytes and converts them to a local Blob URL.
 */
export async function fetchMediaBlobUrl(url: string): Promise<string> {
  const blob = await fetchMediaBlob(url)
  return URL.createObjectURL(blob)
}

/**
 * Programmatically triggers a file download in the browser using an anchor tag.
 */
export function triggerFileDownload(
  url: string,
  filename = 'veo_generated_video.mp4'
): void {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

interface FilePickerSaveOptions {
  suggestedName?: string
  types?: Array<{
    description?: string
    accept: Record<string, string[]>
  }>
}

interface FilePickerWritableStream extends WritableStream {
  write(data: Blob | BufferSource | string): Promise<void>
  close(): Promise<void>
}

interface FilePickerFileHandle {
  createWritable(): Promise<FilePickerWritableStream>
}

declare global {
  interface Window {
    showSaveFilePicker?: (
      options?: FilePickerSaveOptions
    ) => Promise<FilePickerFileHandle>
  }
}

/**
 * Downloads a raw Blob directly to disk.
 * Prefers File System Access API (showSaveFilePicker) for zero-copy streaming,
 * falling back to an anchor download with safe, prompt Object URL revocation.
 */
export async function downloadBlob(
  blob: Blob,
  filename = 'veo_generated_video.mp4'
): Promise<void> {
  // 1. Try File System Access API when available (Chrome, Edge, Opera)
  if (
    typeof window !== 'undefined' &&
    typeof window.showSaveFilePicker === 'function'
  ) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'Video File',
            accept: { 'video/mp4': ['.mp4'] },
          },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User intentionally cancelled save dialog
        return
      }
      // On permission failure or other error, proceed to anchor download fallback
    }
  }

  // 2. Anchor click download fallback with prompt cleanup
  const blobUrl = URL.createObjectURL(blob)
  try {
    triggerFileDownload(blobUrl, filename)
  } finally {
    // Release the temporary Object URL once the browser's download manager queues the request
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
    }, 1000)
  }
}

/**
 * Downloads a video from a blob, data URL, or remote URL.
 * If url is already an Object URL (e.g. managed by React hook), triggers direct download.
 * If remote, fetches blob and saves cleanly without leaking memory.
 */
export async function downloadVideo(
  url: string,
  filename = 'veo_generated_video.mp4'
): Promise<void> {
  if (!url) return

  // If already a local blob: or data: URL (managed by useVideoGeneration), trigger direct download
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    triggerFileDownload(url, filename)
    return
  }

  // Remote URL: fetch blob with authentication and download with prompt cleanup
  const blob = await fetchMediaBlob(url)
  await downloadBlob(blob, filename)
}
