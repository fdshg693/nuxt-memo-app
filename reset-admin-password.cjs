// Script to reset admin password
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'users.db');
const db = new Database(dbPath);

const adminEmail = 'admin@memo-app.com';
const newPassword = 'admin123';

async function resetAdminPassword() {
    try {
        // Hash the new password
        const passwordHash = await bcrypt.hash(newPassword, 10);
        
        // Update the admin user's password
        const stmt = db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE email = ? AND is_admin = 1');
        const result = stmt.run(passwordHash, new Date().toISOString(), adminEmail);
        
        if (result.changes > 0) {
            console.log(`✅ Admin password updated successfully for ${adminEmail}`);
            console.log(`New password: ${newPassword}`);
        } else {
            console.log(`❌ No admin user found with email ${adminEmail}`);
        }
        
        // Verify the user exists
        const userStmt = db.prepare('SELECT email, username, is_admin FROM users WHERE email = ?');
        const user = userStmt.get(adminEmail);
        if (user) {
            console.log('User details:', user);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        db.close();
    }
}

resetAdminPassword();