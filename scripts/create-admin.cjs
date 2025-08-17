#!/usr/bin/env node

// Script to create admin user or set existing user as admin
// Usage: node scripts/create-admin.js <email> [password] [username]

const path = require('path');
const bcrypt = require('bcrypt');

// Simple Database Connection for Admin Creation
async function createAdminUser() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log('Usage: node scripts/create-admin.js <email> [password] [username]');
        console.log('Example: node scripts/create-admin.js admin@example.com admin123 "Admin User"');
        process.exit(1);
    }

    const email = args[0];
    const password = args[1] || 'admin123';
    const username = args[2] || 'Admin User';

    try {
        // We'll use SQLite for simplicity in development
        const Database = require('better-sqlite3');
        const dbPath = path.join(process.cwd(), 'data', 'users.db');
        const db = new Database(dbPath);

        // Check if user already exists
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        
        if (existingUser) {
            // Update existing user to be admin
            db.prepare('UPDATE users SET is_admin = 1 WHERE email = ?').run(email);
            console.log(`✅ User ${email} has been granted admin privileges`);
        } else {
            // Create new admin user
            const passwordHash = await bcrypt.hash(password, 10);
            const now = new Date().toISOString();
            
            const stmt = db.prepare(`
                INSERT INTO users (email, username, password_hash, is_admin, created_at, updated_at)
                VALUES (?, ?, ?, 1, ?, ?)
            `);
            
            const result = stmt.run(email, username, passwordHash, now, now);
            console.log(`✅ Admin user created successfully!`);
            console.log(`   Email: ${email}`);
            console.log(`   Username: ${username}`);
            console.log(`   Password: ${password}`);
            console.log(`   User ID: ${result.lastInsertRowid}`);
        }

        db.close();
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    }
}

createAdminUser();