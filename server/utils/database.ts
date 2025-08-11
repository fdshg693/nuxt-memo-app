// server/utils/database.ts
import Database from 'better-sqlite3';
import { join } from 'path';
import { DatabaseAdapter, UserData, UserProgressData, SessionData } from './database-interface';
import bcrypt from 'bcrypt';

class SQLiteAdapter implements DatabaseAdapter {
  private db: Database.Database;

  constructor() {
    // Create database path based on environment
    // In production/serverless, use /tmp which is writable
    // In development, use the data directory for persistence
    const isProduction = process.env.NODE_ENV === 'production';
    const dbDir = isProduction ? '/tmp' : join(process.cwd(), 'data');
    const dbPath = join(dbDir, 'users.db');
    
    console.log(`Initializing SQLite database at: ${dbPath}`);
    
    try {
      this.db = new Database(dbPath);
      this.initTables();
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      // In production, try to create the directory if it doesn't exist
      if (isProduction) {
        try {
          const fs = require('fs');
          if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
          }
          this.db = new Database(dbPath);
          this.initTables();
          console.log('SQLite database initialized successfully after creating directory');
        } catch (retryError) {
          console.error('Failed to initialize SQLite database even after creating directory:', retryError);
          throw retryError;
        }
      } else {
        throw error;
      }
    }
  }

  private initTables() {
    // Create users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        password_hash TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Migration: Add password_hash column if it doesn't exist
    try {
      this.db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT`);
      console.log('Added password_hash column to users table');
    } catch (error: any) {
      // Column already exists or other error - this is expected
      if (!error.message.includes('duplicate column name')) {
        console.warn('Migration warning:', error.message);
      }
    }

    // Create user_progress table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        answered_at TEXT NOT NULL,
        genre TEXT,
        subgenre TEXT,
        level INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, question_id)
      )
    `);

    // Create sessions table for persistent session storage
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        last_activity TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  }

  // User operations
  createUser(email: string, username: string, passwordHash?: string): UserData {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO users (email, username, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(email, username, passwordHash || null, now, now);
    
    return this.getUserById(Number(result.lastInsertRowid))!;
  }

  getUserByEmail(email: string): UserData | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as UserData | null;
  }

  getUserById(id: number): UserData | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as UserData | null;
  }

  updateUser(id: number, data: Partial<UserData>): boolean {
    const updates = [];
    const values = [];
    
    if (data.username) {
      updates.push('username = ?');
      values.push(data.username);
    }
    
    if (data.password_hash) {
      updates.push('password_hash = ?');
      values.push(data.password_hash);
    }
    
    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = this.db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
    return stmt.run(...values).changes > 0;
  }

  // Progress operations
  saveProgress(userId: number, questionId: number, genre?: string, subgenre?: string, level?: number): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO user_progress 
      (user_id, question_id, answered_at, genre, subgenre, level)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(userId, questionId, new Date().toISOString(), genre, subgenre, level);
  }

  getUserProgress(userId: number): UserProgressData[] {
    const stmt = this.db.prepare('SELECT * FROM user_progress WHERE user_id = ? ORDER BY answered_at DESC');
    return stmt.all(userId) as UserProgressData[];
  }

  clearUserProgress(userId: number): boolean {
    const stmt = this.db.prepare('DELETE FROM user_progress WHERE user_id = ?');
    return stmt.run(userId).changes > 0;
  }

  // Session operations  
  createSession(sessionId: string, userId: number): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO sessions (session_id, user_id, created_at, last_activity)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(sessionId, userId, now, now);
  }

  getSession(sessionId: string): { user_id: number } | null {
    const stmt = this.db.prepare('SELECT user_id FROM sessions WHERE session_id = ?');
    const session = stmt.get(sessionId) as { user_id: number } | null;
    
    if (session) {
      // Update last activity
      const updateStmt = this.db.prepare('UPDATE sessions SET last_activity = ? WHERE session_id = ?');
      updateStmt.run(new Date().toISOString(), sessionId);
    }
    
    return session;
  }

  deleteSession(sessionId: string): boolean {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE session_id = ?');
    return stmt.run(sessionId).changes > 0;
  }

  // Utility methods
  close(): void {
    this.db.close();
  }
}

// Export singleton instance with interface
export const userDatabase: DatabaseAdapter = new SQLiteAdapter();