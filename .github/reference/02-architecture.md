# アーキテクチャ & データフロー

## 構成要素
- Pages: 代表例 `/sql/[[id]].vue`, `/admin.vue`, `/playground.vue`, `/subscription.vue` など
- Composables: 状態/ロジック分離 (`useAuth`, `useSqlQuiz`, `useAI` 等)
- Data: `data/` 内 JSON による問題/スキーマ/解説
- Components: 再利用 UI + セキュリティ考慮
- Database: SQLite (抽象化で他 RDB へ拡張可能)
- Docs: `/DOCS/` に詳細設計/運用ドキュメント

## データフロー概要
1. 認証: クライアント -> `/server/api/*` -> DB セッション
2. SQL 学習: 質問 JSON 読込 -> UI 表示 -> AlaSQL 実行 / 分析
3. 進捗: `useUserProgress` がローカル + サーバ同期
4. AI: `useAI` -> `/server/api/openai` 経由で OpenAI (ジャンル別プロンプト)
5. 決済: クライアント -> Stripe エンドポイント -> webhook -> DB 状態更新
6. Playground: 安全化実行コンテキストで JS 実行
