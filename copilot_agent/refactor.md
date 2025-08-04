# ファイル分割・リファクタリング推奨箇所

本文書では、Nuxt Memo Appにおいてファイル分割やリファクタリングが推奨される箇所を、優先度と理由とともに整理しています。

## 🔴 高優先度（即座に対応推奨）

### 1. pages/sql/[[id]].vue (306行)
**推奨度: ★★★★★**

**現状の問題点:**
- 単一ファイルに複数の責任が混在している
- SQLクエリ実行、AI応答処理、UI制御、ナビゲーション制御が全て一つのコンポーネントに含まれている
- 300行を超える大規模ファイルで保守性が低い

**分割提案:**
```
pages/sql/[[id]].vue (主要なレイアウトのみ)
├── components/sql/
│   ├── SqlQuestionHeader.vue (ナビゲーション・ヘッダー部分)
│   ├── SqlQuestionContent.vue (問題表示・データベーステーブル表示)
│   ├── SqlExecutionPanel.vue (SQL入力・実行・結果表示)
│   └── SqlAiAssistant.vue (AI関連機能)
└── composables/
    ├── useSqlQuestionState.ts (状態管理)
    └── useSqlExecution.ts (SQL実行ロジック)
```

**期待効果:**
- 各コンポーネントの責任が明確になる
- テストしやすくなる
- 再利用可能なコンポーネントができる
- 新機能追加時の影響範囲が限定される

### 2. components/AiPromptModal.vue (131行)
**推奨度: ★★★★☆**

**現状の問題点:**
- プロンプト選択、入力検証、モーダル制御が一つのコンポーネントに集約
- プリセットオプションがハードコーディングされている
- 入力検証ロジックとUI表示ロジックが混在

**分割提案:**
```
components/ai/
├── AiPromptModal.vue (モーダル制御のみ)
├── AiPromptSelector.vue (プリセット選択)
├── AiPromptInput.vue (自由入力)
└── constants/aiPromptOptions.ts (プリセットデータ)
```

**期待効果:**
- プリセットオプションの管理が容易になる
- 入力方式の追加・変更が簡単になる
- 各部分の独立したテストが可能

## 🟡 中優先度（近い将来対応推奨）

### 3. composables/useSqlExplanationLinks.ts (136行)
**推奨度: ★★★☆☆**

**現状の問題点:**
- 説明リンクのデータがハードコーディングされている
- キーワード検出ロジックが複雑で長い
- データ定義とロジックが同一ファイルに混在

**分割提案:**
```
composables/
├── useSqlExplanationLinks.ts (主要ロジックのみ)
├── data/
│   └── sqlExplanationData.ts (説明リンクデータ)
└── utils/
    └── sqlKeywordMatcher.ts (キーワード検出ロジック)
```

### 4. pages/sql/explanation/[sqlKeyword].vue (112行)
**推奨度: ★★★☆☆**

**現状の問題点:**
- 説明コンテンツの読み込み、表示、ナビゲーションが一つのファイルに混在
- エラーハンドリングとコンテンツ表示ロジックが複雑

**分割提案:**
```
pages/sql/explanation/[sqlKeyword].vue (ルーティング・レイアウトのみ)
└── components/sql-explanation/
    ├── ExplanationContent.vue (説明内容表示)
    ├── ExplanationNavigation.vue (前後移動)
    └── ExplanationError.vue (エラー表示)
```

### 5. components/random/RandomCalc.vue (107行)
**推奨度: ★★☆☆☆**

**現状の問題点:**
- 計算問題生成ロジックとUI表示が密結合
- 演算子ごとの処理が長いswitch文で実装されている

**分割提案:**
```
components/random/
├── RandomCalc.vue (UI表示のみ)
└── composables/
    └── useArithmeticQuiz.ts (計算ロジック)
```

## 🟢 低優先度（余裕があるときに対応）

### 6. components/random配下のコンポーネント群
**推奨度: ★★☆☆☆**

**現状の問題点:**
- `components/random/AIQuestion.vue` (93行): AI関連機能が別々のコンポーネントに散在
- `components/random/QuestionCard.vue` (70行): クイズロジックとUI表示が混在
- `RandomCalc.vue` との重複する状態管理パターン

