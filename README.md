# Nuxt Memo App

日本語でSQLを学習するためのWebアプリケーションです。ブラウザ内でSQL実行、クイズ、ゲーム機能を提供し、OpenAI統合によるSQL学習支援を行います。

## 🚀 主な機能

### 📚 学習機能
- **SQL学習システム**: ブラウザ内でのリアルタイムSQL実行（AlaSQL使用）
- **階層的問題構成**: ジャンル → サブジャンル → レベルの3階層での問題管理
- **2種類の問題タイプ**: 
  - 実行問題（従来のSQL作成・実行）
  - 分析問題（コード分析・理論学習）
- **AI学習支援**: OpenAI APIを活用したSQL解説とヒント機能
- **AI問題生成**: 管理者向けのAI自動問題生成機能
- **進捗追跡**: ユーザーの学習進捗をデータベースで永続化

### 🎮 エンターテイメント機能  
- **クイズシステム**: ランダム問題出題機能
- **じゃんけんゲーム**: 認証が必要なゲーム機能
- **安全なJavaScriptプレイグラウンド**: セキュア実行環境付きコードエディタ

### 🔐 認証・管理機能
- **完全な認証システム**: ユーザー登録、ログイン、セッション管理
- **管理者ダッシュボード**: ユーザー管理、統計表示、新規ユーザー作成
- **データベース永続化**: SQLiteによる安全なデータ保存
- **プロフィール管理**: ユーザー情報とプログレス表示

### 💳 サブスクリプション機能
- **Stripe連携**: 安全な決済処理
- **プラン管理**: ベーシック・プロ・エンタープライズプラン
- **サブスクリプション状況確認**: リアルタイム契約状況表示

### 🎨 UI/UX
- **レスポンシブデザイン**: TailwindCSSによるモダンなUI
- **紫/インディゴ/ピンクのブランドカラー**: 統一されたデザインシステム
- **アクセシビリティ対応**: ユーザビリティを重視した設計

## 🛠 技術スタック

### フロントエンド
- **フレームワーク**: Nuxt 3 (Vue 3)
- **言語**: TypeScript
- **スタイリング**: TailwindCSS
- **状態管理**: Composables (useSqlQuiz, useAuth, useUserProgress)

### バックエンド  
- **サーバー**: Nuxt 3 Server API
- **データベース**: SQLite (本番環境対応)
- **認証**: bcrypt + HttpOnly Cookie セッション
- **決済**: Stripe API

### 学習機能
- **SQL実行エンジン**: AlaSQL（ブラウザ内）
- **AI統合**: OpenAI API (GPT-4/GPT-5対応)
- **セキュリティ**: 隔離されたJavaScript実行環境

### 開発・テスト
- **テストフレームワーク**: Vitest + Playwright
- **型チェック**: TypeScript
- **コード品質**: ESLint
- **パッケージ管理**: npm

### デプロイメント
- **対応環境**: Serverless, Traditional Server
- **データベース拡張性**: MySQL/PostgreSQL対応可能
- **環境管理**: .env configuration

## 📋 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下を設定：

```env
# OpenAI API（AI機能用）
OPENAI_API_KEY=your_openai_api_key_here

# Stripe決済（サブスクリプション機能用）
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# データベース設定（オプション）
DATABASE_TYPE=sqlite  # sqlite | mysql | postgresql
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

サーバーは `http://localhost:3000` で起動します。

## 🏗 プロジェクト構造

```
./
├── DOCS/                     # 📚 プロジェクト文書（詳細ドキュメント）
│   ├── README.md             # ドキュメント一覧
│   ├── DATABASE_ABSTRACTION.md  # データベース設計
│   ├── SECURITY_IMPLEMENTATION.md  # セキュリティ実装
│   └── ...                   # 他の技術文書
├── data/                     # 📊 静的データファイル
│   ├── sqlQuestions.json     # SQL問題データ
│   ├── sqlDatabases.json     # データベーススキーマ
│   ├── randomQuestions.json  # ランダムクイズ問題
│   ├── sqlExplanation/       # SQL概念の解説データ
│   └── users.db             # ユーザーデータ（開発環境）
├── pages/                    # 🌐 ページコンポーネント
│   ├── sql/[[id]].vue       # 動的SQL問題ページ
│   ├── admin.vue            # 管理者ダッシュボード
│   ├── playground.vue       # JavaScriptプレイグラウンド
│   ├── subscription.vue     # サブスクリプション管理
│   ├── profile.vue          # ユーザープロフィール
│   ├── login.vue & register.vue  # 認証ページ
│   ├── quiz.vue             # クイズページ
│   └── janken.vue           # じゃんけんゲーム
├── server/                   # ⚙️ サーバーサイドAPI
│   ├── api/                 # REST API エンドポイント
│   │   ├── admin/           # 管理者専用API
│   │   ├── stripe/          # Stripe決済API
│   │   ├── user/            # ユーザー関連API
│   │   ├── openai.post.ts   # AI統合API
│   │   └── ...              # その他のAPI
│   └── utils/               # サーバーユーティリティ
│       ├── database-factory.ts  # データベース抽象化
│       └── auth.ts          # 認証ヘルパー
├── composables/             # 🔧 状態管理とロジック
│   ├── useAuth.ts           # 認証管理
│   ├── useSqlQuiz.ts        # SQL問題管理
│   ├── useUserProgress.ts   # 進捗追跡
│   ├── useAI.ts             # AI機能
│   ├── useSecureJavaScriptExecution.ts  # セキュア実行
│   └── ...                  # その他のコンポーザブル
├── components/              # 🧩 再利用可能コンポーネント
│   ├── Sql*.vue            # SQL学習関連
│   ├── Secure*.vue         # セキュリティ関連
│   └── ...                 # その他のコンポーネント
├── test/                    # 🧪 テストファイル
│   ├── e2e/                # Playwrightテスト
│   └── unit/               # Vitestユニットテスト
└── plugins/
    └── alasql.ts           # AlaSQL初期化
```

