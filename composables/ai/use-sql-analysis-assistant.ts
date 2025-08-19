import { createAIService } from './base-service'
import { 
  sqlPerformanceAnalysisConfig,
  sqlTransactionAnalysisConfig, 
  sqlDeadlockAnalysisConfig,
  sqlGeneralAnalysisConfig
} from './configs'
import type { AIServiceContext } from './types'

/**
 * SQL分析アシスタント
 * pages/sql/[[id]].vue の askAnalysisAI 関数で使用する専用サービス
 */
export function useSqlAnalysisAssistant() {
  const performanceService = createAIService(sqlPerformanceAnalysisConfig)
  const transactionService = createAIService(sqlTransactionAnalysisConfig)
  const deadlockService = createAIService(sqlDeadlockAnalysisConfig)
  const generalService = createAIService(sqlGeneralAnalysisConfig)

  /**
   * ジャンルに基づいて適切なAIサービスを選択
   * @param genre 分析ジャンル
   * @returns 適切なAIサービス
   */
  function getServiceByGenre(genre: string) {
    switch (genre) {
      case 'PERFORMANCE':
        return performanceService
      case 'TRANSACTION':
        return transactionService
      case 'DEADLOCK':
        return deadlockService
      default:
        return generalService
    }
  }

  /**
   * SQL分析を実行
   * @param userPrompt ユーザーからの質問
   * @param genre 分析ジャンル (PERFORMANCE, TRANSACTION, DEADLOCK, etc.)
   * @param analysisCode 分析対象のSQLコード
   * @param question 問題文
   * @returns AI応答
   */
  async function analyzeSql(
    userPrompt: string,
    genre: string,
    analysisCode: string,
    question: string
  ) {
    const service = getServiceByGenre(genre)
    
    // ジャンル固有のプロンプトを構築
    let enrichedPrompt = buildAnalysisPrompt(userPrompt, genre, analysisCode, question)

    const context: AIServiceContext = {
      genre,
      analysisCode,
      question
    }

    return await service.getResponse(enrichedPrompt, context)
  }

  /**
   * ジャンルに応じた分析プロンプトを構築
   * @param userPrompt ユーザープロンプト
   * @param genre 分析ジャンル
   * @param analysisCode 分析対象コード
   * @param question 問題文
   * @returns 構築されたプロンプト
   */
  function buildAnalysisPrompt(
    userPrompt: string,
    genre: string,
    analysisCode: string,
    question: string
  ): string {
    const baseInfo = `\n問題文: ${question}\n分析対象SQL:\n${analysisCode}\n\nユーザの質問: ${userPrompt}\n-----------------\n`

    switch (genre) {
      case 'PERFORMANCE':
        return `以下のSQLクエリのパフォーマンスを詳しく分析してください。${baseInfo}`
      
      case 'TRANSACTION':
        return `以下のトランザクションを詳しく分析してください。${baseInfo}`
      
      case 'DEADLOCK':
        return `以下のSQLコードのデッドロック可能性を詳しく分析してください。${baseInfo}`
      
      default:
        return `以下のSQLコードを詳しく分析してください。${baseInfo}`
    }
  }

  /**
   * 指定されたジャンルのプロンプト妥当性をチェック
   * @param prompt チェックするプロンプト
   * @param genre ジャンル
   * @returns 妥当性の結果
   */
  function validatePrompt(prompt: string, genre: string): boolean {
    const service = getServiceByGenre(genre)
    return service.validatePrompt(prompt)
  }

  return {
    analyzeSql,
    validatePrompt,
    getServiceByGenre
  }
}