# Nuxt Memo App

日本語でSQLを学習するためのWebアプリケーションです。ブラウザ内でSQL実行、クイズ、ゲーム機能を提供し、OpenAI統合によるSQL学習支援を行います。

## 🚀 主な機能

- **SQL学習システム**: ブラウザ内でのリアルタイムSQL実行（AlaSQL使用）
- **階層的問題構成**: ジャンル → サブジャンル → レベルの3階層での問題管理
- **AI学習支援**: OpenAI APIを活用したSQL解説とヒント機能
- **クイズシステム**: ランダム問題出題機能
- **じゃんけんゲーム**: 認証が必要なゲーム機能
- **レスポンシブデザイン**: TailwindCSSによるモダンなUI

## 🛠 技術スタック

- **フレームワーク**: Nuxt 3
- **スタイリング**: TailwindCSS
- **データベース**: AlaSQL（ブラウザ内SQL実行）
- **AI統合**: OpenAI API
- **言語**: TypeScript/Vue 3
- **データ管理**: 静的JSONファイル

## 📋 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下を設定：

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

サーバーは `http://localhost:3000` で起動します。

## 🏗 プロジェクト構造

```
/
├── data/                    # 静的データファイル
│   ├── sqlQuestions.json    # SQL問題データ
│   ├── sqlDatabases.json    # データベーススキーマ
│   ├── randomQuestions.json # ランダムクイズ問題
│   └── sqlExplanation/      # SQL概念の解説データ
├── pages/
│   ├── sql/[[id]].vue      # 動的SQL問題ページ
│   ├── quiz.vue            # クイズページ
│   └── janken.vue          # じゃんけんゲーム
├── composables/            # 状態管理とロジック
│   ├── useSqlQuiz.ts       # SQL問題管理
│   ├── useSqlDb.ts         # データベース管理
│   └── useAuth.ts          # 認証管理
├── components/             # 再利用可能コンポーネント
└── plugins/
    └── alasql.ts          # AlaSQL初期化
```

## 🎯 アーキテクチャの特徴

### データ駆動設計
- 問題とデータベースは`/data/`フォルダのJSONファイルで管理
- ジャンル → サブジャンル → レベルの3階層で自動ソート
- 新しい問題はJSONに追加するだけで自動的にUIに反映

### ブラウザ内SQL実行
- AlaSQL使用でサーバー不要のSQL学習環境
- `sqlDatabases.json`のテーブル定義を自動で初期化
- リアルタイムでのSQL実行結果表示

### コンポーザブル中心設計
- Vuexやpiniaの代わりにcomposablesで状態管理
- `useSqlQuiz()`, `useSqlDb()`, `useAuth()`でロジック分離
- ファイルベースルーティングとの親和性が高い

## 🔧 開発ワークフロー

### 新しいSQL問題の追加
1. `data/sqlQuestions.json`に問題を追加
2. 必要に応じて`data/sqlDatabases.json`にテーブル定義を追加
3. ジャンル/サブジャンル/レベルに基づいて自動でページに表示

### AI機能のカスタマイズ
- `/server/api/openai.post.ts`でプロンプト制御
- SQL教育に特化したプロンプトインジェクション保護
- システムプロンプトでSQL学習に限定

### スタイリング
- カスタムTailwindクラス: `.btn-gradient`, `.btn-sql-question`
- `assets/main.css`でグラデーションユーティリティ定義
- 紫/インディゴ/ピンクのブランドカラー統一

## 📝 開発時のヒント

### デバッグ
```javascript
// ブラウザコンソールでAlaSQL状態確認
window.alasql.databases

// SQL実行エラーは赤枠で表示
// AI応答は紫枠で表示
```

### 認証保護
- `/janken`で始まるルートは認証が必要
- `middleware/auth.global.ts`で制御
- ローカルストレージベースの簡単な認証

## 🚀 本番環境

### ビルド
```bash
npm run build
```

### プレビュー
```bash
npm run preview
```

### デプロイ
OpenAI API機能を使用する場合は、デプロイ先で`OPENAI_API_KEY`環境変数を設定してください。

## 📖 ドキュメント

プロジェクトの詳細なドキュメントは [`DOCS/`](./DOCS/) ディレクトリにまとめられています：

- **[DOCS/README.md](./DOCS/README.md)** - ドキュメント一覧とガイド
- **アーキテクチャ・設計**: データベース抽象化、セキュリティ実装
- **UI・UX**: 画面遷移図と各ページの詳細
- **開発・メンテナンス**: リファクタリング推奨箇所
- **テスト**: テスト開発ガイドとPlaywrightテストケース

開発者向けの詳細な技術情報は [`AGENTS.md`](./AGENTS.md) を参照してください。

## 📚 参考リンク

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [AlaSQL Documentation](https://github.com/AlaSQL/alasql/wiki)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
