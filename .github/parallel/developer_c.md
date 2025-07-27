# Developer C - データスキーマ設計・問題作成システム

## Day 1-2の担当タスク: PROMPT-001 + PRACTICAL-001 完了 (スキーマ設計)

### 主要責任範囲
- プロンプトテンプレート用JSONスキーマ設計
- 選択式問題用データ構造設計
- データ整合性・拡張性を考慮した設計

### Day 1-2 具体的作業内容

#### 1. 既存データ構造分析 (Day 1 午前)
- `/data/sqlQuestions.json` - 既存SQL問題の構造把握
- `/data/sqlDatabases.json` - データベース定義の分析
- `/data/sqlExplanation/` - 説明文章の構造理解
- 既存システムとの整合性確保のための要件整理

#### 2. PROMPT-001: プロンプトテンプレートスキーマ設計 (Day 1 午後)
- プロンプトテンプレート管理用のJSONスキーマ作成
- `/data/promptTemplates.json` の詳細設計
- カテゴリ分類・検索機能を考慮したデータ構造
- 説明文章との連携機能サポート

#### 3. PRACTICAL-001: 選択式問題スキーマ設計 (Day 2)
- 選択式問題用の新しいJSONスキーマ設計
- TRANSACTION/パフォーマンス/DEAD LOCK問題対応
- 既存SQL問題との統合を考慮した設計
- 難易度・分類・検索機能のサポート

### 設計対象スキーマ

#### プロンプトテンプレートスキーマ
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PromptTemplate",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "テンプレートの一意識別子"
    },
    "name": {
      "type": "string",
      "description": "テンプレート名"
    },
    "category": {
      "type": "string",
      "enum": ["explanation", "hint", "debug", "alternative", "optimization"],
      "description": "プロンプトカテゴリ"
    },
    "template": {
      "type": "string",
      "description": "プロンプトテンプレート（変数プレースホルダー含む）"
    },
    "variables": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "type": {"type": "string"},
          "description": {"type": "string"},
          "required": {"type": "boolean"}
        }
      }
    },
    "explanationSources": {
      "type": "array",
      "items": {"type": "string"},
      "description": "参照する説明文章ファイル名"
    }
  }
}
```

#### 選択式問題スキーマ
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MultipleChoiceQuestion",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^(transaction|performance|deadlock)-\\d{3}$"
    },
    "type": {
      "type": "string",
      "const": "multiple-choice"
    },
    "category": {
      "type": "string",
      "enum": ["transaction", "performance", "deadlock"]
    },
    "subCategory": {
      "type": "string",
      "description": "詳細分類（分離レベル、インデックス等）"
    },
    "level": {
      "type": "integer",
      "minimum": 1,
      "maximum": 5
    },
    "question": {
      "type": "string",
      "description": "問題文（Markdown対応）"
    },
    "choices": {
      "type": "array",
      "items": {"type": "string"},
      "minItems": 2,
      "maxItems": 6
    },
    "correct": {
      "type": "integer",
      "description": "正解選択肢のインデックス（0始まり）"
    },
    "explanation": {
      "type": "string",
      "description": "解説文（Markdown対応）"
    },
    "tags": {
      "type": "array",
      "items": {"type": "string"},
      "description": "検索・分類用タグ"
    },
    "references": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": {"type": "string"},
          "url": {"type": "string"}
        }
      }
    }
  }
}
```

### 参照すべきファイル
- `/data/sqlQuestions.json` - 既存問題構造
- `/data/sqlDatabases.json` - データベース構造
- `/data/sqlExplanation/*.json` - 説明文章構造
- `/composables/useSqlQuiz.ts` - 既存データ利用パターン

### 成果物
1. **`/data/promptTemplates.json`** - プロンプトテンプレート定義ファイル
2. **プロンプトテンプレートスキーマ** - JSON Schema文書
3. **選択式問題スキーマ** - JSON Schema文書
4. **データ移行計画** - 既存データとの統合方針
5. **バリデーション仕様** - データ整合性確保のためのルール

### 他チームとの連携ポイント
- **Developer A**: UIコンポーネントでのデータ利用方法の調整
- **Developer B**: API側でのデータ処理・バリデーション要件
- **Developer D**: TypeScript型定義との連携

### 設計方針
- **拡張性**: 将来的な機能追加に対応できる構造
- **整合性**: 既存データ構造との互換性維持
- **検索性**: カテゴリ・タグによる柔軟な問題検索
- **多言語対応**: 将来的な国際化を考慮した設計

### 優先順位
1. **高**: PROMPT-001 プロンプトテンプレートスキーマ完成
2. **高**: PRACTICAL-001 選択式問題スキーマ完成
3. **中**: 既存データとの統合検証
4. **低**: 高度な検索・分析機能サポート

### 注意事項
- 既存 `useSqlQuiz()` composable との互換性確保
- JSON ファイルサイズとパフォーマンスの両立
- バリデーション実装を考慮したスキーマ設計
- 段階的移行を可能にする下位互換性の確保
