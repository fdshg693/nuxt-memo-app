import { createAIService } from './base-service'
import { sqlQuizAssistantConfig } from './configs'
import type { AIServiceContext } from './types'

/**
 * SQLクイズ質問アシスタント
 * pages/sql/[[id]].vue の askAI 関数で使用する専用サービス
 */
export function useSqlQuizAssistant() {
  const service = createAIService(sqlQuizAssistantConfig)

  /**
   * SQLクイズに関する質問への回答を取得
   * @param userPrompt ユーザーからの質問
   * @param sqlQuery 分析対象のSQLクエリ
   * @param question 問題文
   * @param databasesInfo データベース情報
   * @returns AI応答
   */
  async function askSqlQuestion(
    userPrompt: string,
    sqlQuery?: string,
    question?: string,
    databasesInfo?: string
  ) {
    // コンテキスト情報を構築
    let enrichedPrompt = userPrompt
    if (databasesInfo) {
      enrichedPrompt = `${userPrompt}\n\n利用可能なデータベース情報:\n${databasesInfo}`
    }

    const context: AIServiceContext = {
      sqlQuery,
      question
    }

    return await service.getResponse(enrichedPrompt, context)
  }

  return {
    askSqlQuestion,
    validatePrompt: service.validatePrompt
  }
}