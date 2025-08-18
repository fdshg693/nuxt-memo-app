// server/utils/turso-adapter.ts
import { createClient, type Client } from '@libsql/client';
import { DatabaseAdapter, UserData, UserProgressData } from './database-interface';

/**
 * Turso (libSQL) データベースアダプター
 * 
 * Tursoはサーバーレス対応のSQLite互換データベースで、Vercelデプロイメントに最適化されています。
 * libSQL TypeScript SDKを使用してクラウドホストされたデータベースとの通信を行います。
 * 
 * 特徴:
 * - SQLite互換のクエリ構文
 * - エッジロケーションでの高速アクセス
 * - 自動スケーリングとバックアップ
 * - HTTP/WebSocket接続によるサーバーレス対応
 * 
 * @see https://docs.turso.tech/sdk/ts/quickstart - Turso SDK クイックスタート
 * @see https://docs.turso.tech/sdk/ts/reference - Turso SDK リファレンス
 * @see DOCS/TURSO_SDK.md - 本プロジェクトでの詳細な使用方法
 */
export class TursoAdapter implements DatabaseAdapter {
  private client: Client;
  private initPromise: Promise<void>;

  constructor() {
    // Use runtime config for environment variables in Nuxt
    const config = useRuntimeConfig?.() || {};
    const url = config.tursoUrl || process.env.TURSO_DATABASE_URL;
    const authToken = config.tursoAuthToken || process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables are required');
    }

    console.log(`Initializing Turso database connection to: ${url}`);
    
    // libSQL クライアントを初期化
    // createClient() は Turso SDK の主要な初期化関数
    this.client = createClient({
      url,        // libsql://your-database.turso.io 形式のURL
      authToken,  // Tursoダッシュボードから取得した認証トークン
    });

