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
        is_admin BOOLEAN DEFAULT 0,
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

    // Migration: Add is_admin column if it doesn't exist
    try {
      this.db.exec(`ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0`);
      console.log('Added is_admin column to users table');
    } catch (error: any) {
      // Column already exists or other error - this is expected
      if (!error.message.includes('duplicate column name')) {
        console.warn('Migration warning:', error.message);
      }
    }

    // Migration: Add Stripe-related columns if they don't exist
    try {
      this.db.exec(`ALTER TABLE users ADD COLUMN stripe_customer_id TEXT`);
      console.log('Added stripe_customer_id column to users table');
    } catch (error: any) {
      if (!error.message.includes('duplicate column name')) {
        console.warn('Migration warning:', error.message);
      }
    }

    try {
      this.db.exec(`ALTER TABLE users ADD COLUMN subscription_status TEXT`);
      console.log('Added subscription_status column to users table');
    } catch (error: any) {
      if (!error.message.includes('duplicate column name')) {
        console.warn('Migration warning:', error.message);
      }
    }

    try {
      this.db.exec(`ALTER TABLE users ADD COLUMN subscription_id TEXT`);
      console.log('Added subscription_id column to users table');
    } catch (error: any) {
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
  async createUser(email: string, username: string, passwordHash?: string, isAdmin: boolean = false): Promise<UserData> {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO users (email, username, password_hash, is_admin, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(email, username, passwordHash || null, isAdmin ? 1 : 0, now, now);
    
    return this.getUserById(Number(result.lastInsertRowid))!;
  }

  async getUserByEmail(email: string): Promise<UserData | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const result = stmt.get(email) as any;
    if (result) {
      result.is_admin = Boolean(result.is_admin);
    }
    return result as UserData | null;
  }

  async getUserById(id: number): Promise<UserData | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const result = stmt.get(id) as any;
    if (result) {
      result.is_admin = Boolean(result.is_admin);
    }
    return result as UserData | null;
  }

  async getAllUsers(): Promise<UserData[]> {
    const stmt = this.db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    const results = stmt.all() as any[];
    return results.map(result => {
      result.is_admin = Boolean(result.is_admin);
      return result as UserData;
    });
  }

  async updateUser(id: number, data: Partial<UserData>): Promise<boolean> {
    const updates = [];
    const values = [];
    
    if (data.username !== undefined) {
      updates.push('username = ?');
      values.push(data.username);
    }
    
    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    
    if (data.password_hash !== undefined) {
      updates.push('password_hash = ?');
      values.push(data.password_hash);
    }
    
    if (data.is_admin !== undefined) {
      updates.push('is_admin = ?');
      values.push(data.is_admin ? 1 : 0);
    }

    if (data.stripe_customer_id !== undefined) {
      updates.push('stripe_customer_id = ?');
      values.push(data.stripe_customer_id);
    }

    if (data.subscription_status !== undefined) {
      updates.push('subscription_status = ?');
      values.push(data.subscription_status);
    }

    if (data.subscription_id !== undefined) {
      updates.push('subscription_id = ?');
      values.push(data.subscription_id);
    }
    
    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = this.db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
    return stmt.run(...values).changes > 0;
  }

  async deleteUser(id: number): Promise<boolean> {
    // First delete user's progress and sessions
    await this.clearUserProgress(id);
    const deleteSessionsStmt = this.db.prepare('DELETE FROM sessions WHERE user_id = ?');
    deleteSessionsStmt.run(id);
    
    // Then delete the user
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id).changes > 0;
  }

  // Progress operations
  async saveProgress(userId: number, questionId: number, genre?: string, subgenre?: string, level?: number): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO user_progress 
      (user_id, question_id, answered_at, genre, subgenre, level)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(userId, questionId, new Date().toISOString(), genre, subgenre, level);
  }

  async getUserProgress(userId: number): Promise<UserProgressData[]> {
    const stmt = this.db.prepare('SELECT * FROM user_progress WHERE user_id = ? ORDER BY answered_at DESC');
    return stmt.all(userId) as UserProgressData[];
  }

  async clearUserProgress(userId: number): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM user_progress WHERE user_id = ?');
    return stmt.run(userId).changes > 0;
  }

  // Session operations  
  async createSession(sessionId: string, userId: number): Promise<void> {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO sessions (session_id, user_id, created_at, last_activity)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(sessionId, userId, now, now);
  }

  async getSession(sessionId: string): Promise<{ user_id: number } | null> {
    const stmt = this.db.prepare('SELECT user_id FROM sessions WHERE session_id = ?');
    const session = stmt.get(sessionId) as { user_id: number } | null;
    
    if (session) {
      // Update last activity
      const updateStmt = this.db.prepare('UPDATE sessions SET last_activity = ? WHERE session_id = ?');
      updateStmt.run(new Date().toISOString(), sessionId);
    }
    
    return session;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
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