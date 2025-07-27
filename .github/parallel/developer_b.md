# Developer B - API設計・AI問題生成システム

## Day 1-2の担当タスク: PROMPT-004 + GENERATE-001 開始 (API設計)

### 主要責任範囲
- OpenAI API連携の改善とプロンプト処理ロジック
- AI自動問題生成APIエンドポイントの設計・実装
- サーバーサイド機能の技術アーキテクチャ

### Day 1-2 具体的作業内容

#### 1. 既存API分析・設計要件整理 (Day 1 午前)
- 既存 `/server/api/openai.post.ts` の詳細分析
- 現在のプロンプト処理フローの問題点把握
- AI問題生成APIの要件定義・技術仕様策定

#### 2. APIアーキテクチャ設計 (Day 1 午後)
- **PROMPT-004**: OpenAI APIプロンプト処理改善の設計
  - 自由テキスト入力対応のロジック設計
  - 説明文章動的統合機能の設計
  - エラーハンドリング・レスポンス形式の改善
- **GENERATE-001**: AI問題生成API設計
  - `/server/api/generate-question.post.ts` の詳細設計
  - `/data/sqlDatabases.json` 解析ロジックの設計

#### 3. データフロー・セキュリティ設計 (Day 2)
- OpenAI API呼び出しの最適化
- レート制限・エラーレスポンス処理
- 入力検証・サニタイゼーション設計
- 問題生成結果の検証ロジック設計

### 参照すべきファイル
- `/server/api/openai.post.ts` - 現在のOpenAI API実装
- `/data/sqlDatabases.json` - 問題生成の元データ
- `/nuxt.config.ts` - サーバー設定
- `/.github/copilot-instructions.md` - 既存API設計パターン

### 技術要件
- **ランタイム**: Nuxt 3 server API (Nitro)
- **AI統合**: OpenAI API (gpt-4o-mini)
- **データ処理**: JSON解析・SQL構文生成
- **バリデーション**: zod等による型安全なAPI設計

### API設計方針

#### PROMPT-004: OpenAI API改善
```typescript
// 入力インターフェース
interface EnhancedPromptRequest {
  userPrompt: string;           // 自由テキスト入力
  templateId?: string;          // プロンプトテンプレートID
  context: {
    question: string;
    database: string;
    explanation?: string[];     // 説明文章統合
  };
}

// レスポンス形式
interface PromptResponse {
  answer: string;              // Markdown形式
  reasoning?: string;          // 推論過程
  suggestions?: string[];      // 関連学習項目
}
```

#### GENERATE-001: 問題生成API
```typescript
// 入力インターフェース
interface QuestionGenerateRequest {
  databaseName: string;        // 対象データベース
  difficulty: 1 | 2 | 3 | 4 | 5; // 難易度
  sqlTypes: string[];          // 対象SQL種別
  questionCount: number;       // 生成問題数
}

// 出力形式
interface GeneratedQuestion {
  question: string;
  answer: string;
  explanation: string;
  difficulty: number;
  DbName: string;
}
```

### 成果物
1. **API設計書** - 詳細なエンドポイント仕様
2. **データフロー図** - リクエスト/レスポンス処理の流れ
3. **エラーハンドリング設計** - 例外処理とユーザーフィードバック
4. **テスト計画** - API単体テストの設計案

### 他チームとの連携ポイント
- **Developer A**: UI側からのAPIコール仕様調整
- **Developer C**: 生成問題のデータスキーマ(PROMPT-001, PRACTICAL-001)確認
- **Developer D**: Markdown形式でのレスポンス対応

### 優先順位
1. **高**: 既存OpenAI API分析と改善設計
2. **高**: AI問題生成APIの基本設計
3. **中**: セキュリティ・パフォーマンス最適化
4. **低**: 高度な検証・分析機能

### 注意事項
- OpenAI API キー管理のセキュリティ確保
- レスポンス時間の最適化（ストリーミング対応検討）
- 既存 `/data/` JSON構造との互換性維持
- エラー時のユーザーフレンドリーなメッセージ設計
