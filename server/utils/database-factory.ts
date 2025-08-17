// server/utils/database-factory.ts
import { DatabaseAdapter } from './database-interface';
import { userDatabase as sqliteAdapter } from './database';
import { TursoAdapter } from './turso-adapter';

// Database factory for easy swapping between different database implementations
export class DatabaseFactory {
  static create(type: 'sqlite' | 'mysql' | 'postgresql' | 'turso' = 'turso'): DatabaseAdapter {
    switch (type) {
      case 'sqlite':
        return sqliteAdapter;
      case 'turso':
        // Check if Turso environment variables are available
        const config = useRuntimeConfig?.() || {};
        const tursoUrl = config.tursoUrl || process.env.TURSO_DATABASE_URL;
        const tursoToken = config.tursoAuthToken || process.env.TURSO_AUTH_TOKEN;
        
        if (!tursoUrl || !tursoToken) {
          console.warn('Turso environment variables not found, falling back to SQLite');
          return sqliteAdapter;
        }
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

// Export default database instance - now defaults to Turso with SQLite fallback
export const database = DatabaseFactory.create(
  (useRuntimeConfig?.()?.databaseType || process.env.DATABASE_TYPE as 'sqlite' | 'mysql' | 'postgresql' | 'turso') || 'turso'
);