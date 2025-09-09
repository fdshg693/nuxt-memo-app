import { createAIService } from './base-service'
import { sqlQuestionGenerationConfig } from './configs'
import { useDatabaseValidation } from '../useDatabaseValidation'
import type { AIServiceContext, GeneratedQuestion } from './types'

/**
 * SQL問題生成アシスタント
 * server/api/generate-question.post.ts で使用する専用サービス
 */
export function useSqlQuestionGenerator() {
  const service = createAIService(sqlQuestionGenerationConfig)
  const {
    validateTable,
    getAvailableTables,
    getDatabaseSchemaForPrompt,
    validateGeneratedQuestion
  } = useDatabaseValidation()

  /**
   * SQL問題を生成
   * @param genre ジャンル
   * @param level レベル (1-5)
   * @param dbName データベース名 (オプション)
   * @returns 生成された問題またはエラー
   */
  async function generateQuestion(
    genre: string,
    level: number,
    dbName?: string
  ): Promise<GeneratedQuestion> {
    try {
      // パラメータ検証
      if (!genre || !level) {
        throw new Error('ジャンルとレベルを指定してください。')
      }

      // データベース名の検証
      if (dbName && !validateTable(dbName)) {
        throw new Error(`指定されたテーブル '${dbName}' が存在しません。`)
      }

      // 使用するテーブルを決定
      const selectedTable = dbName || getAvailableTables()[0]

      // システムプロンプトにデータベーススキーマ情報を追加
      const enhancedSystemPrompt = `${service.config.systemPrompt}

${getDatabaseSchemaForPrompt(dbName)}`

      // プロンプトを構築
      const prompt = buildGenerationPrompt(genre, level, selectedTable)

      const context: AIServiceContext = {
        genre,
        level,
        dbName: selectedTable
      }

      // AI サービスを一時的に強化されたシステムプロンプトで使用
      const enhancedConfig = {
        ...service.config,
        systemPrompt: enhancedSystemPrompt
      }
      const enhancedService = createAIService(enhancedConfig)

      // AI応答を取得
      const response = await enhancedService.getResponse(prompt, context)

      if (response.error) {
        throw new Error(response.error)
      }

      // JSON応答をパース
      const parsedResponse = parseAIResponse(response.response)

      // 問題オブジェクトを作成
      const generatedQuestion: GeneratedQuestion = {
        id: Date.now(), // 一時的なID
        level: level,
        genre: genre,
        question: parsedResponse.question,
        answer: parsedResponse.answer,
        DbName: selectedTable,
        explanation: parsedResponse.explanation,
        generated: true
      }

      // 生成された問題を検証
      const validation = validateGeneratedQuestion(generatedQuestion)

      if (!validation.isValid) {
        console.warn('Generated question validation failed:', validation.errors)
        generatedQuestion.validationWarnings = validation.errors
        generatedQuestion.suggestions = validation.suggestions
      }

      return generatedQuestion

    } catch (error) {
      console.error('Error generating SQL question:', error)

      // エラー時のフォールバック応答
      return {
        id: Date.now(),
        level: level,
        genre: genre,
        question: `${genre}に関するレベル${level}の問題を生成中にエラーが発生しました。`,
        answer: `-- Generated question parsing failed`,
        DbName: dbName || getAvailableTables()[0],
        explanation: 'AIの応答をパースできませんでした。',
        generated: true,
        error: error instanceof Error ? error.message : 'SQL問題の生成に失敗しました。'
      }
    }
  }

  /**
   * 問題生成用のプロンプトを構築
   * @param genre ジャンル
   * @param level レベル
   * @param selectedTable 選択されたテーブル
   * @returns 構築されたプロンプト
   */
  function buildGenerationPrompt(genre: string, level: number, selectedTable: string): string {
    const levelDescriptions: Record<number, string> = {
      1: '基本的な単一テーブル操作',
      2: '条件付きクエリや関数使用',
      3: '複数テーブルの結合や複雑な条件',
      4: 'サブクエリや高度な機能',
      5: 'パフォーマンス最適化や複雑なビジネスロジック'
    }

    const description = levelDescriptions[level] || '汎用的なSQL操作'

    return `以下の条件でSQL学習問題を生成してください：

ジャンル: ${genre}
レベル: ${level} - ${description}
使用テーブル: ${selectedTable}

必ず指定されたテーブルの実際のカラム名を使用してください。`
  }

  /**
   * AI応答をJSONとしてパース
   * @param response AI応答文字列
   * @returns パースされたオブジェクト
   */
  function parseAIResponse(response: string): { question: string, answer: string, explanation: string } {
    try {
      return JSON.parse(response)
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      // フォールバック: 基本的な構造を返す
      return {
        question: 'AI応答の解析に失敗しました。',
        answer: '-- Parsing failed',
        explanation: 'レスポンスのパースに失敗しました。'
      }
    }
  }

  /**
   * 利用可能なテーブル一覧を取得
   * @returns テーブル名の配列
   */
  function getAvailableTableList(): string[] {
    return getAvailableTables()
  }

  /**
   * テーブルの存在確認
   * @param tableName テーブル名
   * @returns 存在するかどうか
   */
  function isValidTable(tableName: string): boolean {
    return validateTable(tableName)
  }

  return {
    generateQuestion,
    getAvailableTableList,
    isValidTable,
    validatePrompt: service.validatePrompt
  }
}