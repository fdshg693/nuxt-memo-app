// server/api/login.post.ts
import { defineEventHandler, readBody, setCookie } from 'h3';
import { sessionStore } from '~/server/utils/sessionStore';
import { database } from '~/server/utils/database-factory';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
    const { email, password } = await readBody<{ email: string; password: string }>(event);

    // Legacy test user support for backward compatibility
    if (email === '1@gmail.com' && password === '1234') {
        const username = 'テストユーザー';
        
        // Create or get test user
        let user = database.getUserByEmail(email);
        if (!user) {
            user = database.createUser(email, username);
        }
        
        // セッションIDを生成（データベースに永続化）
        const sessionId = sessionStore.createSession(email, username);
        
        // HttpOnly、Secure、SameSite cookieをセット（JavaScriptからアクセス不可）
        setCookie(event, 'session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7日
            path: '/',
            sameSite: 'lax'
        });
        
        return { 
            success: true,
            user: {
                username: username,
                email: email
            }
        };
    }

    // Regular user authentication with password hashing
    const user = database.getUserByEmail(email);
    if (!user) {
        event.res.statusCode = 401;
        return { 
            success: false,
            message: 'メールアドレスまたはパスワードが正しくありません' 
        };
    }

    // Check password for registered users
    if (user.password_hash) {
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            event.res.statusCode = 401;
            return { 
                success: false,
                message: 'メールアドレスまたはパスワードが正しくありません' 
            };
        }
    } else {
        // User exists but has no password (legacy user without password)
        event.res.statusCode = 401;
        return { 
            success: false,
            message: 'パスワードが設定されていません。新規登録を行ってください' 
        };
    }

    // Authentication successful
    const sessionId = sessionStore.createSession(user.email, user.username);
    
    setCookie(event, 'session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7日
        path: '/',
        sameSite: 'lax'
    });
    
    return { 
        success: true,
        user: {
            username: user.username,
            email: user.email
        }
    };
});
