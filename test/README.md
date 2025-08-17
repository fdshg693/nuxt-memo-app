# Nuxt Memo App - Unit Tests

このプロジェクトのユニットテスト実装について説明します。

## テスト構成

### テストライブラリ
- **Vitest**: メインのテストランナー
- **@vue/test-utils**: Vueコンポーネントのテスト
- **@nuxt/test-utils**: Nuxtアプリケーション用のテストユーティリティ
- **jsdom**: ブラウザ環境のシミュレーション

### ディレクトリ構造

```
test/
├── fixtures/                 # テスト用モックデータ
│   ├── mock-questions.json   # SQL問題のモックデータ
│   └── mock-databases.json   # データベースのモックデータ
├── unit/                     # ユニットテスト
│   ├── components/           # コンポーネントテスト
│   │   ├── SqlEditor.test.ts
│   │   ├── DatabaseTable.test.ts
│   │   └── ResultTable.test.ts
│   └── composables/          # コンポーザブルテスト
│       ├── useSqlQuiz.test.ts
│       ├── useSqlDb.test.ts
│       └── useAuth.test.ts
├── integration/              # 統合テスト
│   ├── sql-data-integration.test.ts
│   ├── alasql-integration.test.ts   # AlaSQL統合テスト
│   └── openai-api-integration.test.ts # OpenAI API統合テスト
├── utils/                    # テストユーティリティ
│   ├── test-helpers.ts       # ヘルパー関数
│   └── test-helpers.test.ts  # ヘルパー関数のテスト
└── setup.ts                  # テストセットアップ
```

## テストの実行

```bash
# 全テストの実行
npm run test

# UIでのテスト実行
npm run test:ui

# カバレッジ付きでテスト実行
npm run test:coverage
```

## 実装されたテスト

### コンポーネントテスト
1. **SqlEditor** - SQL入力・実行コンポーネント
   - テキストエリアの表示・入力
   - 実行ボタンのクリック
   - イベントエミット
   - AIプロンプトモーダルの表示制御

2. **DatabaseTable** - データベーステーブル表示コンポーネント
   - テーブルヘッダーの表示
   - データ行の表示
   - 空テーブルの処理
   - 異なるデータ型の処理

3. **ResultTable** - SQL実行結果表示コンポーネント
   - 結果テーブルの表示
   - 空結果の処理
   - データ欠損の処理

### コンポーザブルテスト
1. **useSqlQuiz** - SQL問題管理
   - 問題データの読み込み
   - ジャンル・レベル別ソート
   - 問題構造の検証

2. **useSqlDb** - データベース管理
   - データベースデータの読み込み
   - 名前によるデータベース検索
   - 存在しないデータベースの処理

3. **useAuth** - 認証管理
   - 認証プロパティの提供
   - トークン状態管理
   - ログイン状態の計算

### 統合テスト
1. **SQL Data Integration** - データ整合性
   - 問題とデータベースの連携
   - データベース参照の有効性
   - 問題データ構造の検証

2. **AlaSQL Integration** - SQL実行エンジンテスト
   - データベース初期化テスト
   - テーブル作成とデータ挿入
   - SQL クエリ実行（SELECT, JOIN, 集約など）
   - エラーハンドリング
   - 複雑なクエリ処理
   - 様々なデータ型の処理

3. **OpenAI API Integration** - AI機能テスト
   - SQL関連プロンプトの検証
   - プロンプトインジェクション対策
   - 文字数制限チェック
   - プリセットプロンプトの受け入れ
   - SQLキーワード検証
   - リクエスト構造の検証

### ユーティリティテスト
1. **Test Helpers** - テストヘルパー関数
   - モックデータ生成関数
   - SQL文の検証
   - テーブル名の抽出

## テストカバレッジ

現在のテストカバレッジ:
- **コンポーネント**: 主要コンポーネント（SqlEditor, DatabaseTable, ResultTable）
- **コンポーザブル**: 中核的なコンポーザブル（useSqlQuiz, useSqlDb, useAuth）
- **統合テスト**: データ整合性、AlaSQL実行エンジン、OpenAI API機能
- **ユーティリティ**: テストヘルパー関数

## 特徴

### モックデータの活用
- 実際のJSONデータ構造に基づくモック
- テスト専用のフィクスチャデータ
- 様々なエッジケースのカバー

### Nuxt特有の考慮
- NuxtのuseCookieやcomputedのモック
- コンポーザブルのNuxt環境での動作
- JSdomとNuxt環境の両方でのテスト実行

### 現実的なテスト
- 実際のアプリケーションデータとの整合性チェック
- 存在しないデータベース参照の検出と報告
- 日本語コンテンツに対応

## 今後の拡張

このテスト基盤を基に、以下の拡張が可能です:

1. **E2Eテスト** - Playwrightを使用した完全なユーザーワークフロー
2. **パフォーマンステスト** - 大量データでの動作テスト
3. **APIエンドポイントテスト** - 実際のHTTPリクエスト/レスポンステスト
4. **セキュリティテスト** - より高度なプロンプトインジェクション対策テスト

## 新規追加されたテスト

### AlaSQL統合テスト (`alasql-integration.test.ts`)
- **目的**: SQLクエリ実行エンジンの動作を検証
- **テスト内容**:
  - データベース初期化プロセス
  - JSONデータからのテーブル作成
  - 基本的なSQL操作（SELECT, INSERT, WHERE, ORDER BY, 集約関数）
  - JOIN操作を含む複雑なクエリ
  - SQLエラーハンドリング
  - 様々なデータ型（文字列、数値、ブール、NULL）の処理
  - `sqlDatabases.json`からの全テーブル初期化

### OpenAI API統合テスト (`openai-api-integration.test.ts`)
- **目的**: AI機能の入力検証とセキュリティを確保
- **テスト内容**:
  - 非SQL関連プロンプトの拒否
  - プロンプトインジェクション攻撃の検出と防止
  - SQL関連キーワードの認識
  - プリセットプロンプトの受け入れ
  - 文字数制限の実装
  - 空/未定義プロンプトの処理
  - 大文字小文字混在SQLキーワードの処理
  - モックレスポンス生成ロジック
  - APIリクエスト構造の検証

## 参考

テスト実装は `DOCS/test-development-guide.md` の詳細なガイドラインに基づいています。