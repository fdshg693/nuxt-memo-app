// server/utils/database.ts
import Database from 'better-sqlite3';
import { join } from 'path';

export interface UserData {
  id: number;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface UserProgressData {
  id: number;
  user_id: number;
  question_id: number;
  answered_at: string;
  genre?: string;
  subgenre?: string;
  level?: number;
}

class UserDatabase {
  private db: Database.Database;

  constructor() {
    // Create database in the project root's data directory
    const dbPath = join(process.cwd(), 'data', 'users.db');
    this.db = new Database(dbPath);
    this.initTables();
  }

  private initTables() {
    // Create users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

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
  createUser(email: string, username: string): UserData {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO users (email, username, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(email, username, now, now);
    
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

// Export singleton instance
export const userDatabase = new UserDatabase();