**統一化提案:**
```
components/quiz/
├── QuizContainer.vue (共通レイアウト)
├── QuestionCard.vue (問題表示)
├── AIQuestion.vue (AI質問機能)
├── ArithmeticCalculator.vue (計算クイズ)
└── composables/
    ├── useQuizState.ts (共通状態管理)
    └── useScoring.ts (採点ロジック)
```

### 7. データファイルの整理
**推奨度: ★★☆☆☆**

**現状の問題点:**
- JSON形式のデータファイルが複数存在するが、型定義が不十分
- `data/sqlQuestions.json` (167行)、`data/sqlDatabases.json` (196行) など大きなデータファイル
- データ構造の一貫性確保が困難
- 説明ファイルが `data/sqlExplanation/` ディレクトリに散在

**整理提案:**
```
types/
├── sqlTypes.ts (SQL関連の型定義)
├── quizTypes.ts (クイズ関連の型定義)
└── databaseTypes.ts (データベース関連の型定義)

data/
├── sql/
│   ├── questions/ (ジャンル別に分割)
│   ├── databases/ (データベース別に分割)
│   └── explanations/ (整理・統合)
└── quiz/
    └── randomQuestions.json
```

### 8. 重複するUI要素の統一化
**推奨度: ★★★☆☆**

**現状の問題点:**
- `.btn-gradient` クラスが多数のページで使用されているが、サイズや用途による変種がない
- ナビゲーション要素（トップ、SQL解説リンク等）が複数ページで重複
- モーダルの背景オーバーレイスタイルが重複

**統一化提案:**
```
components/ui/
├── BaseButton.vue (variant対応のボタンコンポーネント)
├── NavigationLinks.vue (共通ナビゲーション)
├── Modal.vue (汎用モーダルラッパー)
└── Overlay.vue (背景オーバーレイ)
```

**重複箇所:**
- `pages/sql/[[id]].vue`: ナビゲーションリンク
- `pages/sql/explanation/[sqlKeyword].vue`: 同様のナビゲーション
- `pages/sql/explanation/index.vue`: 同様のナビゲーション
- `pages/index.vue`: ボタン群

## 📋 リファクタリング実施の指針

### 段階的アプローチ
1. **第1段階**: pages/sql/[[id]].vueの分割（最高優先度）
2. **第2段階**: AiPromptModal.vueの分割
3. **第3段階**: composablesの整理
4. **第4段階**: 共通コンポーネントの抽出
5. **第5段階**: データファイルの整理と型定義の追加

### 注意事項
- 既存の動作を維持しながら段階的に分割する
- 各段階でテストを実行し、機能が正常に動作することを確認する
- TypeScript型定義を適切に設定する
- Nuxt 3のauto-importを活用してインポート文を最小化する
- 分割後もAlaSQL、OpenAI API等の外部依存関係が正常に動作することを確認する

### コード品質向上のための追加提案

#### 1. 型定義の強化
現在のコードには基本的な型定義が不足している箇所があります:
```typescript
// 追加すべき型定義例
interface SqlQuestion {
  id: number
  level: number
  genre: string
  subgenre?: string
  question: string
  answer: string
  DbName: string
  showRecordsSql?: string
}

interface DatabaseTable {
  name: string
  columns: string[]
  rows: Record<string, any>[]
}
```

#### 2. エラーハンドリングの統一
現在は各コンポーネントで個別にエラーハンドリングを実装していますが、統一的なエラー処理システムの導入を推奨:
```
composables/
└── useErrorHandler.ts (統一エラーハンドリング)
```

#### 3. 定数の外部化
ハードコーディングされた値（タイムアウト、メッセージ、設定値など）の外部化:
```
constants/
├── messages.ts (エラーメッセージ、UI文言)
├── config.ts (設定値)
└── urls.ts (API エンドポイント、内部リンク)
```

### 期待される全体的な効果
- **保守性の向上**: ファイルサイズが小さくなり、変更時の影響範囲が限定される
- **可読性の向上**: 各ファイルの責任が明確になり、理解しやすくなる
- **再利用性の向上**: 分割されたコンポーネントが他の場所でも使用可能になる
- **テスタビリティの向上**: 小さな単位でのテストが可能になる
- **開発効率の向上**: 新機能追加や既存機能の修正が容易になる