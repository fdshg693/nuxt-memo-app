# データベース抽象化設計

## 使用方法

### 現在の実装（SQLite）
```typescript
import { database } from '~/server/utils/database-factory';

// 自動的にSQLiteアダプターを使用
const user = database.getUserByEmail('user@example.com');
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
  process.env.DATABASE_TYPE || 'sqlite'
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