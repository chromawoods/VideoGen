import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  GenerationControls,
  type GenerationControlsProps,
} from './GenerationControls'
import { AVAILABLE_MODELS } from '../../lib/generator'

describe('GenerationControls', () => {
  const defaultProps: GenerationControlsProps = {
    model: AVAILABLE_MODELS[0],
    onModelChange: vi.fn(),
    aspectRatio: '16:9' as const,
    onAspectRatioChange: vi.fn(),
    resolution: '720p',
    onResolutionChange: vi.fn(),
    durationSeconds: 4,
    onDurationSecondsChange: vi.fn(),
    fps: 24,
    onFpsChange: vi.fn(),
    prompt: 'Sample prompt',
    onPromptChange: vi.fn(),
    isGenerating: false,
    generationState: 'idle' as const,
    generationStage: 'Ready',
    progress: 0,
    onGenerate: vi.fn(),
  }

  it('renders resolution buttons with label and default active state', () => {
    render(<GenerationControls {...defaultProps} />)

    const label = screen.getByText('Resolution')
    expect(label).toBeInTheDocument()

    const res720Btn = screen.getByRole('button', { name: '720p' })
    const res1080Btn = screen.getByRole('button', { name: '1080p' })
    expect(res720Btn).toBeInTheDocument()
    expect(res1080Btn).toBeInTheDocument()
    expect(res720Btn).toHaveClass('bg-purple-600')
    expect(res1080Btn).not.toHaveClass('bg-purple-600')
  })

  it('calls onResolutionChange when resolution button is clicked', () => {
    const onResolutionChange = vi.fn()
    render(
      <GenerationControls
        {...defaultProps}
        onResolutionChange={onResolutionChange}
      />
    )

    const res1080Btn = screen.getByRole('button', { name: '1080p' })
    fireEvent.click(res1080Btn)

    expect(onResolutionChange).toHaveBeenCalledWith('1080p')
  })

  it('disables the resolution buttons when isGenerating is true', () => {
    render(<GenerationControls {...defaultProps} isGenerating={true} />)

    const res720Btn = screen.getByRole('button', { name: '720p' })
    const res1080Btn = screen.getByRole('button', { name: '1080p' })
    expect(res720Btn).toBeDisabled()
    expect(res1080Btn).toBeDisabled()
  })

  it('renders the duration slider with label and correct range attributes', () => {
    render(<GenerationControls {...defaultProps} />)

    const label = screen.getByText('Duration')
    expect(label).toBeInTheDocument()

    const slider = screen.getByRole('slider', { name: /duration/i })
    expect(slider).toBeInTheDocument()
    expect(slider).toHaveAttribute('min', '1')
    expect(slider).toHaveAttribute('max', '12')
    expect(slider).toHaveAttribute('step', '1')
    expect(slider).toHaveValue('4')
    expect(screen.getByText('4s')).toBeInTheDocument()
  })

  it('calls onDurationSecondsChange with integer value when slider changes', () => {
    const onDurationSecondsChange = vi.fn()
    render(
      <GenerationControls
        {...defaultProps}
        onDurationSecondsChange={onDurationSecondsChange}
      />
    )

    const slider = screen.getByRole('slider', { name: /duration/i })
    fireEvent.change(slider, { target: { value: '8' } })

    expect(onDurationSecondsChange).toHaveBeenCalledWith(8)
  })

  it('renders the fps slider with label and correct range attributes', () => {
    render(<GenerationControls {...defaultProps} />)

    const label = screen.getByText('Frame Rate')
    expect(label).toBeInTheDocument()

    const slider = screen.getByRole('slider', { name: /frame rate/i })
    expect(slider).toBeInTheDocument()
    expect(slider).toHaveAttribute('min', '1')
    expect(slider).toHaveAttribute('max', '60')
    expect(slider).toHaveAttribute('step', '1')
    expect(slider).toHaveValue('24')
    expect(screen.getByText('24 FPS')).toBeInTheDocument()
  })

  it('calls onFpsChange with integer value when fps slider changes', () => {
    const onFpsChange = vi.fn()
    render(<GenerationControls {...defaultProps} onFpsChange={onFpsChange} />)

    const slider = screen.getByRole('slider', { name: /frame rate/i })
    fireEvent.change(slider, { target: { value: '30' } })

    expect(onFpsChange).toHaveBeenCalledWith(30)
  })

  it('disables the sliders when isGenerating is true', () => {
    render(<GenerationControls {...defaultProps} isGenerating={true} />)

    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(2)
    sliders.forEach((slider) => expect(slider).toBeDisabled())
  })
})
