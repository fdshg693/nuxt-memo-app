# Turso SDK 基本ドキュメント

## 概要
このプロジェクトでは、Vercelデプロイ用のクラウドデータベースソリューションとしてTurso（libSQL）を使用しています。
TursoはSQLiteと互換性のあるサーバーレスデータベースで、エッジでの高速アクセスを提供します。

## Turso とは

### 特徴
- **SQLite互換**: 既存のSQLiteクエリがそのまま動作
- **サーバーレス**: 自動スケーリングと管理不要
- **エッジレプリケーション**: 世界中のエッジロケーションで高速アクセス
- **libSQL基盤**: SQLiteのフォーク版で追加機能を提供

### 従来のSQLiteとの違い
| Turso (libSQL) | SQLite |
|---------------|--------|
| クラウドホスト | ローカルファイル |
| 自動バックアップ | 手動バックアップ |
| マルチリージョン | 単一サーバー |
| HTTP/WebSocket API | ファイルベースAPI |

## 基本的な使い方

### 1. クライアント初期化

#### TypeScript/JavaScriptでの初期化
```typescript
import { createClient, type Client } from '@libsql/client';

const client = createClient({
  url: 'libsql://your-database.turso.io',    // Turso データベースURL
  authToken: 'your-auth-token'               // 認証トークン
});
```

#### 環境変数を使用した設定
```typescript
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,       // libsql://...
  authToken: process.env.TURSO_AUTH_TOKEN    // 認証トークン
});
```

### 2. 基本的なデータベース操作

#### テーブル作成
```typescript
await client.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);
```

#### データ挿入
```typescript
await client.execute({
  sql: `INSERT INTO users (email, username, created_at) 
        VALUES (?, ?, ?)`,
  args: ['user@example.com', 'testuser', new Date().toISOString()]
});
```

#### データ取得
```typescript
const result = await client.execute({
  sql: `SELECT * FROM users WHERE email = ?`,
  args: ['user@example.com']
});

const user = result.rows[0]; // 最初の行を取得
```

#### データ更新
```typescript
await client.execute({
  sql: `UPDATE users SET username = ? WHERE id = ?`,
  args: ['newusername', userId]
});
```

#### データ削除
```typescript
await client.execute({
  sql: `DELETE FROM users WHERE id = ?`,
  args: [userId]
});
```

### 3. トランザクション処理

#### 基本的なトランザクション
```typescript
const transaction = await client.transaction();

try {
  await transaction.execute({
    sql: `INSERT INTO users (email, username, created_at) VALUES (?, ?, ?)`,
    args: ['user1@example.com', 'user1', new Date().toISOString()]
  });
  
  await transaction.execute({
    sql: `INSERT INTO user_progress (user_id, question_id) VALUES (?, ?)`,
    args: [userId, questionId]
  });
  
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

## 本プロジェクトでの実装

### 1. データベースアダプター (`server/utils/turso-adapter.ts`)

#### クラス構造
```typescript
export class TursoAdapter implements DatabaseAdapter {
  private client: Client;
  private initPromise: Promise<void>;

  constructor() {
    // 環境変数から設定を取得
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    
    // クライアント初期化
    this.client = createClient({ url, authToken });
    
    // テーブル初期化
    this.initPromise = this.initTables();
  }
}
```

#### 主要メソッド
```typescript
// ユーザー作成
async createUser(email: string, username: string, passwordHash: string, isAdmin: boolean = false): Promise<UserData> {
  await this.ensureInitialized();
  const result = await this.client.execute({
    sql: `INSERT INTO users (email, username, password_hash, is_admin, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [email, username, passwordHash, isAdmin ? 1 : 0, now, now]
  });
  
  return { id: result.lastInsertRowid as number, email, username, /* ... */ };
}

// 進捗保存
async saveProgress(userId: number, questionId: number, genre?: string, subgenre?: string, level?: number): Promise<void> {
  await this.ensureInitialized();
  await this.client.execute({
    sql: `INSERT OR REPLACE INTO user_progress 
          (user_id, question_id, answered_at, genre, subgenre, level)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [userId, questionId, new Date().toISOString(), genre ?? null, subgenre ?? null, level ?? null]
  });
}
```

### 2. データベースファクトリー (`server/utils/database-factory.ts`)

#### 自動フォールバック機能
```typescript
export class DatabaseFactory {
  static create(type: 'sqlite' | 'turso' = 'turso'): DatabaseAdapter {
    switch (type) {
      case 'turso':
        // Turso環境変数をチェック
        const tursoUrl = process.env.TURSO_DATABASE_URL;
        const tursoToken = process.env.TURSO_AUTH_TOKEN;
        
        if (!tursoUrl || !tursoToken) {
          console.warn('Turso environment variables not found, falling back to SQLite');
          return sqliteAdapter; // SQLiteにフォールバック
        }
        return new TursoAdapter();
        
      case 'sqlite':
        return sqliteAdapter;
    }
  }
}
```

### 3. 環境設定

#### 必要な環境変数
```bash
# .env ファイル
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-auth-token"

