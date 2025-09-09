# 認証 & ユーザー管理

## 特徴
- DB 抽象化: `DatabaseAdapter` + `DatabaseFactory`
- SQLite デフォルト (他 RDB 切替可能 `DATABASE_TYPE`)
- セッション: HttpOnly Cookie + 自動クリーンアップ
- 管理者ロール / 一般ユーザー分離

## 代表 API (擬似コード)
```ts
const user = database.createUser(email, username, passwordHash, isAdmin)
const session = database.createSession(sessionId, userId)
```

## Composable
`useAuth`: `login`, `register`, `logout`, `checkAuth`, `isLoggedIn`, `userProfile`

## 進捗連携
`useUserProgress` がユーザー ID 基点で正答履歴保存

## セキュリティ
- bcrypt (ハッシュ) ※ 実装ファイルで確認
- HttpOnly / SameSite
- 期限切れセッション削除
