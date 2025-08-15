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

// Export default database instance - now defaults to Turso
export const database = DatabaseFactory.create(
  (process.env.DATABASE_TYPE as 'sqlite' | 'mysql' | 'postgresql' | 'turso') || 'turso'
);