# オプション: データベースタイプ指定（デフォルトはturso）
DATABASE_TYPE=turso
```

#### Nuxt Runtime Config (`nuxt.config.ts`)
```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    // サーバーサイドのみ
    tursoUrl: process.env.TURSO_DATABASE_URL,
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN,
    databaseType: process.env.DATABASE_TYPE || 'turso'
  }
});
```

## エラーハンドリング

### 接続エラー
```typescript
try {
  const client = createClient({ url, authToken });
  await client.execute('SELECT 1'); // 接続テスト
} catch (error) {
  if (error.message.includes('SQLITE_AUTH')) {
    throw new Error('Invalid Turso authentication token');
  }
  if (error.message.includes('network')) {
    throw new Error('Network connection to Turso failed');
  }
  throw error;
}
```

### クエリエラー
```typescript
async executeQuery(sql: string, args: any[]): Promise<any> {
  try {
    return await this.client.execute({ sql, args });
  } catch (error) {
    // SQLiteエラーコードを処理
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Duplicate entry detected');
    }
    if (error.message.includes('no such table')) {
      throw new Error('Table does not exist');
    }
    throw error;
  }
}
```

## パフォーマンス最適化

### 1. 接続の再利用
```typescript
// ✅ 良い例: クライアントインスタンスを再利用
class TursoAdapter {
  private client: Client;
  
  constructor() {
    this.client = createClient({ url, authToken });
  }
}

// ❌ 悪い例: 毎回新しいクライアントを作成
async function badQuery() {
  const client = createClient({ url, authToken }); // 毎回作成
  return await client.execute('SELECT * FROM users');
}
```

### 2. バッチクエリ
```typescript
// 複数のクエリを一度に実行
const results = await client.batch([
  { sql: 'INSERT INTO users (email) VALUES (?)', args: ['user1@example.com'] },
  { sql: 'INSERT INTO users (email) VALUES (?)', args: ['user2@example.com'] },
  { sql: 'INSERT INTO users (email) VALUES (?)', args: ['user3@example.com'] }
]);
```

### 3. 適切なインデックス
```typescript
await client.execute(`
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_progress_user_question ON user_progress(user_id, question_id);
`);
```

## セキュリティ考慮事項

### 1. 認証トークンの管理
```typescript
// ✅ 環境変数を使用
const authToken = process.env.TURSO_AUTH_TOKEN;

// ❌ ハードコーディング禁止
const authToken = "your-secret-token"; // 絶対ダメ
```

### 2. SQLインジェクション対策
```typescript
// ✅ パラメータ化クエリを使用
await client.execute({
  sql: 'SELECT * FROM users WHERE email = ?',
  args: [userEmail] // 安全
});

// ❌ 文字列結合は危険
await client.execute(`SELECT * FROM users WHERE email = '${userEmail}'`); // 危険
```

## デプロイメント

### Vercel でのデプロイ
1. Tursoデータベースの作成
2. 環境変数の設定
3. Vercel Functions での自動使用

### 環境変数設定 (Vercel)
```bash
# Vercel CLI または Dashboard で設定
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
```

## トラブルシューティング

### よくある問題と解決策

#### 1. 認証エラー
```
Error: SQLITE_AUTH: not authorized
```
**解決**: `TURSO_AUTH_TOKEN`が正しく設定されているか確認

#### 2. 接続タイムアウト
```
Error: network connection timeout
```
**解決**: ネットワーク接続とTursoサービス状態を確認

#### 3. テーブルが見つからない
```
Error: no such table: users
```
**解決**: `initTables()`メソッドが正しく実行されているか確認

## 関連リンク

- [Turso公式ドキュメント](https://docs.turso.tech/)
- [libSQL TypeScript SDK](https://docs.turso.tech/sdk/ts/quickstart)
- [libSQL TypeScript リファレンス](https://docs.turso.tech/sdk/ts/reference)
- [本プロジェクトでの実装](../server/utils/turso-adapter.ts)
- [データベース抽象化設計](./DATABASE_ABSTRACTION.md)

## 更新履歴

- 2024-12: 初版作成
- プロジェクトでのTurso使用パターンをドキュメント化
- SQLiteフォールバック機能の説明追加