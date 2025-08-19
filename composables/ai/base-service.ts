import { useAI } from '../useAI'
import type { AIPromptConfig, AIServiceContext, AIResponse } from './types'

/**
 * Base AI service for specialized use cases
 * 各AI用途に特化したサービスのベースクラス
 */
export function createAIService(config: AIPromptConfig) {
  const { callOpenAIWithMock } = useAI()

  /**
   * AI応答を取得する
   * @param userPrompt ユーザーからの入力
   * @param context 追加のコンテキスト情報
   * @returns AI応答またはエラー
   */
  async function getResponse(userPrompt: string, context?: AIServiceContext): Promise<AIResponse> {
    try {
      // プロンプト検証
      if (config.validatePrompt && !config.validatePrompt(userPrompt)) {
        return {
          response: '',
          error: 'SQLに関する質問のみ受け付けています。'
        }
      }

      // モック応答の生成
      const mockResponse = config.generateMockResponse 
        ? config.generateMockResponse(userPrompt, context)
        : '標準的なモック応答です。'

      // AI API呼び出し
      const aiResponse = await callOpenAIWithMock(
        config.systemPrompt,
        userPrompt,
        mockResponse,
        config.maxTokens
      )

      return {
        response: aiResponse
      }
    } catch (error) {
      console.error('AI service error:', error)
      return {
        response: '',
        error: 'AIからの応答に失敗しました。'
      }
    }
  }

  /**
   * プロンプトの妥当性をチェック
   * @param prompt チェックするプロンプト
   * @returns 妥当性の結果
   */
  function validatePrompt(prompt: string): boolean {
    if (config.validatePrompt) {
      return config.validatePrompt(prompt)
    }
    return true
  }

  return {
    getResponse,
    validatePrompt,
    config
  }
}