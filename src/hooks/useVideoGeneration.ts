import { useState, useEffect } from 'react'
import {
  generateVideoFromImage,
  ImageToVideoConfig,
  GenerationState,
  AVAILABLE_MODELS,
  getApiKey,
} from '../lib/generator'
import { getErrorMessage } from '../lib/utils'

export interface GenerateVideoParams {
  model: (typeof AVAILABLE_MODELS)[number]
  prompt: string
  image: string | File | Blob
  aspectRatio: '16:9' | '9:16'
  apiKey?: string
}

export function useVideoGeneration() {
  const [generationState, setGenerationState] =
    useState<GenerationState>('idle')
  const [generationStage, setGenerationStage] = useState('Ready for synthesis')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(
    null
  )

  // Automatically revoke previous video blob URL when generatedVideoUrl changes or unmounts
  useEffect(() => {
    return () => {
      if (generatedVideoUrl && generatedVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(generatedVideoUrl)
      }
    }
  }, [generatedVideoUrl])

  const isGenerating =
    generationState === 'preparing' ||
    generationState === 'submitting' ||
    generationState === 'processing' ||
    generationState === 'downloading'

  const generateVideo = async ({
    model,
    prompt,
    image,
    aspectRatio,
    apiKey,
  }: GenerateVideoParams): Promise<boolean> => {
    if (isGenerating) return false
    setErrorMessage(null)

    // Validation
    if (!image) {
      setErrorMessage(
        'Please select or drag-drop an input image to begin video synthesis.'
      )
      return false
    }

    if (!prompt.trim()) {
      setErrorMessage(
        'Please provide a scene description prompt describing the motion.'
      )
      return false
    }

    const resolvedApiKey = getApiKey(apiKey)
    if (!resolvedApiKey) {
      setErrorMessage(
        'API key is required. Please ensure the VIDEO_GEN_API_KEY environment variable is set or configure one in the header.'
      )
      return false
    }

    setGenerationState('preparing')
    setProgress(5)
    setGenerationStage('Preparing video generation request...')
    setGeneratedVideoUrl(null)

    try {
      const config: ImageToVideoConfig = {
        input: {
          model,
          prompt: prompt.trim(),
          image,
        },
        output: {
          durationSeconds: 4,
          resolution: '720p',
          aspectRatio,
        },
        apiKey: resolvedApiKey,
      }

      const result = await generateVideoFromImage(config, (progressUpdate) => {
        setGenerationState(progressUpdate.state)
        setGenerationStage(progressUpdate.stage)
        setProgress(progressUpdate.progress)
      })

      setGeneratedVideoUrl(result.videoUrl)
      setGenerationState('done')
      setGenerationStage('Video generated successfully!')
      return true
    } catch (err: unknown) {
      console.error('Video generation error:', err)
      setGenerationState('error')
      setErrorMessage(
        getErrorMessage(err, 'An error occurred during video generation.')
      )
      return false
    }
  }

  const clearError = () => setErrorMessage(null)
  const resetGeneration = () => {
    setGenerationState('idle')
    setGenerationStage('Ready for synthesis')
    setProgress(0)
    setGeneratedVideoUrl(null)
    setErrorMessage(null)
  }

  return {
    generationState,
    generationStage,
    progress,
    errorMessage,
    setErrorMessage,
    clearError,
    generatedVideoUrl,
    setGeneratedVideoUrl,
    isGenerating,
    generateVideo,
    resetGeneration,
  }
}
