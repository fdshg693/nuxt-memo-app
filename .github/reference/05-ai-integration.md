# AI 連携

## 基本
`/server/api/openai.post.ts` 経由で OpenAI 呼出。プロンプト注入対策 & ジャンル別ガイド。

## Composable
`useAI`: `callOpenAI`, `callOpenAIWithMock`

## 分析ジャンル別観点
- PERFORMANCE: 実行計画 / インデックス / スケーラビリティ
- TRANSACTION: 分離レベル / ロック / ACID
- DEADLOCK: リソース獲得順序 / 回避戦略

## 質問生成
`/server/api/generate-question.post.ts` が DB スキーマ検証後に生成。管理者審査を想定。

## セキュリティ
- SQL 教育用途に限定するシステムプロンプト
- 非関連要求は拒否

## 環境変数
`OPENAI_API_KEY`
