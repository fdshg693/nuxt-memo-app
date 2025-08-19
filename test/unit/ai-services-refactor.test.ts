import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  useSqlQuizAssistant,
  useSqlAnalysisAssistant,
  useSqlQuestionGenerator
} from '~/composables/ai'

// Mock the base useAI composable
vi.mock('~/composables/useAI', () => ({
  useAI: vi.fn(() => ({
    callOpenAIWithMock: vi.fn((systemPrompt: string, userPrompt: string, mockResponse: string) => 
      Promise.resolve(mockResponse)
    )
  }))
}))

// Mock the database validation composable for question generator
vi.mock('~/composables/useDatabaseValidation', () => ({
  useDatabaseValidation: vi.fn(() => ({
    validateTable: vi.fn(() => true),
    getAvailableTables: vi.fn(() => ['users', 'products', 'orders']),
    getDatabaseSchemaForPrompt: vi.fn(() => 'Mock database schema'),
    validateGeneratedQuestion: vi.fn(() => ({ isValid: true, errors: [], suggestions: [] }))
  }))
}))

describe('AI Services Refactoring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSqlQuizAssistant', () => {
    it('should provide SQL quiz assistance functionality', async () => {
      const { askSqlQuestion, validatePrompt } = useSqlQuizAssistant()
      
      // Test prompt validation
      expect(validatePrompt('SELECT * FROM users')).toBe(true)
      expect(validatePrompt('Tell me a joke')).toBe(false)
      
      // Test SQL question asking
      const response = await askSqlQuestion(
        'このクエリは正しいですか？',
        'SELECT * FROM users',
        'ユーザー一覧を取得',
        'テーブル情報'
      )
      
      expect(response.response).toBeDefined()
      expect(response.error).toBeUndefined()
    })

    it('should handle validation errors', async () => {
      const { askSqlQuestion } = useSqlQuizAssistant()
      
      const response = await askSqlQuestion(
        'Tell me about the weather',  // Invalid SQL prompt
        'SELECT * FROM users',
        'ユーザー一覧を取得'
      )
      
      expect(response.error).toBe('SQLに関する質問のみ受け付けています。')
    })
  })

  describe('useSqlAnalysisAssistant', () => {
    it('should provide specialized analysis for different genres', async () => {
      const { analyzeSql } = useSqlAnalysisAssistant()
      
      // Test performance analysis
      const performanceResponse = await analyzeSql(
        'パフォーマンスを分析してください',
        'PERFORMANCE',
        'SELECT * FROM users WHERE name LIKE "%john%"',
        'パフォーマンス問題の特定'
      )
      
      expect(performanceResponse.response).toContain('パフォーマンス分析')
      
      // Test transaction analysis
      const transactionResponse = await analyzeSql(
        'トランザクションを分析してください',
        'TRANSACTION',
        'BEGIN; UPDATE users SET balance = balance - 100; COMMIT;',
        'トランザクション処理'
      )
      
      expect(transactionResponse.response).toContain('トランザクション分析')
      
      // Test deadlock analysis
      const deadlockResponse = await analyzeSql(
        'デッドロックの可能性を確認してください',
        'DEADLOCK',
        'UPDATE table1 SET col1 = 1; UPDATE table2 SET col2 = 2;',
        'デッドロック問題'
      )
      
      expect(deadlockResponse.response).toContain('デッドロック分析')
    })

    it('should use general analysis for unknown genres', async () => {
      const { analyzeSql } = useSqlAnalysisAssistant()
      
      const response = await analyzeSql(
        'このコードを分析してください',
        'UNKNOWN_GENRE',
        'SELECT * FROM users',
        '一般的な問題'
      )
      
      expect(response.response).toContain('SQL分析')
    })
  })

  describe('useSqlQuestionGenerator', () => {
    it('should generate SQL questions with proper structure', async () => {
      const { generateQuestion, getAvailableTableList, isValidTable } = useSqlQuestionGenerator()
      
      // Test table validation functions
      expect(isValidTable('users')).toBe(true)
      expect(getAvailableTableList()).toEqual(['users', 'products', 'orders'])
      
      // Test question generation
      const question = await generateQuestion('SELECT', 1, 'users')
      
      expect(question.id).toBeDefined()
      expect(question.level).toBe(1)
      expect(question.genre).toBe('SELECT')
      expect(question.question).toBeDefined()
      expect(question.answer).toBeDefined()
      expect(question.DbName).toBe('users')
      expect(question.explanation).toBeDefined()
      expect(question.generated).toBe(true)
    })

    it('should handle invalid parameters gracefully', async () => {
      const { generateQuestion } = useSqlQuestionGenerator()
      
      // Test with invalid parameters
      const invalidQuestion = await generateQuestion('', 0)
      
      expect(invalidQuestion.error).toBeDefined()
    })
  })

  describe('AI Prompt Configurations', () => {
    it('should have proper system prompts for each use case', async () => {
      const { 
        sqlQuizAssistantConfig, 
        sqlPerformanceAnalysisConfig 
      } = await import('~/composables/ai/configs')
      
      // SQL Quiz Assistant should have general SQL teacher prompt
      expect(sqlQuizAssistantConfig.systemPrompt).toContain('SQL専門の教師')
      expect(sqlQuizAssistantConfig.maxTokens).toBe(2000)
      
      // Performance Analysis should have specialized performance prompt
      expect(sqlPerformanceAnalysisConfig.systemPrompt).toContain('SQLパフォーマンス専門家')
      expect(sqlPerformanceAnalysisConfig.maxTokens).toBe(2500)
    })

    it('should provide appropriate validation for each service', async () => {
      const { 
        sqlQuizAssistantConfig, 
        sqlPerformanceAnalysisConfig,
        sqlTransactionAnalysisConfig,
        sqlDeadlockAnalysisConfig 
      } = await import('~/composables/ai/configs')
      
      // Basic SQL validation
      expect(sqlQuizAssistantConfig.validatePrompt!('SELECT * FROM users')).toBe(true)
      expect(sqlQuizAssistantConfig.validatePrompt!('Tell me a joke')).toBe(false)
      
      // Performance-specific validation
      expect(sqlPerformanceAnalysisConfig.validatePrompt!('パフォーマンス最適化')).toBe(true)
      expect(sqlPerformanceAnalysisConfig.validatePrompt!('天気について')).toBe(false)
      
      // Transaction-specific validation
      expect(sqlTransactionAnalysisConfig.validatePrompt!('トランザクション処理')).toBe(true)
      expect(sqlTransactionAnalysisConfig.validatePrompt!('料理のレシピ')).toBe(false)
      
      // Deadlock-specific validation
      expect(sqlDeadlockAnalysisConfig.validatePrompt!('デッドロック対策')).toBe(true)
      expect(sqlDeadlockAnalysisConfig.validatePrompt!('映画の感想')).toBe(false)
    })
  })
})