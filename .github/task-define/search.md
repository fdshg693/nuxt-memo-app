# 調査結果

## ユーザー要求の分析

### 1. AIプロンプトの改善要求
**現状分析:**
- 現在の`AiPromptModal.vue`はプルダウン形式で固定的な5つのオプションを提供
- プロンプトオプション：確認、ヒント、改善、パフォーマンス向上、SQL説明
- 既存の説明文章は`/data/sqlExplanation/`フォルダ内のJSONファイルに格納されている

**改善ポイント:**
- より自由度の高いプロンプト入力方式が必要
- 既存の説明文章（selectExplanation.json等）を活用できる仕組みの実装

### 2. SQL問題の自動生成機能
**現状分析:**
- 現在の問題は`/data/sqlQuestions.json`に手動で定義されている
- データベース定義は`/data/sqlDatabases.json`に存在
- OpenAI APIエンドポイント`/server/api/openai.post.ts`が既に存在

**必要な実装:**
- 既存テーブル定義を利用したAI問題生成機能
- 生成された問題の保存・管理機能

### 3. AIのMarkdown回答表示改善
**現状分析:**
- AIの回答は現在プレーンテキストで表示されている
- Markdownレンダリング機能は実装されていない

**必要な実装:**
- Markdown解析・レンダリング機能
- 適切なスタイリングの適用

### 4. 実践的なSQL問題の追加
**現状分析:**
- 現在の問題は基本的なCRUD操作が中心
- レベル分けは1〜3程度

**追加必要項目:**
- TRANSACTION関連問題（選択式）
- パフォーマンス関連問題（選択式）
- DEAD LOCK関連問題（選択式）

## 技術調査結果

### 現在のアーキテクチャ
- **フロントエンド**: Nuxt 3 + Vue 3 Composition API
- **スタイル**: Tailwind CSS
- **データベース**: AlaSQL (ブラウザ内SQL実行)
- **AI統合**: OpenAI API (gpt-4o-mini)
- **データ管理**: JSON形式でファイル保存

### 既存の関連コンポーネント
1. `AiPromptModal.vue` - AIプロンプト入力
2. `SqlEditor.vue` - SQLエディタ
3. `DatabaseTable.vue` - テーブル表示
4. `ResultTable.vue` - 結果表示

### 既存のコンポーザブル
1. `useSqlQuiz()` - 問題管理
2. `useSqlDb()` - データベース管理
3. `useSqlTableUtils()` - テーブル操作

### データ構造
- **sqlQuestions.json**: id, level, genre, question, answer, DbName
- **sqlDatabases.json**: name, columns, rows
- **sqlExplanation/*.json**: title, description, examples

## 実装に必要な技術要素

### Markdownレンダリング
- Vue用Markdownライブラリ（@nuxt/content、markdown-it等）
- コードハイライト機能
- 適切なCSSスタイリング

### AI問題生成
- テーブル定義の構造化プロンプト生成
- 生成問題の検証・フィルタリング
- 問題難易度の自動判定

### 選択式問題システム
- 新しい問題タイプの定義
- 選択肢管理システム
- 正解判定ロジック

### プロンプト改善
- 自由入力フィールドの追加
- 既存説明文章の動的読み込み
- プロンプトテンプレート管理
