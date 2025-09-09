# 開発ワークフロー

## SQL 問題追加 (実行型)
1. `sqlQuestions.json` へ追加
2. `answer` 記載
3. `DbName` が `sqlDatabases.json` に存在するか確認

## 分析問題
1. `type: analysis`
2. `analysisCode` 記載
3. ジャンル (PERFORMANCE / TRANSACTION / DEADLOCK)

## AI 生成
- 管理画面でジャンル/レベル/DB 指定
- 自動スキーマ検証 → 生成 → レビュー

## 認証テスト
- `/register` → `/login`
- 進捗保持確認
- 管理機能 / 権限確認

## セキュリティテスト
- JS サンドボックス検証
- セッション期限
- サブスク制御
