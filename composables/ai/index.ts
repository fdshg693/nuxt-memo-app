/**
 * AI Services for different use cases
 * 各用途に特化したAIサービスのエクスポート
 */

// Types
export type { 
  AIPromptConfig, 
  AIServiceContext, 
  AIResponse, 
  GeneratedQuestion 
} from './types'

// Base service
export { createAIService } from './base-service'

// Configurations
export {
  sqlQuizAssistantConfig,
  sqlPerformanceAnalysisConfig,
  sqlTransactionAnalysisConfig,
  sqlDeadlockAnalysisConfig,
  sqlGeneralAnalysisConfig,
  sqlQuestionGenerationConfig
} from './configs'

// Specialized services
export { useSqlQuizAssistant } from './use-sql-quiz-assistant'
export { useSqlAnalysisAssistant } from './use-sql-analysis-assistant'
export { useSqlQuestionGenerator } from './use-sql-question-generator'