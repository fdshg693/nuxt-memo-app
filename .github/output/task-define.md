# タスク定義 - Nuxt SQL学習アプリ機能拡張

## 実装対象
Nuxt 3ベースのインタラクティブSQL学習プラットフォームに以下4つの主要機能を追加・改善する

## 機能要件

### 1. AIプロンプトシステムの改善
- **現状**: プルダウン選択式の固定的な5つのオプション
- **改善目標**: より自由度が高く、既存説明文章を活用できるプロンプトシステム
- **実装内容**:
  - 自由テキスト入力フィールドの追加
  - `/data/sqlExplanation/`の説明文章を動的に組み込む機能
  - プロンプトテンプレート管理システム
  - コンテキスト適応型プロンプト生成

### 2. AI自動問題生成機能
- **目標**: 既存テーブル定義を利用したSQL問題の自動生成
- **実装内容**:
  - `/data/sqlDatabases.json`を解析してAI問題生成
  - 生成問題の自動検証・難易度判定
  - 生成問題の保存・管理機能
  - 問題生成用の管理UI

### 3. Markdown回答表示システム
- **現状**: AIの回答がプレーンテキスト表示
- **改善目標**: リッチなMarkdown表示による可読性向上
- **実装内容**:
  - Markdownレンダリングライブラリの導入
  - SQLコードハイライト機能
  - 表形式データの整形表示
  - 適切なスタイリング適用

### 4. 実践的SQL問題の追加
- **目標**: 理論的知識を問う選択式問題システムの構築
- **対象分野**:
  - TRANSACTION関連（分離レベル、ロック、コミット/ロールバック）
  - パフォーマンス関連（インデックス、クエリ最適化、実行計画）
  - DEAD LOCK関連（発生原因、回避策、対処法）
- **実装内容**:
  - 選択式問題用の新しいデータスキーマ
  - 問題タイプ判定システム
  - 選択肢管理と正解判定ロジック

## 技術要件

### アーキテクチャ
- **フレームワーク**: Nuxt 3 + Vue 3 Composition API
- **スタイリング**: Tailwind CSS
- **データベース**: AlaSQL (ブラウザ内SQL実行)
- **AI統合**: OpenAI API (gpt-4o-mini)
- **新規ライブラリ**: Markdownレンダリング（@nuxt/content または markdown-it）

### 新規コンポーネント
- `MultipleChoiceQuestion.vue` - 選択式問題表示
- `AiQuestionGenerator.vue` - AI問題生成UI
- `MarkdownRenderer.vue` - Markdown表示
- `EnhancedAiPrompt.vue` - 改良版AIプロンプト

### 改修対象コンポーネント
- `AiPromptModal.vue` - プロンプト入力方式の改善
- `SqlEditor.vue` - Markdown表示対応
- 問題表示系コンポーネント

### 新規API
- `/server/api/generate-question.post.ts` - AI問題生成
- `/server/api/save-question.post.ts` - 生成問題保存

## データ構造拡張

### 選択式問題用スキーマ
```json
{
  "id": "practical-001",
  "type": "multiple-choice",
  "category": "transaction|performance|deadlock",
  "level": 4,
  "question": "問題文",
  "choices": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  "correct": 0,
  "explanation": "解説文"
}
```

## 実装フェーズ

### Phase 1: 基盤機能 (優先度: 高)
1. Markdownレンダリングシステムの導入
2. AIプロンプトシステムの改善

### Phase 2: 新機能 (優先度: 中)
3. 選択式問題システムの構築
4. AI自動問題生成機能

### Phase 3: 統合・最適化 (優先度: 低)
5. 全機能の統合とテスト
6. UIの最適化とブラッシュアップ

## 成功指標
1. AIプロンプトの自由度向上とユーザビリティ改善
2. 自動生成問題の品質と多様性の確保
3. Markdown表示による回答可読性の向上
4. 実践的問題による学習効果の向上

## 制約事項
- 既存のデータ構造との互換性を保持
- 現在のAlaSQL + JSON アーキテクチャを踏襲
- Tailwind CSSの既存スタイルガイドラインに準拠