## 🎯 アーキテクチャの特徴

### データ駆動設計
- 問題とデータベースは`/data/`フォルダのJSONファイルで管理
- ジャンル → サブジャンル → レベルの3階層で自動ソート
- 新しい問題はJSONに追加するだけで自動的にUIに反映

### 完全な認証システム
- SQLiteデータベースによるユーザー情報の永続化
- bcrypt による安全なパスワードハッシュ化
- HttpOnly Cookie によるセッション管理
- ユーザー進捗の自動同期

### ブラウザ内SQL実行
- AlaSQL使用でサーバー不要のSQL学習環境
- `sqlDatabases.json`のテーブル定義を自動で初期化
- リアルタイムでのSQL実行結果表示

### AI統合学習支援
- OpenAI API による適応的な学習ヒント
- 問題タイプ別の専門的なAI応答
- 自動問題生成機能

### セキュアなコード実行
- 隔離されたJavaScript実行環境
- レート制限付きのコード実行
- DOM操作やネットワークアクセスの無効化

### コンポーザブル中心設計
- Vuexやpiniaの代わりにcomposablesで状態管理
- `useAuth()`, `useSqlQuiz()`, `useUserProgress()`でロジック分離
- ファイルベースルーティングとの親和性が高い

## 🔧 開発ワークフロー

### 新しいSQL問題の追加

#### 実行問題
1. `data/sqlQuestions.json`に問題を追加
2. `answer`フィールドに正解SQLを設定
3. 必要に応じて`data/sqlDatabases.json`にテーブル定義を追加

#### 分析問題
1. `data/sqlQuestions.json`に`"type": "analysis"`で問題を追加
2. `analysisCode`フィールドに分析対象SQLを設定
3. PERFORMANCE、TRANSACTION、DEADLOCKジャンルで専門的AI対応

### AI機能のカスタマイズ
- `/server/api/openai.post.ts`でプロンプト制御
- SQL教育に特化したプロンプトインジェクション保護
- システムプロンプトでSQL学習に限定

### 管理者機能
- 管理者ダッシュボードでユーザー管理
- AI問題生成機能でコンテンツ拡充
- ユーザー統計とプログレス監視

### スタイリング
- カスタムTailwindクラス: `.btn-gradient`, `.btn-sql-question`
- `assets/main.css`でグラデーションユーティリティ定義
- 紫/インディゴ/ピンクのブランドカラー統一

## 🧪 テスト

### ユニットテスト
```bash
npm run test          # Vitest実行
npm run test:ui       # テストUI表示
npm run test:coverage # カバレッジ付き実行
```

### E2Eテスト
```bash
npm run test:e2e       # Playwright実行
npm run test:e2e:ui    # テストUI表示
npm run test:e2e:debug # デバッグモード
```

### デバッグ
```javascript
// ブラウザコンソールでAlaSQL状態確認
window.alasql.databases

// SQL実行エラーは赤枠で表示
// AI応答は紫枠で表示
```

## 🚀 本番環境

### ビルド
```bash
npm run build
```

### プレビュー
```bash
npm run preview
```

### デプロイ設定
1. **環境変数**: `OPENAI_API_KEY`、Stripe関連キーを設定
2. **データベース**: 本番環境では`/tmp/users.db`を使用
3. **スケーリング**: `DATABASE_TYPE`環境変数でMySQL/PostgreSQL切り替え可能

## 📖 ドキュメント

プロジェクトの詳細なドキュメントは [`DOCS/`](./DOCS/) ディレクトリにまとめられています：

- **[DOCS/README.md](./DOCS/README.md)** - ドキュメント一覧とガイド
- **アーキテクチャ・設計**: データベース抽象化、セキュリティ実装
- **UI・UX**: 画面遷移図と各ページの詳細
- **開発・メンテナンス**: リファクタリング推奨箇所
- **テスト**: テスト開発ガイドとPlaywrightテストケース

開発者向けの詳細な技術情報は [`AGENTS.md`](./AGENTS.md) を参照してください。

## 🎯 主要機能の使い方

### 管理者機能
1. 管理者権限でログイン
2. `/admin`にアクセス
3. ユーザー管理、統計確認、AI問題生成

### サブスクリプション
1. `/subscription`でプラン選択
2. Stripe決済でプラン契約
3. 高度な機能へのアクセス解除

### プレイグラウンド
1. `/playground`でセキュアなJavaScript実行
2. 隔離環境でコード学習
3. レート制限付きの安全な実行

## 📚 参考リンク

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [AlaSQL Documentation](https://github.com/AlaSQL/alasql/wiki)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Stripe API Documentation](https://stripe.com/docs/api)