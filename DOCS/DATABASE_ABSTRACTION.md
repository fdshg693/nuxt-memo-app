# データベース抽象化設計

## 使用方法

### 現在の実装（Turso/libSQL with SQLite fallback）
```typescript
import { database } from '~/server/utils/database-factory';

// 自動的にTursoアダプターを使用（環境変数が設定されている場合）
// または SQLite アダプターにフォールバック
const user = await database.getUserByEmail('user@example.com');
```

### 環境変数設定

#### Turso（本番環境推奨）
```bash
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-auth-token"
# DATABASE_TYPE=turso # デフォルト、省略可能
```

#### SQLite（開発・テスト環境）
```bash
DATABASE_TYPE=sqlite
# または Turso 環境変数を設定しない場合自動的にSQLiteフォールバック
```

### 将来のMySQL対応例
```typescript
// 環境変数でデータベースタイプを指定
// DATABASE_TYPE=mysql

// server/utils/mysql-adapter.ts（将来実装）
class MySQLAdapter implements DatabaseAdapter {
  // MySQL特有の実装
}

// database-factory.ts内で自動選択
export const database = DatabaseFactory.create(
  process.env.DATABASE_TYPE || 'turso'
);
```

### PostgreSQL対応例
```typescript
// DATABASE_TYPE=postgresql

class PostgreSQLAdapter implements DatabaseAdapter {
  // PostgreSQL特有の実装
}
```

## 拡張方法

1. 新しいアダプタークラスを作成（`DatabaseAdapter`インターface実装）
2. `DatabaseFactory.create()`に新しいケースを追加
3. 環境変数`DATABASE_TYPE`で切り替え

## 利点

- **型安全性**: TypeScriptインターフェースにより型チェックされる
- **実装の統一**: すべてのデータベース操作が同一インターフェース
- **簡単な切り替え**: 環境変数のみで変更可能
- **テスタビリティ**: モックアダプターを簡単に作成可能
- **Turso統合**: クラウドネイティブなlibSQLデータベースのサポート
- **自動フォールバック**: Turso環境変数が未設定の場合SQLiteに自動フォールバック

## 非同期対応

すべてのデータベース操作は非同期（Promise）ベースです：

```typescript
// ❌ 旧バージョン（同期）
const user = database.getUserByEmail(email);

// ✅ 新バージョン（非同期）
const user = await database.getUserByEmail(email);
```