# 安全な JavaScript 実行環境

## Composable
`useSecureJavaScriptExecution`: `executeCode`, `stopExecution`, `clearResults`

## セキュリティ
- ネットワーク遮断
- DOM 直接操作禁止
- 危険 API 限定 / マスキング
- 1分 10 回まで (レート制限)
- 実行タイムアウト 5 秒

## UI
`/playground` + `SecureJavaScriptEditor` コンポーネント
