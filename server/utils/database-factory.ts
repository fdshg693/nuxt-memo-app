// server/utils/database-factory.ts
import { DatabaseAdapter } from './database-interface';
import { userDatabase as sqliteAdapter } from './database';
import { TursoAdapter } from './turso-adapter';

/**
 * データベースファクトリークラス
 * 
 * 環境に応じて適切なデータベースアダプターを選択・生成します。
 * デフォルトではTursoを使用し、環境変数が設定されていない場合はSQLiteにフォールバック。
 * 
 * @see DOCS/DATABASE_ABSTRACTION.md - データベース抽象化の詳細設計
 * @see DOCS/TURSO_SDK.md - Turso SDK の使用方法
 */
// Database factory for easy swapping between different database implementations
export class DatabaseFactory {
  /**
   * データベースアダプターを作成
   * 
   * Turso用の環境変数チェックとSQLiteフォールバック機能を含む
   * 
   * @param type - データベースタイプ（デフォルト: 'turso'）
   * @returns データベースアダプターインスタンス
   */
  static create(type: 'sqlite' | 'mysql' | 'postgresql' | 'turso' = 'turso'): DatabaseAdapter {
    switch (type) {
      case 'sqlite':
        return sqliteAdapter;
      case 'turso':
        // Turso環境変数の存在確認 - libSQL接続に必要
        const config = useRuntimeConfig?.() || {};
        const tursoUrl = config.tursoUrl || process.env.TURSO_DATABASE_URL;        // libsql://your-database.turso.io
        const tursoToken = config.tursoAuthToken || process.env.TURSO_AUTH_TOKEN;  // 認証トークン
        
        // Turso環境変数が設定されていない場合はSQLiteにフォールバック
        // 開発環境では TURSO_* 環境変数を設定せずにローカルSQLiteで開発可能
        if (!tursoUrl || !tursoToken) {
          console.warn('Turso environment variables not found, falling back to SQLite');
          return sqliteAdapter;
        }
        // Turso SDK を使用したアダプターを返す
        return new TursoAdapter();
      case 'mysql':
        // Future implementation
        throw new Error('MySQL adapter not implemented yet');
      case 'postgresql':
        // Future implementation
        throw new Error('PostgreSQL adapter not implemented yet');
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }
}

// デフォルトデータベースインスタンスをエクスポート
// Tursoを優先し、環境変数未設定時は自動的にSQLiteフォールバック
export const database = DatabaseFactory.create(
  (useRuntimeConfig?.()?.databaseType || process.env.DATABASE_TYPE as 'sqlite' | 'mysql' | 'postgresql' | 'turso') || 'turso'
);