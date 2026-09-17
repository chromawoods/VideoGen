import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getApiKey,
  buildAuthenticatedMediaUrl,
  fetchMediaBlob,
  fetchMediaBlobUrl,
  triggerFileDownload,
  downloadBlob,
  downloadVideo,
} from './media'

describe('media utils', () => {
  const originalEnv = process.env.VIDEO_GEN_API_KEY

  beforeEach(() => {
    process.env.VIDEO_GEN_API_KEY = originalEnv
    vi.clearAllMocks()
  })

  describe('getApiKey', () => {
    it('returns API key from process.env', () => {
      process.env.VIDEO_GEN_API_KEY = 'test-api-key-123'
      expect(getApiKey()).toBe('test-api-key-123')
    })

    it('returns empty string if key is not configured', () => {
      delete process.env.VIDEO_GEN_API_KEY
      expect(getApiKey()).toBe('')
    })
  })

  describe('buildAuthenticatedMediaUrl', () => {
    it('returns blob: and data: URLs unchanged', () => {
      expect(buildAuthenticatedMediaUrl('blob:http://localhost/test')).toBe(
        'blob:http://localhost/test'
      )
      expect(buildAuthenticatedMediaUrl('data:image/png;base64,abc')).toBe(
        'data:image/png;base64,abc'
      )
    })

    it('adds key and alt=media to remote URLs', () => {
      process.env.VIDEO_GEN_API_KEY = 'my-secret-key'
      const url = 'https://generativelanguage.googleapis.com/v1beta/media/123'
      const authenticated = buildAuthenticatedMediaUrl(url)

      const parsed = new URL(authenticated)
      expect(parsed.searchParams.get('key')).toBe('my-secret-key')
      expect(parsed.searchParams.get('alt')).toBe('media')
    })

    it('does not duplicate key or alt params if already present', () => {
      process.env.VIDEO_GEN_API_KEY = 'my-secret-key'
      const url =
        'https://generativelanguage.googleapis.com/v1beta/media/123?key=existing-key&alt=media'
      const authenticated = buildAuthenticatedMediaUrl(url)

      const parsed = new URL(authenticated)
      expect(parsed.searchParams.get('key')).toBe('existing-key')
      expect(parsed.searchParams.get('alt')).toBe('media')
    })

    it('falls back to string concatenation for invalid URL formats', () => {
      process.env.VIDEO_GEN_API_KEY = 'fallback-key'
      const invalidUrl = 'not-a-valid-url'
      const result = buildAuthenticatedMediaUrl(invalidUrl)
      expect(result).toContain('alt=media')
      expect(result).toContain('key=fallback-key')
    })
  })

  describe('fetchMediaBlob', () => {
    it('fetches blob: URLs directly without auth headers', async () => {
      const mockBlob = new Blob(['sample-data'], { type: 'video/mp4' })
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response)

      const result = await fetchMediaBlob('blob:http://localhost/preview')
      expect(fetchSpy).toHaveBeenCalledWith('blob:http://localhost/preview')
      expect(result).toBe(mockBlob)
    })

    it('throws error when local blob fetch fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response)

      await expect(
        fetchMediaBlob('blob:http://localhost/missing')
      ).rejects.toThrow('Failed to fetch media blob: 404 Not Found')
    })

    it('fetches remote URLs with authentication header', async () => {
      process.env.VIDEO_GEN_API_KEY = 'auth-token-xyz'
      const mockBlob = new Blob(['video-bytes'], { type: 'video/mp4' })
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response)

      const result = await fetchMediaBlob(
        'https://generativelanguage.googleapis.com/test'
      )
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('alt=media'),
        expect.objectContaining({
          headers: { 'x-goog-api-key': 'auth-token-xyz' },
        })
      )
      expect(result).toBe(mockBlob)
    })

    it('throws error when remote fetch fails', async () => {
      process.env.VIDEO_GEN_API_KEY = 'auth-token-xyz'
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response)

      await expect(
        fetchMediaBlob('https://generativelanguage.googleapis.com/test')
      ).rejects.toThrow('Download failed with status 403: Forbidden')
    })
  })

  describe('fetchMediaBlobUrl', () => {
    it('converts fetched blob to an Object URL', async () => {
      const mockBlob = new Blob(['media-bytes'], { type: 'video/mp4' })
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response)
      vi.spyOn(URL, 'createObjectURL').mockReturnValueOnce(
        'blob:http://localhost/new-object-url'
      )

      const url = await fetchMediaBlobUrl('blob:http://localhost/source')
      expect(url).toBe('blob:http://localhost/new-object-url')
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
    })
  })

  describe('triggerFileDownload', () => {
    it('creates an anchor tag, triggers click, and removes it from document body', () => {
      const appendChildSpy = vi.spyOn(document.body, 'appendChild')
      const removeChildSpy = vi.spyOn(document.body, 'removeChild')

      let createdAnchor: HTMLAnchorElement | null = null
      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        const el = originalCreateElement(tagName)
        if (tagName === 'a') {
          createdAnchor = el as HTMLAnchorElement
          vi.spyOn(createdAnchor, 'click').mockImplementation(() => {})
        }
        return el
      })

      triggerFileDownload('blob:http://localhost/video', 'custom_output.mp4')

      expect(createdAnchor).not.toBeNull()
      expect(createdAnchor!.href).toBe('blob:http://localhost/video')
      expect(createdAnchor!.download).toBe('custom_output.mp4')
      expect(appendChildSpy).toHaveBeenCalledWith(createdAnchor)
      expect(createdAnchor!.click).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalledWith(createdAnchor)
    })
  })

  describe('downloadBlob', () => {
    it('uses File System Access API (showSaveFilePicker) when available', async () => {
      const writeMock = vi.fn().mockResolvedValue(undefined)
      const closeMock = vi.fn().mockResolvedValue(undefined)
      const createWritableMock = vi.fn().mockResolvedValue({
        write: writeMock,
        close: closeMock,
      })
      const showSaveFilePickerMock = vi.fn().mockResolvedValue({
        createWritable: createWritableMock,
      })

      window.showSaveFilePicker = showSaveFilePickerMock

      const blob = new Blob(['test-stream-content'])
      await downloadBlob(blob, 'streamed_output.mp4')

      expect(showSaveFilePickerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          suggestedName: 'streamed_output.mp4',
        })
      )
      expect(writeMock).toHaveBeenCalledWith(blob)
      expect(closeMock).toHaveBeenCalled()

      delete window.showSaveFilePicker
    })

    it('silently returns when user cancels File System save picker (AbortError)', async () => {
      const abortError = new Error('The user aborted a request.')
      abortError.name = 'AbortError'
      window.showSaveFilePicker = vi.fn().mockRejectedValue(abortError)

      const blob = new Blob(['test-content'])
      await expect(downloadBlob(blob)).resolves.toBeUndefined()

      delete window.showSaveFilePicker
    })

    it('falls back to anchor download when showSaveFilePicker throws other error', async () => {
      window.showSaveFilePicker = vi
        .fn()
        .mockRejectedValue(new Error('Permission denied'))

      vi.useFakeTimers()
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL')
      const blob = new Blob(['test-content'])

      await downloadBlob(blob, 'fallback.mp4')

      expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
      // Advance timers for scheduled revokeObjectURL (1000ms)
      vi.advanceTimersByTime(1000)
      expect(revokeSpy).toHaveBeenCalled()

      vi.useRealTimers()
      delete window.showSaveFilePicker
    })
  })

  describe('downloadVideo', () => {
    it('returns early when url is empty', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      await downloadVideo('')
      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('downloads blob: or data: URLs directly without fetching', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      let clicked = false

      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        const el = document.createElementNS('http://www.w3.org/1999/xhtml', tag)
        if (tag === 'a') {
          vi.spyOn(el as HTMLAnchorElement, 'click').mockImplementation(() => {
            clicked = true
          })
        }
        return el
      })

      await downloadVideo('blob:http://localhost/local-video')
      expect(fetchSpy).not.toHaveBeenCalled()
      expect(clicked).toBe(true)
    })

    it('fetches remote URL and downloads blob', async () => {
      const mockBlob = new Blob(['remote-bytes'], { type: 'video/mp4' })
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response)

      vi.useFakeTimers()
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL')

      await downloadVideo('https://example.com/video.mp4', 'output.mp4')

      expect(globalThis.fetch).toHaveBeenCalled()
      vi.advanceTimersByTime(1000)
      expect(revokeSpy).toHaveBeenCalled()

      vi.useRealTimers()
    })
  })
})
