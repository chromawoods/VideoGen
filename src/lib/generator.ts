import { GenerateVideosConfig, GoogleGenAI } from '@google/genai'
import {
  getApiKey,
  buildAuthenticatedMediaUrl,
  fetchMediaBlobUrl,
} from './media'
import { getErrorMessage } from './utils'

export {
  getApiKey,
  buildAuthenticatedMediaUrl,
  fetchMediaBlob,
  fetchMediaBlobUrl,
  triggerFileDownload,
  downloadBlob,
  downloadVideo,
} from './media'

export const AVAILABLE_MODELS = [
  'veo-3.1-lite-generate-preview',
  'veo-3.1-fast-generate-preview',
] as const

export type VideoConfig = Pick<
  GenerateVideosConfig,
  'durationSeconds' | 'numberOfVideos' | 'negativePrompt'
> & {
  resolution: '720p' | '1080p'
  aspectRatio: '16:9' | '9:16'
}

export type ImageToVideoProps = {
  model: (typeof AVAILABLE_MODELS)[number]
  prompt: string
  image: string | File | Blob
  config: VideoConfig
}

export type GenerationState =
  | 'idle'
  | 'preparing'
  | 'submitting'
  | 'processing'
  | 'downloading'
  | 'done'
  | 'error'

export interface GenerationProgress {
  state: GenerationState
  stage: string
  progress: number
  error?: string
  videoUrl?: string
  operationName?: string
}

export type ProgressCallback = (progress: GenerationProgress) => void

/**
 * Creates or gets a GoogleGenAI client with the specified or resolved API key.
 */
export function getGenAIClient(): GoogleGenAI {
  const key = getApiKey()
  return new GoogleGenAI({ apiKey: key || '' })
}

export interface ParsedImageData {
  imageBytes: string
  mimeType: string
}

/**
 * Converts a Blob or File to base64 bytes and MIME type on-demand.
 */
export async function blobToBase64(blob: Blob): Promise<ParsedImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const dataUrlMatch = result.match(/^data:([^;]+);base64,(.+)$/s)
      if (dataUrlMatch) {
        resolve({
          mimeType: dataUrlMatch[1],
          imageBytes: dataUrlMatch[2].trim(),
        })
      } else {
        resolve({
          mimeType: blob.type || 'image/jpeg',
          imageBytes: result.trim(),
        })
      }
    }
    reader.onerror = () => {
      reject(new Error('Failed to read image data.'))
    }
    reader.readAsDataURL(blob)
  })
}

/**
 * Resolves image input (File, Blob, Object URL blob:, Data URL data:, or base64)
 * into raw imageBytes and mimeType just-in-time for network dispatch.
 * Keeps React UI state free from bulky base64 payloads.
 */
export async function resolveImageInput(
  imageInput: string | File | Blob
): Promise<ParsedImageData> {
  if (!imageInput) {
    throw new Error('Image input is empty or missing.')
  }

  // Handle File or Blob instances
  if (typeof Blob !== 'undefined' && imageInput instanceof Blob) {
    return blobToBase64(imageInput)
  }

  if (typeof imageInput === 'string') {
    const trimmed = imageInput.trim()
    if (!trimmed) {
      throw new Error('Image input is empty or missing.')
    }

    // Object URL (e.g. blob:http://localhost:5173/...)
    if (trimmed.startsWith('blob:')) {
      const response = await fetch(trimmed)
      if (!response.ok) {
        throw new Error(
          `Failed to read image from blob URL: ${response.statusText}`
        )
      }
      const blob = await response.blob()
      return blobToBase64(blob)
    }

    // Base64 Data URL (e.g. data:image/png;base64,....)
    const dataUrlMatch = trimmed.match(/^data:([^;]+);base64,(.+)$/s)
    if (dataUrlMatch) {
      return {
        mimeType: dataUrlMatch[1],
        imageBytes: dataUrlMatch[2].trim(),
      }
    }

    // Fallback: assume raw base64 string
    return {
      imageBytes: trimmed,
      mimeType: 'image/jpeg',
    }
  }

  throw new Error('Unsupported image input format.')
}

