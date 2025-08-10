import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import JavaScriptEditor from '~/components/JavaScriptEditor.vue'

describe('JavaScriptEditor', () => {
  it('should render the component with initial properties', () => {
    const wrapper = mount(JavaScriptEditor, {
      props: {
        modelValue: 'console.log("test");'
      }
    })

    expect(wrapper.find('h2').text()).toBe('JavaScriptを実行する')
    expect(wrapper.find('textarea').element.value).toBe('console.log("test");')
    expect(wrapper.find('button').text().trim()).toBe('実行')
    expect(wrapper.findAll('button')[1].text().trim()).toBe('クリア')
  })

  it('should emit update:modelValue when textarea value changes', async () => {
    const wrapper = mount(JavaScriptEditor, {
      props: {
        modelValue: ''
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.setValue('let x = 5;')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['let x = 5;'])
  })

  it('should emit execute event when execute button is clicked', async () => {
    const wrapper = mount(JavaScriptEditor, {
      props: {
        modelValue: 'console.log("test");'
      }
    })

    const executeButton = wrapper.find('button')
    await executeButton.trigger('click')

    expect(wrapper.emitted('execute')).toBeTruthy()
  })

  it('should emit clear event when clear button is clicked', async () => {
    const wrapper = mount(JavaScriptEditor, {
      props: {
        modelValue: 'console.log("test");'
      }
    })

    const clearButton = wrapper.findAll('button')[1]
    await clearButton.trigger('click')

    expect(wrapper.emitted('clear')).toBeTruthy()
  })

  it('should have proper placeholder text', () => {
    const wrapper = mount(JavaScriptEditor, {
      props: {
        modelValue: ''
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('placeholder')).toBe('ここにJavaScriptコードを入力してください')
  })

  it('should have proper styling classes', () => {
    const wrapper = mount(JavaScriptEditor, {
      props: {
        modelValue: ''
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.classes()).toContain('w-full')
    expect(textarea.classes()).toContain('border-purple-200')
    expect(textarea.classes()).toContain('font-mono')
    expect(textarea.classes()).toContain('bg-indigo-50')
  })
})