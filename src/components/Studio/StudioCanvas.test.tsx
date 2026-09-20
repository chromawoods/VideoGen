import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StudioCanvas, type StudioCanvasProps } from './StudioCanvas'

describe('StudioCanvas', () => {
  const defaultProps: StudioCanvasProps = {
    generatedVideoUrl: null,
    selectedImage: null,
    aspectRatio: '16:9' as const,
    resolution: '720p',
    durationSeconds: 4,
    model: 'veo-3.1-lite-generate-preview',
    prompt: '',
    isGenerating: false,
    generationStage: 'Ready',
    progress: 0,
  }

  it('renders resolution in placeholder canvas', () => {
    render(<StudioCanvas {...defaultProps} resolution="720p" />)
    expect(screen.getByText('Resolution: 720p')).toBeInTheDocument()
  })

  it('renders updated resolution when changed', () => {
    render(<StudioCanvas {...defaultProps} resolution="1080p" />)
    expect(screen.getByText('Resolution: 1080p')).toBeInTheDocument()
  })

  it('renders the actual image file name when imageFile is provided', () => {
    render(
      <StudioCanvas
        {...defaultProps}
        selectedImage="blob:http://localhost/image-preview"
        imageFile={{ name: 'custom_source.png', size: '1.2 MB' }}
      />
    )
    expect(screen.getByText('custom_source.png')).toBeInTheDocument()
  })

  it('falls back to source_input.jpg when imageFile is not provided', () => {
    render(
      <StudioCanvas
        {...defaultProps}
        selectedImage="blob:http://localhost/image-preview"
      />
    )
    expect(screen.getByText('source_input.jpg')).toBeInTheDocument()
  })
})
