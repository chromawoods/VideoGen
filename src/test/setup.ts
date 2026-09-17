import '@testing-library/jest-dom/vitest'
import { vi, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Automatic cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Stub browser URL object methods for happy-dom
URL.createObjectURL = vi.fn(
  (_blob: Blob | MediaSource) => 'blob:http://localhost/mock-blob-url'
)
URL.revokeObjectURL = vi.fn()

// Stub HTMLMediaElement playback controls for video preview components
if (typeof HTMLMediaElement !== 'undefined') {
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  HTMLMediaElement.prototype.pause = vi.fn()
  HTMLMediaElement.prototype.load = vi.fn()
}
