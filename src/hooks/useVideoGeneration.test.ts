import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVideoGeneration } from './useVideoGeneration'
import * as generator from '../lib/generator'

vi.mock('../lib/generator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/generator')>()
  return {
    ...actual,
    generateVideoFromImage: vi.fn().mockResolvedValue({
      videoUrl: 'blob:http://localhost/mock-video',
      operation: { done: true },
    }),
    getApiKey: vi.fn().mockReturnValue('test-api-key'),
  }
})

describe('useVideoGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passes durationSeconds to generateVideoFromImage config', async () => {
    const { result } = renderHook(() => useVideoGeneration())

    await act(async () => {
      await result.current.generateVideo({
        model: 'veo-3.1-lite-generate-preview',
        prompt: 'A test prompt',
        image: 'data:image/png;base64,mock',
        aspectRatio: '16:9',
        durationSeconds: 9,
      })
    })

    expect(generator.generateVideoFromImage).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          durationSeconds: 9,
          aspectRatio: '16:9',
        }),
      }),
      expect.any(Function)
    )
  })

  it('defaults durationSeconds to 4 if not provided', async () => {
    const { result } = renderHook(() => useVideoGeneration())

    await act(async () => {
      await result.current.generateVideo({
        model: 'veo-3.1-lite-generate-preview',
        prompt: 'A test prompt',
        image: 'data:image/png;base64,mock',
        aspectRatio: '16:9',
      })
    })

    expect(generator.generateVideoFromImage).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          durationSeconds: 4,
        }),
      }),
      expect.any(Function)
    )
  })

  it('passes fps to generateVideoFromImage config', async () => {
    const { result } = renderHook(() => useVideoGeneration())

    await act(async () => {
      await result.current.generateVideo({
        model: 'veo-3.1-lite-generate-preview',
        prompt: 'A test prompt',
        image: 'data:image/png;base64,mock',
        aspectRatio: '16:9',
        fps: 60,
      })
    })

    expect(generator.generateVideoFromImage).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          fps: 60,
        }),
      }),
      expect.any(Function)
    )
  })

  it('defaults fps to 24 if not provided', async () => {
    const { result } = renderHook(() => useVideoGeneration())

    await act(async () => {
      await result.current.generateVideo({
        model: 'veo-3.1-lite-generate-preview',
        prompt: 'A test prompt',
        image: 'data:image/png;base64,mock',
        aspectRatio: '16:9',
      })
    })

    expect(generator.generateVideoFromImage).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          fps: 24,
        }),
      }),
      expect.any(Function)
    )
  })
})
