import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  blobToBase64,
  resolveImageInput,
  generateVideoFromImage,
  ImageToVideoProps,
  GenerationProgress,
  AVAILABLE_MODELS,
} from './generator'

const mockGenerateVideos = vi.fn()
const mockGetVideosOperation = vi.fn()

vi.mock('@google/genai', () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = {
      generateVideos: mockGenerateVideos,
    }
    operations = {
      getVideosOperation: mockGetVideosOperation,
    }
  },
}))

vi.mock('./media', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./media')>()
  return {
    ...actual,
    fetchMediaBlobUrl: vi.fn(),
  }
})

import { fetchMediaBlobUrl } from './media'

describe('generator', () => {
  const originalEnv = process.env.VIDEO_GEN_API_KEY

  beforeEach(() => {
    process.env.VIDEO_GEN_API_KEY = 'test-api-key'
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env.VIDEO_GEN_API_KEY = originalEnv
    vi.useRealTimers()
  })

  describe('AVAILABLE_MODELS', () => {
    it('contains expected preview models', () => {
      expect(AVAILABLE_MODELS).toContain('veo-3.1-lite-generate-preview')
      expect(AVAILABLE_MODELS).toContain('veo-3.1-fast-generate-preview')
    })
  })

  describe('blobToBase64', () => {
    it('converts blob to base64 with correct MIME type', async () => {
      const blob = new Blob(['sample-pixel-data'], { type: 'image/png' })
      const result = await blobToBase64(blob)

      expect(result.mimeType).toBe('image/png')
      expect(typeof result.imageBytes).toBe('string')
      expect(result.imageBytes.length).toBeGreaterThan(0)
    })
  })

  describe('resolveImageInput', () => {
    it('throws when image input is missing or empty', async () => {
      await expect(resolveImageInput('')).rejects.toThrow(
        'Image input is empty or missing.'
      )
      // @ts-expect-error test invalid null input
      await expect(resolveImageInput(null)).rejects.toThrow(
        'Image input is empty or missing.'
      )
    })

    it('resolves a Blob input', async () => {
      const blob = new Blob(['image-data'], { type: 'image/jpeg' })
      const result = await resolveImageInput(blob)

      expect(result.mimeType).toBe('image/jpeg')
      expect(result.imageBytes).toBeDefined()
    })

    it('resolves a data: URL input directly without fetching', async () => {
      const dataUrl =
        'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/kgAA'
      const result = await resolveImageInput(dataUrl)

      expect(result.mimeType).toBe('image/webp')
      expect(result.imageBytes).toBe(
        'UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/kgAA'
      )
    })

    it('resolves a blob: URL input by fetching the blob', async () => {
      const mockBlob = new Blob(['blob-content'], { type: 'image/png' })
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response)

      const result = await resolveImageInput('blob:http://localhost/image-123')
      expect(result.mimeType).toBe('image/png')
      expect(result.imageBytes).toBeDefined()
    })

    it('throws when fetching a blob: URL fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as Response)

      await expect(
        resolveImageInput('blob:http://localhost/not-found')
      ).rejects.toThrow('Failed to read image from blob URL: Not Found')
    })

    it('falls back to image/jpeg for raw base64 string', async () => {
      const rawBase64 = 'aGVsbG8gd29ybGQ='
      const result = await resolveImageInput(rawBase64)

      expect(result.mimeType).toBe('image/jpeg')
      expect(result.imageBytes).toBe(rawBase64)
    })
  })

  describe('generateVideoFromImage', () => {
    const validProps: ImageToVideoProps = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: 'A cinematic drone shot over mountains',
      image:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      config: {
        durationSeconds: 4,
        resolution: '720p',
        aspectRatio: '16:9',
        numberOfVideos: 1,
      },
    }

    it('throws error when prompt is empty', async () => {
      const props = { ...validProps, prompt: '   ' }
      await expect(generateVideoFromImage(props)).rejects.toThrow(
        'Please provide a scene description prompt.'
      )
    })

    it('throws error when image is missing', async () => {
      const props = { ...validProps, image: '' }
      await expect(generateVideoFromImage(props)).rejects.toThrow(
        'Please select or upload an image before generating.'
      )
    })

    it('throws error when API key is missing', async () => {
      delete process.env.VIDEO_GEN_API_KEY
      await expect(generateVideoFromImage(validProps)).rejects.toThrow(
        'API key is required.'
      )
    })

    it('completes successfully when operation is already done with videoBytes', async () => {
      mockGenerateVideos.mockResolvedValueOnce({
        name: 'operations/test-op-1',
        done: true,
        response: {
          generatedVideos: [
            {
              video: {
                videoBytes: 'AAAAHGZ0eXBtcDQyAAAAAW1wNDJpc29t',
              },
            },
          ],
        },
      })

      const progressUpdates: GenerationProgress[] = []
      const result = await generateVideoFromImage(validProps, (p) =>
        progressUpdates.push(p)
      )

      expect(result.videoUrl).toBe(
        'data:video/mp4;base64,AAAAHGZ0eXBtcDQyAAAAAW1wNDJpc29t'
      )
      expect(result.operation.name).toBe('operations/test-op-1')

      // Verify progress callback sequence
      const states = progressUpdates.map((p) => p.state)
      expect(states).toContain('preparing')
      expect(states).toContain('submitting')
      expect(states).toContain('downloading')
      expect(states).toContain('done')
    })

    it('resolves remote video URI using fetchMediaBlobUrl', async () => {
      const remoteUri = 'https://generativelanguage.googleapis.com/v1beta/video'
      mockGenerateVideos.mockResolvedValueOnce({
        name: 'operations/test-op-2',
        done: true,
        response: {
          generatedVideos: [
            {
              video: {
                uri: remoteUri,
              },
            },
          ],
        },
      })

      vi.mocked(fetchMediaBlobUrl).mockResolvedValueOnce(
        'blob:http://localhost/downloaded-video'
      )

      const result = await generateVideoFromImage(validProps)
      expect(result.videoUrl).toBe('blob:http://localhost/downloaded-video')
      expect(fetchMediaBlobUrl).toHaveBeenCalledWith(remoteUri)
    })

    it('falls back to authenticated URI if fetchMediaBlobUrl fails', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const remoteUri = 'https://generativelanguage.googleapis.com/v1beta/video'
      mockGenerateVideos.mockResolvedValueOnce({
        name: 'operations/test-op-3',
        done: true,
        response: {
          generatedVideos: [
            {
              video: {
                uri: remoteUri,
              },
            },
          ],
        },
      })

      vi.mocked(fetchMediaBlobUrl).mockRejectedValueOnce(
        new Error('Network error')
      )

      const result = await generateVideoFromImage(validProps)
      expect(result.videoUrl).toContain('alt=media')
      expect(result.videoUrl).toContain('key=test-api-key')
    })

    it('polls until operation finishes when not done initially', async () => {
      vi.useFakeTimers()

      // Initial submission is pending
      mockGenerateVideos.mockResolvedValueOnce({
        name: 'operations/poll-op',
        done: false,
      })

      // First poll is still pending, second poll completes
      mockGetVideosOperation
        .mockResolvedValueOnce({
          name: 'operations/poll-op',
          done: false,
        })
        .mockResolvedValueOnce({
          name: 'operations/poll-op',
          done: true,
          response: {
            generatedVideos: [
              {
                video: {
                  videoBytes: 'base64video',
                },
              },
            ],
          },
        })

      const progressUpdates: GenerationProgress[] = []
      const promise = generateVideoFromImage(validProps, (p) =>
        progressUpdates.push(p)
      )

      // Advance through first poll (8000ms)
      await vi.advanceTimersByTimeAsync(8000)
      // Advance through second poll (8000ms)
      await vi.advanceTimersByTimeAsync(8000)

      const result = await promise
      expect(result.videoUrl).toBe('data:video/mp4;base64,base64video')
      expect(mockGetVideosOperation).toHaveBeenCalledTimes(2)

      const processingUpdates = progressUpdates.filter(
        (p) => p.state === 'processing'
      )
      expect(processingUpdates.length).toBeGreaterThan(1)
    })

    it('throws error and updates progress when operation returns an error', async () => {
      mockGenerateVideos.mockResolvedValueOnce({
        name: 'operations/fail-op',
        done: false,
      })

      mockGetVideosOperation.mockResolvedValueOnce({
        name: 'operations/fail-op',
        done: false,
        error: { message: 'Quota exceeded for Veo model' },
      })

      vi.useFakeTimers()
      const progressUpdates: GenerationProgress[] = []
      const promise = generateVideoFromImage(validProps, (p) =>
        progressUpdates.push(p)
      )

      const rejectionExpectation = expect(promise).rejects.toThrow(
        'Video generation failed: Quota exceeded for Veo model'
      )
      await vi.advanceTimersByTimeAsync(8000)
      await rejectionExpectation

      const errorProgress = progressUpdates.find((p) => p.state === 'error')
      expect(errorProgress).toBeDefined()
      expect(errorProgress?.error).toContain('Quota exceeded for Veo model')
    })

    it('throws error when operation returns no generated video', async () => {
      mockGenerateVideos.mockResolvedValueOnce({
        name: 'operations/empty-op',
        done: true,
        response: {
          generatedVideos: [],
        },
      })

      await expect(generateVideoFromImage(validProps)).rejects.toThrow(
        'No video was returned from the generation operation.'
      )
    })
  })
})
