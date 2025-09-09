# ファイル構成 / 主要ディレクトリ

## Server
`/server/api/` (admin, stripe, user, openai, generate-question)
`/server/utils/` (database-factory, auth など)

## Data
`sqlQuestions.json`, `sqlDatabases.json`, `sqlExplanation/*.json`

## Components (抜粋)
- SQL: `SqlExecutionPanel`, `SqlAnalysisPanel`, `SqlAiAssistant`
- 管理: `AdminUserManager`
- Playground: `SecureJavaScriptEditor`
- 決済: `SubscriptionManager`

## DB スキーマ (主)
- users
- user_progress
- sessions
- subscriptions
