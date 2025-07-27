// server/api/openai.post.ts
// PROMPT-004: Enhanced OpenAI API with backward compatibility
import { defineEventHandler, readBody, createError } from 'h3'

interface LegacyRequest {
  prompt: string
}

interface EnhancedRequest {
  userPrompt?: string
  prompt?: string // for backward compatibility
  context?: {
    question?: string
    database?: string
    explanation?: string[]
  }
  options?: {
    includeReasoning?: boolean
    includeSuggestions?: boolean
    maxTokens?: number
    temperature?: number
    systemMessage?: string
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body: EnhancedRequest = await readBody(event)
    const config = useRuntimeConfig()
    
    if (!config.openaiApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'OpenAI API key not configured'
      })
    }

    // Support both legacy and enhanced format
    const userPrompt = body.userPrompt || body.prompt
    if (!userPrompt) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Prompt is required'
      })
    }

    // Build enhanced prompt if context is provided
    const enhancedPrompt = body.context ? buildContextualPrompt(userPrompt, body.context) : userPrompt
    
    console.log("Enhanced prompt:", enhancedPrompt)
    
    // Extract options with defaults
    const options = body.options || {}
    const maxTokens = options.maxTokens || 2000
    const temperature = options.temperature || 0.3
    const systemMessage = options.systemMessage || 'あなたはSQL学習支援AIです。日本語で回答し、初心者にも理解しやすい説明を心がけてください。'

    const response: any = await $fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: enhancedPrompt },
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      }
    })

    const rawContent = response.choices[0].message.content
    
    // If enhanced features are requested, parse structured response
    if (options.includeReasoning || options.includeSuggestions) {
      return parseStructuredResponse(rawContent, options)
    }
    
    // Return simple string for backward compatibility
    return rawContent
    
  } catch (error) {
    console.error('Error fetching from OpenAI API:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    return { error: 'OpenAI APIの呼び出しに失敗しました。しばらく時間をおいて再試行してください。' }
  }
})

function buildContextualPrompt(userPrompt: string, context: any): string {
  let prompt = `【ユーザーの質問】\n${userPrompt}\n\n`
  
  if (context.question || context.database) {
    prompt += `【問題の文脈】\n`
    if (context.question) {
      prompt += `- 問題: ${context.question}\n`
    }
    if (context.database) {
      prompt += `- データベース: ${context.database}\n`
    }
    prompt += '\n'
  }
  
  // Add explanation context if available
  if (context.explanation && Array.isArray(context.explanation) && context.explanation.length > 0) {
    prompt += `【参考情報】\n`
    context.explanation.forEach((exp: string, index: number) => {
      prompt += `${index + 1}. ${exp}\n`
    })
    prompt += '\n'
  }
  
  return prompt
}

function parseStructuredResponse(rawResponse: string, options: any) {
  try {
    // Try to parse structured response with sections
    const answerMatch = rawResponse.match(/【回答】\s*([\s\S]*?)(?=【|$)/)
    const reasoningMatch = rawResponse.match(/【推論過程】\s*([\s\S]*?)(?=【|$)/)
    const suggestionsMatch = rawResponse.match(/【関連学習項目】\s*([\s\S]*?)(?=【|$)/)
    
    const result: any = {
      answer: answerMatch ? answerMatch[1].trim() : rawResponse
    }
    
    if (reasoningMatch && options.includeReasoning) {
      result.reasoning = reasoningMatch[1].trim()
    }
    
    if (suggestionsMatch && options.includeSuggestions) {
      const suggestionText = suggestionsMatch[1].trim()
      result.suggestions = suggestionText
        .split(/\n|・|\-/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
    }
    
    return result
  } catch (error) {
    console.warn('Failed to parse structured response, returning raw response')
    return { answer: rawResponse }
  }
}
