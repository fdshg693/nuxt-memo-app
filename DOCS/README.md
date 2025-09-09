# 📚 ドキュメント一覧

このディレクトリには、Nuxt Memo Appのプロジェクト関連ドキュメントが含まれています。

## 📋 ドキュメント構成

### 🏗️ アーキテクチャ・設計
- **[DATABASE_ABSTRACTION.md](./DATABASE_ABSTRACTION.md)** - データベース抽象化設計の説明
- **[SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md)** - セキュア JavaScript 実行環境の実装
- **[OPENAI_RESPONSE_API.md](./OPENAI_RESPONSE_API.md)** - OpenAI Response API の基本的な使い方と実装例
- **[TURSO_SDK.md](./TURSO_SDK.md)** - Turso SDK (libSQL) の基本的な使い方と実装例

### 🔄 リファクタリング・改善
- **[refactor.md](./refactor.md)** - ファイル分割・リファクタリング推奨箇所

### 🧩 機能ディレクトリ
- **SQL 関連**: `/pages/sql` にある SQL 学習機能。最近追加されたランダム出題ページは `/sql/random` です。実装方針や詳細は `tmp/sql-random-plan.md` を参照してください。

### 🎨 UI・UX
- **[screen-transitions.md](./screen-transitions.md)** - 画面遷移図と各ページの詳細
- **[pages.md](./pages.md)** - `pages/` フォルダのルーティング規約、動的ルート、運用ルールのガイド

### 🧪 テスト関連
- **[test-development-guide.md](./test-development-guide.md)** - テストケース作成手順とベストプラクティス

### 📦 静的リソース / JSON 方針
- **[IMPORT_JSON_POLICY.md](./IMPORT_JSON_POLICY.md)** - 静的 JSON を build-time にバンドルする方針（import.meta.glob 利用）と注意点

## 📍 その他の重要ドキュメント

プロジェクトルートに配置されている主要ドキュメント:
- **[README.md](../README.md)** - プロジェクト概要とセットアップ手順
- **[AGENTS.md](../AGENTS.md)** - Copilot Instructions（開発者向けガイド）
- **[.github/copilot-instructions.md](../.github/copilot-instructions.md)** - GitHub Copilot設定

## 📖 ドキュメント更新ガイドライン

- 新機能追加時は対応するドキュメントを更新
- アーキテクチャ変更時は関連する設計ドキュメントを更新
- 古い情報は定期的に見直して修正
- ドキュメントの追加・変更時はこのREADMEも更新

## 🔍 ドキュメント検索

特定の情報を探している場合:
- **データベース関連** → `DATABASE_ABSTRACTION.md`, `TURSO_SDK.md`
- **AI・OpenAI関連** → `OPENAI_RESPONSE_API.md`
- **セキュリティ関連** → `SECURITY_IMPLEMENTATION.md`
- **コードの整理** → `refactor.md`
- **画面・ナビゲーション** → `screen-transitions.md`
- **テスト実装** → `test-development-guide.md`