// Retain parseImageInput as an alias for backward compatibility
export const parseImageInput = resolveImageInput

export type GenerateVideosOperation = Awaited<
  ReturnType<ReturnType<typeof getGenAIClient>['models']['generateVideos']>
>

export async function generateVideoFromImage(
  props: ImageToVideoProps,
  onProgress?: ProgressCallback
): Promise<{ videoUrl: string; operation: GenerateVideosOperation }> {
  try {
    const { model, prompt, image, config } = props

    // 1. Validation
    if (!image) {
      throw new Error('Please select or upload an image before generating.')
    }
    if (!prompt || prompt.trim() === '') {
      throw new Error('Please provide a scene description prompt.')
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      throw new Error(
        'API key is required. Please ensure the VIDEO_GEN_API_KEY environment variable is set.'
      )
    }

    onProgress?.({
      state: 'preparing',
      stage: 'Encoding input image & preparing request...',
      progress: 10,
    })

    const { imageBytes, mimeType } = await resolveImageInput(image)
    const client = getGenAIClient()

    onProgress?.({
      state: 'submitting',
      stage: `Connecting to Google GenAI (${model})...`,
      progress: 25,
    })

    // 2. Submit generation operation
    let operation = await client.models.generateVideos({
      model,
      source: {
        prompt: prompt.trim(),
        image: {
          imageBytes,
          mimeType,
        },
      },
      config,
    })

    onProgress?.({
      state: 'processing',
      stage: 'Generation operation submitted. Synthesizing video keyframes...',
      progress: 35,
      operationName: operation.name,
    })

    // 3. Polling loop
    let attempts = 0
    const maxAttempts = 60 // Up to ~8 minutes
    const pollIntervalMs = 8000

    while (!operation.done && attempts < maxAttempts) {
      attempts++
      // Progress calculation from 35% up to 90%
      const simulatedProgress = Math.min(
        90,
        Math.round(35 + (attempts / 25) * 55)
      )

      onProgress?.({
        state: 'processing',
        stage: `Synthesizing temporal video frames (Poll #${attempts})...`,
        progress: simulatedProgress,
        operationName: operation.name,
      })

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))

      operation = await client.operations.getVideosOperation({
        operation: operation,
      })

      if (operation.error) {
        const errorMsg = getErrorMessage(
          operation.error,
          JSON.stringify(operation.error)
        )
        throw new Error(`Video generation failed: ${errorMsg}`)
      }
    }

    if (!operation.done) {
      throw new Error(
        'Video generation timed out while waiting for Veo completion.'
      )
    }

    // 4. Download / extract video
    onProgress?.({
      state: 'downloading',
      stage: 'Retrieving generated video stream...',
      progress: 95,
      operationName: operation.name,
    })

    const generatedVideo = operation.response?.generatedVideos?.[0]?.video
    if (!generatedVideo) {
      throw new Error('No video was returned from the generation operation.')
    }

    let videoUrl = ''
    if (generatedVideo.videoBytes) {
      videoUrl = `data:video/mp4;base64,${generatedVideo.videoBytes}`
    } else if (generatedVideo.uri) {
      const uri = generatedVideo.uri
      try {
        videoUrl = await fetchMediaBlobUrl(uri)
      } catch (fetchErr: unknown) {
        console.warn(
          'Direct media download failed, falling back to authenticated uri:',
          fetchErr
        )
        videoUrl = buildAuthenticatedMediaUrl(uri)
      }
    }

    if (!videoUrl) {
      throw new Error('Could not resolve playable video URL from response.')
    }

    onProgress?.({
      state: 'done',
      stage: 'Video synthesis complete! Ready to view.',
      progress: 100,
      videoUrl,
      operationName: operation.name,
    })

    return { videoUrl, operation }
  } catch (error: unknown) {
    const message = getErrorMessage(
      error,
      'An unexpected error occurred during video generation.'
    )
    onProgress?.({
      state: 'error',
      stage: `Failed: ${message}`,
      progress: 0,
      error: message,
    })
    throw error
  }
}
