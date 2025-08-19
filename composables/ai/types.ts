/**
 * Types for AI service system
 */

export interface AIPromptConfig {
  /** システムプロンプト */
  systemPrompt: string
  /** 最大出力トークン数 */
  maxTokens: number
  /** プロンプト検証関数 */
  validatePrompt?: (prompt: string) => boolean
  /** モック応答生成関数 */
  generateMockResponse?: (userPrompt: string, context?: any) => string
}

export interface AIServiceContext {
  /** SQLクエリ（オプション） */
  sqlQuery?: string
  /** 質問内容（オプション） */
  question?: string
  /** データベース名（オプション） */
  dbName?: string
  /** ジャンル（オプション） */
  genre?: string
  /** レベル（オプション） */
  level?: number
  /** 分析コード（オプション） */
  analysisCode?: string
}

export interface AIResponse {
  /** AI応答テキスト */
  response: string
  /** エラーがある場合のエラーメッセージ */
  error?: string
  /** 検証警告がある場合 */
  warnings?: string[]
}

export interface GeneratedQuestion {
  id: number
  level: number
  genre: string
  question: string
  answer: string
  DbName: string
  explanation: string
  generated: boolean
  validationWarnings?: string[]
  suggestions?: string[]
  error?: string
}