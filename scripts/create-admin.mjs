// scripts/create-admin.mjs
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createAdmin() {
  // Connect to database
  const dbPath = path.join(__dirname, '..', 'data', 'users.db');
  const db = new Database(dbPath);
  
  try {
    // Initialize tables with schema migrations
    db.exec(`
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

    // Add missing columns if they don't exist
    try {
      db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT`);
    } catch (error) {
      // Column already exists
    }

    try {
      db.exec(`ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0`);
    } catch (error) {
      // Column already exists
    }

    // Check if admin already exists
    const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@memo-app.com');
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO users (email, username, password_hash, is_admin, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run('admin@memo-app.com', 'Admin', passwordHash, 1, now, now);
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@memo-app.com');
    console.log('Password: admin123');
    console.log('User ID:', result.lastInsertRowid);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    db.close();
  }
}

createAdmin();