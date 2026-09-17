import { describe, it, expect } from 'vitest'
import { cn, getErrorMessage } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
      expect(cn('px-2', { 'opacity-50': true, 'opacity-0': false })).toBe(
        'px-2 opacity-50'
      )
    })
  })

  describe('getErrorMessage', () => {
    it('extracts message from standard Error', () => {
      const err = new Error('Test error message')
      expect(getErrorMessage(err)).toBe('Test error message')
    })

    it('returns fallback for unknown errors', () => {
      expect(getErrorMessage(null, 'Fallback error')).toBe('Fallback error')
    })
  })
})
