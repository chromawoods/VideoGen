import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GenerationControls } from './GenerationControls'
import { AVAILABLE_MODELS } from '../../lib/generator'

describe('GenerationControls', () => {
  const defaultProps = {
    model: AVAILABLE_MODELS[0],
    onModelChange: vi.fn(),
    aspectRatio: '16:9' as const,
    onAspectRatioChange: vi.fn(),
    durationSeconds: 4,
    onDurationSecondsChange: vi.fn(),
    prompt: 'Sample prompt',
    onPromptChange: vi.fn(),
    isGenerating: false,
    generationState: 'idle' as const,
    generationStage: 'Ready',
    progress: 0,
    onGenerate: vi.fn(),
  }

  it('renders the duration slider with label and correct range attributes', () => {
    render(<GenerationControls {...defaultProps} />)

    const label = screen.getByText('Duration')
    expect(label).toBeInTheDocument()

    const slider = screen.getByRole('slider')
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

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '8' } })

    expect(onDurationSecondsChange).toHaveBeenCalledWith(8)
  })

  it('disables the slider when isGenerating is true', () => {
    render(<GenerationControls {...defaultProps} isGenerating={true} />)

    const slider = screen.getByRole('slider')
    expect(slider).toBeDisabled()
  })
})
