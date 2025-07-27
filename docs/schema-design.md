# データスキーマ設計 - Developer C

## 概要
このドキュメントでは、Developer Cが実装したプロンプトテンプレートと選択式問題のデータスキーマについて説明します。

## プロンプトテンプレートスキーマ (PROMPT-001)

### ファイル構成
- **データファイル**: `/data/promptTemplates.json`
- **スキーマ定義**: `/data/schemas/promptTemplateSchema.json` 
- **Composable**: `/composables/usePromptTemplates.ts`

### スキーマ構造
```typescript
interface PromptTemplate {
  id: string                    // テンプレートの一意識別子
  name: string                  // テンプレート名
  category: string              // explanation, hint, debug, alternative, optimization
  template: string              // プロンプトテンプレート（変数プレースホルダー含む）
  variables: PromptVariable[]   // テンプレート変数の定義
  explanationSources: string[]  // 参照する説明文章ファイル名
}

interface PromptVariable {
  name: string        // 変数名
  type: string        // string, number, boolean
  description: string // 変数の説明
  required: boolean   // 必須フィールドかどうか
}
```

### カテゴリ
- **explanation**: 基本的なSQL文の詳細説明
- **hint**: 問題解決のためのヒント提供
- **debug**: SQL構文エラーのデバッグ支援
- **alternative**: 別解の提案
- **optimization**: クエリ最適化の提案

### 使用例
```typescript
import { usePromptTemplates } from '@/composables/usePromptTemplates'

const { loadTemplates, interpolateTemplate } = usePromptTemplates()

// テンプレートを読み込み
await loadTemplates()

// テンプレートに変数を埋め込み
const prompt = interpolateTemplate('explain-sql-basic', {
  sqlQuery: 'SELECT * FROM users WHERE age > 25',
  tableName: 'users',
  explanationContext: '年齢による絞り込み'
})
```

## 選択式問題スキーマ (PRACTICAL-001)

### ファイル構成
- **データファイル**: `/data/multipleChoiceQuestions.json`
- **スキーマ定義**: `/data/schemas/multipleChoiceQuestionSchema.json`
- **Composable**: `/composables/useMultipleChoiceQuiz.ts`

### スキーマ構造
```typescript
interface MultipleChoiceQuestion {
  id: string                    // カテゴリ-番号形式 (例: "transaction-001")
  type: 'multiple-choice'       // 問題タイプ（固定値）
  category: string              // transaction, performance, deadlock
  subCategory: string           // 詳細分類
  level: number                 // 難易度レベル（1-5）
  question: string              // 問題文（Markdown対応）
  choices: string[]             // 選択肢のリスト
  correct: number               // 正解選択肢のインデックス（0始まり）
  explanation: string           // 解説文（Markdown対応）
  tags: string[]                // 検索・分類用タグ
  references: QuestionReference[] // 参考資料
}

interface QuestionReference {
  title: string // 参考資料のタイトル
  url: string   // 参考資料のURL
}
```

### カテゴリと詳細分類
- **transaction**
  - isolation-level: トランザクション分離レベル
  - acid: ACID特性
  - locking: ロック機構
- **performance**
  - index: インデックス設計
  - query-plan: クエリ実行計画
  - optimization: クエリ最適化
- **deadlock**
  - prevention: デッドロック防止
  - detection: デッドロック検出
  - resolution: デッドロック解決

### 使用例
```typescript
import { useMultipleChoiceQuiz } from '@/composables/useMultipleChoiceQuiz'

const { loadQuestions, checkAnswer, getQuestionsByCategory } = useMultipleChoiceQuiz()

// 問題を読み込み
await loadQuestions()

// カテゴリ別の問題を取得
const transactionQuestions = getQuestionsByCategory('transaction')

// 回答をチェック
const result = checkAnswer('transaction-001', 3)
console.log(result.isCorrect) // true/false
console.log(result.explanation) // 解説文
```

## 既存システムとの統合

### useSqlQuiz との互換性
新しいスキーマは既存の `useSqlQuiz()` composable と同様のパターンを使用し、以下の機能を提供：

- データの非同期読み込み
- カテゴリ・レベル別のフィルタリング
- 検索機能
- グループ化されたナビゲーション

### explanation システムとの連携
プロンプトテンプレートは `explanationSources` フィールドを通じて既存の explanation システム（`/data/sqlExplanation/`）と連携可能。

## バリデーション
各スキーマには厳密な JSON Schema 定義があり、以下を保証：

- データ型の整合性
- 必須フィールドの存在
- 値の範囲チェック
- 一意性制約
- フォーマット検証

## 拡張性
スキーマは将来の機能拡張を考慮して設計：

- 新しいカテゴリの追加が容易
- 多言語対応の準備
- メタデータの拡張可能
- バージョニング対応