import { ref } from 'vue'
import promptTemplates from '@/data/promptTemplates.json'

// Prompt template types
interface PromptVariable {
  name: string
  type: 'string' | 'number' | 'boolean'
  description: string
  required: boolean
}

interface PromptTemplate {
  id: string
  name: string
  category: 'explanation' | 'hint' | 'debug' | 'alternative' | 'optimization'
  template: string
  variables: PromptVariable[]
  explanationSources: string[]
}

export function usePromptTemplates() {
  const templates = ref<PromptTemplate[]>([])

  async function loadTemplates() {
    templates.value = promptTemplates as PromptTemplate[]
  }

  function getTemplateById(id: string): PromptTemplate | undefined {
    return templates.value.find(template => template.id === id)
  }

  function getTemplatesByCategory(category: PromptTemplate['category']): PromptTemplate[] {
    return templates.value.filter(template => template.category === category)
  }

  function interpolateTemplate(templateId: string, variables: Record<string, any>): string {
    const template = getTemplateById(templateId)
    if (!template) {
      throw new Error(`Template with id "${templateId}" not found`)
    }

    let result = template.template

    // Replace placeholders with actual values
    template.variables.forEach(variable => {
      const value = variables[variable.name]
      
      // Check required variables
      if (variable.required && (value === undefined || value === null || value === '')) {
        throw new Error(`Required variable "${variable.name}" is missing`)
      }

      // Replace placeholder
      const placeholder = `{${variable.name}}`
      const replacement = value !== undefined ? String(value) : ''
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement)
    })

    return result
  }

  return {
    templates,
    loadTemplates,
    getTemplateById,
    getTemplatesByCategory,
    interpolateTemplate
  }
}