# Nuxt メモアプリ (Nuxt Memo App)

プログラミング学習を支援するNuxt 3ベースのWebアプリケーションです。ジャンケンゲーム、クイズ機能、SQL学習機能を搭載しています。

## 機能 (Features)

### 🎮 ジャンケンゲーム
- シンプルなじゃんけんゲーム
- ユーザー認証機能付き

### 📝 クイズ機能
- プログラミングに関するクイズ
- AIを活用した問題生成（OpenAI API連携）

### 🗃️ SQL学習システム
- 段階的なSQL問題集
- ジャンル別・レベル別に整理された問題
- リアルタイムでのSQL実行とテーブル表示
- SQL文の解説機能
- データベーステーブルの一覧表示

## 技術スタック (Tech Stack)

- **フレームワーク**: Nuxt 3
- **スタイリング**: Tailwind CSS
- **データベース**: AlaSQL (ブラウザ内SQL)
- **AI機能**: OpenAI API
- **ユーティリティ**: Lodash

## セットアップ (Setup)

### 依存関係のインストール

```bash
npm install
```

### 環境変数の設定

OpenAI API機能を使用する場合は、`.env`ファイルを作成して以下を設定してください：

```bash
OPENAI_API_KEY=your_openai_api_key_here
NUXT_PUBLIC_API_KEY=your_public_api_key_here
```

## 開発 (Development)

開発サーバーを `http://localhost:3000` で起動：

```bash
npm run dev
```

## 本番環境 (Production)

本番用にアプリケーションをビルド：

```bash
npm run build
```

本番ビルドをローカルでプレビュー：

```bash
npm run preview
```

## アプリの構成 (App Structure)

- `/pages/index.vue` - メインページ（機能一覧とSQL問題一覧）
- `/pages/janken.vue` - ジャンケンゲーム
- `/pages/quiz.vue` - クイズ機能
- `/pages/sql/` - SQL学習関連ページ
- `/pages/login.vue` - ログイン機能
- `/data/` - 問題データとデータベース定義
- `/components/` - 再利用可能なVueコンポーネント

## デプロイ (Deployment)

Nuxtの[デプロイメントドキュメント](https://nuxt.com/docs/getting-started/deployment)を参照してください。

## ライセンス (License)

このプロジェクトは学習目的で作成されています。
