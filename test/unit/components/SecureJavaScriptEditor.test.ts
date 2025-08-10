import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SecureJavaScriptEditor from '~/components/SecureJavaScriptEditor.vue'

// Mock the composable
const mockExecuteCode = vi.fn()
const mockTerminateExecution = vi.fn()
const mockClearResults = vi.fn()
const mockInitializeSandbox = vi.fn()

vi.mock('~/composables/useSecureJavaScriptExecution', () => ({
  useSecureJavaScriptExecution: () => ({
    isReady: { value: true },
    isExecuting: { value: false },
    results: { value: [] },
    error: { value: '' },
    executeCode: mockExecuteCode,
    terminateExecution: mockTerminateExecution,
    clearResults: mockClearResults,
    initializeSandbox: mockInitializeSandbox
  })
}))

describe('SecureJavaScriptEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render security status indicator', () => {
    const wrapper = mount(SecureJavaScriptEditor, {
      props: { modelValue: '' }
    })

    expect(wrapper.text()).toContain('セキュア実行環境')
    expect(wrapper.text()).toContain('iframe sandbox + WebWorker')
  })

  it('should render security features details', () => {
    const wrapper = mount(SecureJavaScriptEditor, {
      props: { modelValue: '' }
    })

    expect(wrapper.text()).toContain('セキュリティ機能の詳細')
    expect(wrapper.text()).toContain('iframe sandbox（allow-same-origin無効）')
    expect(wrapper.text()).toContain('fetch/XMLHttpRequest等のネットワークAPI無効化')
  })

  it('should have execute button that calls secure execution', async () => {
    const wrapper = mount(SecureJavaScriptEditor, {
      props: { modelValue: 'console.log("test")' }
    })

    const executeButton = wrapper.find('button:contains("安全実行")')
    await executeButton.trigger('click')

    expect(mockExecuteCode).toHaveBeenCalledWith('console.log("test")')
  })

  it('should have terminate button that calls termination', async () => {
    const wrapper = mount(SecureJavaScriptEditor, {
      props: { modelValue: '' }
    })

    const terminateButton = wrapper.find('button:contains("停止")')
    await terminateButton.trigger('click')

    expect(mockTerminateExecution).toHaveBeenCalled()
  })

  it('should have clear button that clears results', async () => {
    const wrapper = mount(SecureJavaScriptEditor, {
      props: { modelValue: '' }
    })

    const clearButton = wrapper.find('button:contains("クリア")')
    await clearButton.trigger('click')

    expect(mockClearResults).toHaveBeenCalled()
  })

  it('should emit update when textarea value changes', async () => {
    const wrapper = mount(SecureJavaScriptEditor, {
      props: { modelValue: 'initial' }
    })

    const textarea = wrapper.find('textarea')
    await textarea.setValue('new code')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['new code'])
  })

  it('should initialize sandbox on mount', () => {
    mount(SecureJavaScriptEditor, {
      props: { modelValue: '' }
    })

    expect(mockInitializeSandbox).toHaveBeenCalled()
  })

  it('should disable textarea when executing', () => {
    // Mock executing state
    vi.mocked(vi.importActual('~/composables/useSecureJavaScriptExecution')).useSecureJavaScriptExecution = () => ({
      isReady: { value: true },
      isExecuting: { value: true },
      results: { value: [] },
      error: { value: '' },
      executeCode: mockExecuteCode,
      terminateExecution: mockTerminateExecution,
      clearResults: mockClearResults,
      initializeSandbox: mockInitializeSandbox
    })

    const wrapper = mount(SecureJavaScriptEditor, {
      props: { modelValue: '' }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('disabled')).toBeDefined()
  })
})