    this.initPromise = this.initTables();
    console.log('Turso database initialized successfully');
  }

  private async ensureInitialized(): Promise<void> {
    await this.initPromise;
  }

  private async initTables() {
    // Create users table
    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        password_hash TEXT,
        is_admin BOOLEAN DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        stripe_customer_id TEXT,
        subscription_status TEXT,
        subscription_id TEXT
      )
    `);

    // Create user_progress table
    await this.client.execute(`
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
    await this.client.execute(`
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
    await this.ensureInitialized();
    const now = new Date().toISOString();
    
    const result = await this.client.execute({
      sql: `INSERT INTO users (email, username, password_hash, is_admin, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [email, username, passwordHash || null, isAdmin ? 1 : 0, now, now]
    });
    
    return this.getUserById(Number(result.lastInsertRowid))!;
  }

  async getUserByEmail(email: string): Promise<UserData | null> {
    await this.ensureInitialized();
    const result = await this.client.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    });
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: Number(row.id),
      email: String(row.email),
      username: String(row.username),
      password_hash: row.password_hash ? String(row.password_hash) : undefined,
      is_admin: Boolean(row.is_admin),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      stripe_customer_id: row.stripe_customer_id ? String(row.stripe_customer_id) : undefined,
      subscription_status: row.subscription_status ? String(row.subscription_status) : undefined,
      subscription_id: row.subscription_id ? String(row.subscription_id) : undefined,
    };
  }

  async getUserById(id: number): Promise<UserData | null> {
    await this.ensureInitialized();
    const result = await this.client.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id]
    });
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: Number(row.id),
      email: String(row.email),
      username: String(row.username),
      password_hash: row.password_hash ? String(row.password_hash) : undefined,
      is_admin: Boolean(row.is_admin),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      stripe_customer_id: row.stripe_customer_id ? String(row.stripe_customer_id) : undefined,
      subscription_status: row.subscription_status ? String(row.subscription_status) : undefined,
      subscription_id: row.subscription_id ? String(row.subscription_id) : undefined,
    };
  }

  async getAllUsers(): Promise<UserData[]> {
    await this.ensureInitialized();
    const result = await this.client.execute('SELECT * FROM users ORDER BY created_at DESC');
    
    return result.rows.map(row => ({
      id: Number(row.id),
      email: String(row.email),
      username: String(row.username),
      password_hash: row.password_hash ? String(row.password_hash) : undefined,
      is_admin: Boolean(row.is_admin),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      stripe_customer_id: row.stripe_customer_id ? String(row.stripe_customer_id) : undefined,
      subscription_status: row.subscription_status ? String(row.subscription_status) : undefined,
      subscription_id: row.subscription_id ? String(row.subscription_id) : undefined,
    }));
  }

  async updateUser(id: number, data: Partial<UserData>): Promise<boolean> {
    await this.ensureInitialized();
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

    const result = await this.client.execute({
      sql: `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      args: values
    });
    
    return result.rowsAffected > 0;
  }

  async deleteUser(id: number): Promise<boolean> {
    await this.ensureInitialized();
    // First delete user's progress and sessions
    await this.clearUserProgress(id);
    await this.client.execute({
      sql: 'DELETE FROM sessions WHERE user_id = ?',
      args: [id]
    });
    
    // Then delete the user
    const result = await this.client.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [id]
    });
    
    return result.rowsAffected > 0;
  }

  // Progress operations
  /**
   * ユーザーの学習進捗をTursoデータベースに保存
   * 
   * Turso SDK の execute() メソッドを使用してINSERT OR REPLACEクエリを実行
   * パラメータ化クエリ（?プレースホルダー）でSQLインジェクション対策を実装
   * 
   * @param userId - ユーザーID
   * @param questionId - 問題ID 
   * @param genre - 問題ジャンル（オプション）
   * @param subgenre - 問題サブジャンル（オプション）
   * @param level - 問題レベル（オプション）
   */
  async saveProgress(userId: number, questionId: number, genre?: string, subgenre?: string, level?: number): Promise<void> {
    await this.ensureInitialized();
    // Turso SDK execute() メソッド: パラメータ化クエリでデータベース操作
    await this.client.execute({
      sql: `INSERT OR REPLACE INTO user_progress 
            (user_id, question_id, answered_at, genre, subgenre, level)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [userId, questionId, new Date().toISOString(), genre ?? null, subgenre ?? null, level ?? null]
    });
  }

  /**
   * 指定ユーザーの学習進捗を取得
   * 
   * Turso SDK の execute() で SELECT クエリを実行し、result.rows で結果を取得
   * SQLite互換の結果セット処理でデータを TypeScript オブジェクトに変換
   * 
   * @param userId - ユーザーID
   * @returns ユーザーの進捗データ配列
   */
  async getUserProgress(userId: number): Promise<UserProgressData[]> {
    await this.ensureInitialized();
    // Turso SDK でSELECTクエリを実行
    const result = await this.client.execute({
      sql: 'SELECT * FROM user_progress WHERE user_id = ? ORDER BY answered_at DESC',
      args: [userId]
    });
    
    // result.rows から結果セットを取得してTypeScriptオブジェクトに変換
    return result.rows.map(row => ({
      id: Number(row.id),
      user_id: Number(row.user_id),
      question_id: Number(row.question_id),
      answered_at: String(row.answered_at),
      genre: row.genre ? String(row.genre) : undefined,
      subgenre: row.subgenre ? String(row.subgenre) : undefined,
      level: row.level ? Number(row.level) : undefined,
    }));
  }

  async clearUserProgress(userId: number): Promise<boolean> {
    await this.ensureInitialized();
    const result = await this.client.execute({
      sql: 'DELETE FROM user_progress WHERE user_id = ?',
      args: [userId]
    });
    
    return result.rowsAffected > 0;
  }

  // Session operations  
  async createSession(sessionId: string, userId: number): Promise<void> {
    await this.ensureInitialized();
    const now = new Date().toISOString();
    await this.client.execute({
      sql: `INSERT OR REPLACE INTO sessions (session_id, user_id, created_at, last_activity)
            VALUES (?, ?, ?, ?)`,
      args: [sessionId, userId, now, now]
    });
  }

  async getSession(sessionId: string): Promise<{ user_id: number } | null> {
    await this.ensureInitialized();
    const result = await this.client.execute({
      sql: 'SELECT user_id FROM sessions WHERE session_id = ?',
      args: [sessionId]
    });
    
    if (result.rows.length === 0) return null;
    
    // Update last activity
    await this.client.execute({
      sql: 'UPDATE sessions SET last_activity = ? WHERE session_id = ?',
      args: [new Date().toISOString(), sessionId]
    });
    
    return { user_id: Number(result.rows[0].user_id) };
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    await this.ensureInitialized();
    const result = await this.client.execute({
      sql: 'DELETE FROM sessions WHERE session_id = ?',
      args: [sessionId]
    });
    
    return result.rowsAffected > 0;
  }

  // Utility methods
  close(): void {
    this.client.close();
  }
}