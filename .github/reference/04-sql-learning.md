# SQL 学習システム

## 階層
`genre -> subgenre -> level` でソート/表示。

## 問題タイプ
1. 実行問題 (execution / デフォルト)
   - `answer` に正解 SQL
   - `SqlExecutionPanel`
2. 分析問題 (`type: analysis`)
   - `analysisCode` に解析対象 SQL
   - ジャンル: PERFORMANCE / TRANSACTION / DEADLOCK
   - `SqlAnalysisPanel`

## 問題構造例
```json
{
  "id": 20,
  "level": 1,
  "genre": "PERFORMANCE",
  "subgenre": "INDEX_OPTIMIZATION",
  "question": "以下のSQLクエリのパフォーマンスを分析し、改善点があれば提案してください",
  "analysisCode": "SELECT * FROM users WHERE name LIKE '%田%' ORDER BY age DESC",
  "type": "analysis",
  "DbName": "users",
  "difficulty": "intermediate",
  "estimatedTime": 300,
  "prerequisites": ["basic_select", "where_clause"]
}
```

## 主なコンポーネント
- `SqlQuestionContent`
- `SqlExecutionPanel`
- `SqlAnalysisPanel`
- `SqlAiAssistant`

## 進捗記録
`recordCorrectAnswer(questionId, genre, subgenre, level)`
