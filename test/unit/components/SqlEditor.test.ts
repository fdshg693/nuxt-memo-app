import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SqlEditor from '~/components/SqlEditor.vue'

// AiPromptModalをモック
vi.mock('~/components/AiPromptModal.vue', () => ({
  default: {
    name: 'AiPromptModal',
    template: '<div data-testid="ai-prompt-modal">AI Modal</div>',
    props: ['isAiLoading'],
    emits: ['ask-ai']
  }
}))

describe('SqlEditor', () => {
  it('should render SQL input textarea', () => {
    const wrapper = mount(SqlEditor, {
      props: {
        modelValue: '',
        isAiLoading: false,
        showAiPromptModal: true
      }
    })
    
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('button').text()).toContain('実行')
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('ここにSQLを入力')
  })

  it('should emit update:modelValue when SQL is changed', async () => {
    const wrapper = mount(SqlEditor, {
      props: {
        modelValue: '',
        isAiLoading: false
      }
    })
    
    const textarea = wrapper.find('textarea')
    await textarea.setValue('SELECT * FROM users')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['SELECT * FROM users'])
  })

  it('should emit execute event when execute button is clicked', async () => {
    const wrapper = mount(SqlEditor, {
      props: {
        modelValue: 'SELECT * FROM users',
        isAiLoading: false
      }
    })
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('execute')).toBeTruthy()
  })

  it('should display current SQL value in textarea', () => {
    const testSql = 'SELECT name FROM users WHERE age > 25'
    const wrapper = mount(SqlEditor, {
      props: {
        modelValue: testSql,
        isAiLoading: false
      }
    })
    
    expect(wrapper.find('textarea').element.value).toBe(testSql)
  })

  it('should show AI prompt modal when showAiPromptModal is not false', () => {
    const wrapper = mount(SqlEditor, {
      props: {
        modelValue: '',
        isAiLoading: false,
        showAiPromptModal: true
      }
    })
    
    expect(wrapper.find('[data-testid="ai-prompt-modal"]').exists()).toBe(true)
  })

  it('should hide AI prompt modal when showAiPromptModal is false', () => {
    const wrapper = mount(SqlEditor, {
      props: {
        modelValue: '',
        isAiLoading: false,
        showAiPromptModal: false
      }
    })
    
    expect(wrapper.find('[data-testid="ai-prompt-modal"]').exists()).toBe(false)
  })

  it('should pass isAiLoading prop to AiPromptModal', () => {
    const wrapper = mount(SqlEditor, {
      props: {
        modelValue: '',
        isAiLoading: true,
        showAiPromptModal: true
      }
    })
    
    const aiModal = wrapper.findComponent({ name: 'AiPromptModal' })
    expect(aiModal.props('isAiLoading')).toBe(true)
  })

  it('should emit ask-ai event when AiPromptModal emits ask-ai', async () => {
    const wrapper = mount(SqlEditor, {
      props: {
        modelValue: '',
        isAiLoading: false,
        showAiPromptModal: true
      }
    })
    
    const aiModal = wrapper.findComponent({ name: 'AiPromptModal' })
    await aiModal.vm.$emit('ask-ai', 'test prompt')
    
    expect(wrapper.emitted('ask-ai')).toBeTruthy()
    expect(wrapper.emitted('ask-ai')?.[0]).toEqual(['test prompt'])
  })
})