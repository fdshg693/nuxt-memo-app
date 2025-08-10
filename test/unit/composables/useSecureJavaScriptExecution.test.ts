import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSecureJavaScriptExecution } from '~/composables/useSecureJavaScriptExecution'

// Mock DOM methods
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => ({
      sandbox: { add: vi.fn() },
      style: {},
      contentWindow: {},
      onload: null,
      onerror: null
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    }
  }
})

Object.defineProperty(global, 'window', {
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    Worker: vi.fn(),
    URL: {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn()
    },
    Blob: vi.fn()
  }
})

describe('useSecureJavaScriptExecution', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with correct default values', () => {
    const { isReady, isExecuting, results, error } = useSecureJavaScriptExecution()

    expect(isReady.value).toBe(false)
    expect(isExecuting.value).toBe(false)
    expect(results.value).toEqual([])
    expect(error.value).toBe('')
  })

  it('should create iframe with correct sandbox attributes', async () => {
    const mockCreateElement = vi.mocked(document.createElement)
    const mockIframe = {
      sandbox: { add: vi.fn() },
      style: {},
      contentWindow: {},
      onload: null,
      onerror: null
    }
    mockCreateElement.mockReturnValue(mockIframe as any)

    const { initializeSandbox } = useSecureJavaScriptExecution()
    
    // Mock iframe load
    setTimeout(() => {
      if (mockIframe.onload) mockIframe.onload()
    }, 0)

    await initializeSandbox()

    expect(mockCreateElement).toHaveBeenCalledWith('iframe')
    expect(mockIframe.sandbox.add).toHaveBeenCalledWith('allow-scripts')
    expect(document.body.appendChild).toHaveBeenCalledWith(mockIframe)
  })

  it('should clear results when clearResults is called', () => {
    const { results, error, clearResults } = useSecureJavaScriptExecution()

    // Set some initial values
    results.value = [{ type: 'log', args: 'test' }] as any
    error.value = 'some error'

    clearResults()

    expect(results.value).toEqual([])
    expect(error.value).toBe('')
  })

  it('should handle sandbox initialization timeout', async () => {
    const mockCreateElement = vi.mocked(document.createElement)
    const mockIframe = {
      sandbox: { add: vi.fn() },
      style: {},
      contentWindow: {},
      onload: null,
      onerror: null
    }
    mockCreateElement.mockReturnValue(mockIframe as any)

    const { initializeSandbox } = useSecureJavaScriptExecution()

    // Don't trigger onload to simulate timeout
    await expect(initializeSandbox()).rejects.toThrow('サンドボックスの初期化がタイムアウトしました')
  })

  it('should clean up properly', () => {
    const mockRemoveEventListener = vi.mocked(window.removeEventListener)
    const mockRemoveChild = vi.mocked(document.body.removeChild)

    const { cleanup } = useSecureJavaScriptExecution()
    cleanup()

    expect(mockRemoveEventListener).toHaveBeenCalled()
  })

  it('should handle execution when not ready', async () => {
    const { executeCode, error } = useSecureJavaScriptExecution()

    await executeCode('console.log("test")')

    // Should attempt to initialize sandbox when not ready
    expect(error.value).toBe('')
  })

  it('should prevent concurrent executions', async () => {
    const { executeCode, error, isExecuting } = useSecureJavaScriptExecution()

    // Simulate executing state
    isExecuting.value = true

    await executeCode('console.log("test")')

    expect(error.value).toBe('既に実行中のコードがあります')
  })
})