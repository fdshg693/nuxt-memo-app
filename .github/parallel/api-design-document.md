# API設計書 - Developer B実装

## PROMPT-004: OpenAI API改善

### 既存API分析
既存の `/server/api/openai.post.ts` には以下の問題がありました：
- 単純なプロンプト転送のみ
- エラーハンドリングが不十分
- レスポンス形式の統一性がない
- コンテキスト情報の統合機能がない
- 入力検証がない

### 改善されたAPI仕様

#### エンドポイント
- `POST /api/openai` (既存、後方互換性あり)
- `POST /api/openai-enhanced` (新機能フル対応)

#### リクエスト形式

**基本形式（後方互換）**
```typescript
{
  "prompt": string // 従来の単純プロンプト
}
```

**拡張形式**
```typescript
{
  "userPrompt": string,           // ユーザーの自由テキスト入力
  "context": {                    // 問題コンテキスト
    "question": string,           // 現在の問題文
    "database": string,           // データベース名
    "explanation": string[]       // 関連説明文章の配列
  },
  "options": {                    // オプション設定
    "includeReasoning": boolean,  // 推論過程を含めるか
    "includeSuggestions": boolean, // 学習提案を含めるか
    "maxTokens": number,          // 最大トークン数 (100-4000)
    "temperature": number,        // 創造性レベル (0-2)
    "systemMessage": string       // カスタムシステムメッセージ
  }
}
```

#### レスポンス形式

**基本レスポンス**
```typescript
string // Markdown形式の回答
```

**拡張レスポンス**
```typescript
{
  "answer": string,              // メイン回答（Markdown）
  "reasoning": string,           // 推論過程（オプション）
  "suggestions": string[],       // 関連学習項目（オプション）
  "error": string               // エラーメッセージ（エラー時のみ）
}
```

### 主要改善点

1. **コンテキスト統合**: 問題文、データベース情報、説明文章を自動統合
2. **構造化レスポンス**: 回答、推論、提案を分離して提供
3. **入力検証**: TypeScript + Zod による型安全性
4. **エラーハンドリング**: 詳細なエラー情報とユーザーフレンドリーなメッセージ
5. **後方互換性**: 既存のAPIコールは変更なしで動作

---

## GENERATE-001: AI問題生成API

### 新規APIエンドポイント
`POST /api/generate-question`

### データフロー設計

```
リクエスト受信
    ↓
入力検証（Zod）
    ↓
データベース検索・解析
    ↓
AI問題生成プロンプト構築
    ↓
OpenAI API呼び出し
    ↓
レスポンス解析・検証
    ↓
構造化レスポンス返却
```

### リクエスト仕様

```typescript
{
  "databaseName": string,        // 対象データベース名（必須）
  "difficulty": 1|2|3|4|5,      // 難易度レベル（必須）
  "sqlTypes": string[],          // 対象SQL種別配列（必須）
  "questionCount": number,       // 生成問題数 1-10（デフォルト：1）
  "options": {
    "includeExplanation": boolean,  // 解説を含めるか（デフォルト：true）
    "language": "ja"|"en",         // 言語（デフォルト："ja"）
    "generateTestData": boolean    // テストデータ生成（デフォルト：false）
  }
}
```

### レスポンス仕様

```typescript
{
  "success": boolean,
  "questions": GeneratedQuestion[],
  "error": string,              // エラー時のみ
  "metadata": {                 // 生成メタデータ
    "databaseInfo": {
      "name": string,
      "tables": number,
      "columns": number,
      "rows": number
    },
    "generationTime": number,   // 生成時間（ms）
    "model": string            // 使用AIモデル
  }
}

interface GeneratedQuestion {
  "question": string,          // 問題文
  "answer": string,           // 正解SQL
  "explanation": string,      // 解説
  "difficulty": number,       // 難易度
  "DbName": string,          // データベース名
  "genre": string,           // SQL種別
  "level": number            // レベル（難易度と同じ）
}
```

### データベース解析機能

1. **構造解析**
   - テーブル列の数と名前
   - データ型の推論
   - サンプルデータの取得

2. **問題生成ロジック**
   - 難易度別のSQL種別制限
   - データベーススキーマに基づく適切な問題生成
   - 教育的価値の高い問題設計

### 難易度別ガイドライン

- **レベル1**: 基本的な単一テーブル操作
- **レベル2**: 複数条件、基本的な集計
- **レベル3**: JOIN、GROUP BY + HAVING
- **レベル4**: 外部結合、複雑なサブクエリ
- **レベル5**: 高度な結合、ウィンドウ関数

---

## セキュリティ・パフォーマンス設計

### 入力検証
- Zodスキーマによる型安全な入力検証
- SQLインジェクション対策
- レート制限（将来実装予定）

### エラーハンドリング
- 段階的なエラーキャッチ
- ユーザーフレンドリーなエラーメッセージ
- 詳細なサーバーログ

### パフォーマンス最適化
- リクエスト時間の測定
- 適切なトークン制限
- レスポンスサイズの最適化

---

## 他チームとの連携仕様

### Developer A（フロントエンド）との連携
- APIコールインターフェースの提供
- エラーレスポンスの統一形式
- 非同期処理対応

### Developer C（データ）との連携
- 生成問題のデータスキーマ互換性
- sqlQuestions.json形式への適合
- データベース構造の理解

### Developer D（マークダウン）との連携
- Markdown形式でのレスポンス提供
- 構造化された説明文の生成
- 表示用フォーマットの統一

---

## テスト設計案

### 単体テスト
- API入力検証テスト
- データベース解析ロジックテスト
- プロンプト生成ロジックテスト

### 統合テスト  
- OpenAI API連携テスト
- エンドツーエンドAPI呼び出しテスト
- エラーケースの検証

### パフォーマンステスト
- レスポンス時間測定
- 大量リクエスト処理テスト
- メモリ使用量監視