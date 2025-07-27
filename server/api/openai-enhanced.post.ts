// server/api/openai-enhanced.post.ts
// PROMPT-004: Enhanced OpenAI API with improved prompt processing
import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'

// Input validation schema
const EnhancedPromptRequestSchema = z.object({
  userPrompt: z.string().min(1, 'User prompt is required'),
  templateId: z.string().optional(),
  context: z.object({
    question: z.string(),
    database: z.string(),
    explanation: z.array(z.string()).optional(),
  }),
  options: z.object({
    includeReasoning: z.boolean().default(false),
    includeSuggestions: z.boolean().default(false),
    maxTokens: z.number().min(100).max(4000).default(2000),
    temperature: z.number().min(0).max(2).default(0.3),
  }).optional(),
})

type EnhancedPromptRequest = z.infer<typeof EnhancedPromptRequestSchema>

interface PromptResponse {
  answer: string
  reasoning?: string
  suggestions?: string[]
  error?: string
}

export default defineEventHandler(async (event): Promise<PromptResponse> => {
  try {
    // Parse and validate request body
    const rawBody = await readBody(event)
    const body = EnhancedPromptRequestSchema.parse(rawBody)
    
    const config = useRuntimeConfig()
    
    if (!config.openaiApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'OpenAI API key not configured'
      })
    }

    // Build enhanced prompt with context integration
    const enhancedPrompt = buildEnhancedPrompt(body)
    
    console.log("Enhanced prompt:", enhancedPrompt)
    
    const options = body.options || {}
    
    const response: any = await $fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'あなたはSQL学習支援AIです。日本語で回答し、初心者にも理解しやすい説明を心がけてください。',
          },
          {
            role: 'user',
            content: enhancedPrompt,
          },
        ],
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.3,
      }
    })

    const rawAnswer = response.choices[0].message.content
    
    // Parse structured response if reasoning/suggestions are requested
    const parsedResponse = parseStructuredResponse(rawAnswer, options)
    
    return parsedResponse
    
  } catch (error) {
    console.error('Error in enhanced OpenAI API:', error)
    
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request format',
        data: error.errors
      })
    }
    
    if (error.statusCode) {
      throw error
    }
    
    return {
      answer: '',
      error: 'OpenAI APIの呼び出しに失敗しました。しばらく時間をおいて再試行してください。'
    }
  }
})

function buildEnhancedPrompt(body: EnhancedPromptRequest): string {
  const { userPrompt, context, options } = body
  
  let prompt = `【ユーザーの質問】\n${userPrompt}\n\n`
  
  // Add context information
  prompt += `【問題の文脈】\n`
  prompt += `- 問題: ${context.question}\n`
  prompt += `- データベース: ${context.database}\n`
  
  // Add explanation context if available
  if (context.explanation && context.explanation.length > 0) {
    prompt += `\n【参考情報】\n`
    context.explanation.forEach((exp, index) => {
      prompt += `${index + 1}. ${exp}\n`
    })
  }
  
  // Add response format instructions
  prompt += `\n【回答形式】\n`
  
  if (options?.includeReasoning || options?.includeSuggestions) {
    prompt += `以下の形式で回答してください:\n\n`
    prompt += `【回答】\n(メインの回答内容)\n\n`
    
    if (options.includeReasoning) {
      prompt += `【推論過程】\n(なぜその答えになるかの理由)\n\n`
    }
    
    if (options.includeSuggestions) {
      prompt += `【関連学習項目】\n(関連して学習すると良い内容や項目)\n`
    }
  } else {
    prompt += `Markdown形式で分かりやすく回答してください。`
  }
  
  return prompt
}

function parseStructuredResponse(rawResponse: string, options: any): PromptResponse {
  const result: PromptResponse = { answer: rawResponse }
  
  if (!options?.includeReasoning && !options?.includeSuggestions) {
    return result
  }
  
  try {
    // Try to parse structured response
    const answerMatch = rawResponse.match(/【回答】\s*([\s\S]*?)(?=【|$)/)
    const reasoningMatch = rawResponse.match(/【推論過程】\s*([\s\S]*?)(?=【|$)/)
    const suggestionsMatch = rawResponse.match(/【関連学習項目】\s*([\s\S]*?)(?=【|$)/)
    
    if (answerMatch) {
      result.answer = answerMatch[1].trim()
    }
    
    if (reasoningMatch && options.includeReasoning) {
      result.reasoning = reasoningMatch[1].trim()
    }
    
    if (suggestionsMatch && options.includeSuggestions) {
      // Parse suggestions as array (split by line breaks or bullet points)
      const suggestionText = suggestionsMatch[1].trim()
      result.suggestions = suggestionText
        .split(/\n|・|\-/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
    }
  } catch (error) {
    console.warn('Failed to parse structured response, returning raw response')
  }
  
  return result
}