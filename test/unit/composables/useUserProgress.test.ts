import { describe, it, expect } from 'vitest'

describe('useUserProgress', () => {
  it('should export the correct functions', async () => {
    const { useUserProgress } = await import('~/composables/useUserProgress')
    const progress = useUserProgress()
    
    expect(typeof progress.initializeProgress).toBe('function')
    expect(typeof progress.recordCorrectAnswer).toBe('function')
    expect(typeof progress.isQuestionAnsweredCorrectly).toBe('function')
    expect(typeof progress.getProgressByGenre).toBe('function')
    expect(typeof progress.clearProgress).toBe('function')
  })
})