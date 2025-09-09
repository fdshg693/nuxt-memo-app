# 開発パターン / Composables

## 主な Composables
- `useAI`
- `useDatabaseValidation`
- `useSecureJavaScriptExecution`
- `useUserProgress`
- `useSqlQuiz`
- `useAuth`

## スタイリング
- TailwindCSS + `assets/main.css`
- `.btn-gradient` / `.btn-sql-question` / グラデーションテーマ

## ルート保護 (例)
```ts
if (to.path.startsWith('/admin') && !userIsAdmin) return navigateTo('/login')
```

## DB 抽象化例
```ts
import { database } from '~/server/utils/database-factory'
const users = database.getAllUsers()
```
