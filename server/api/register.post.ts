// server/api/register.post.ts
import { defineEventHandler, readBody, setCookie } from 'h3';
import { sessionStore } from '~/server/utils/sessionStore';
import { database } from '~/server/utils/database-factory';
import bcrypt from 'bcrypt';

interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { email, password, username } = await readBody<RegisterRequest>(event);

    // Validate input
    if (!email || !password) {
      event.res.statusCode = 400;
      return { 
        success: false,
        message: 'メールアドレスとパスワードは必須です' 
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      event.res.statusCode = 400;
      return { 
        success: false,
        message: '有効なメールアドレスを入力してください' 
      };
    }

    // Validate password length
    if (password.length < 4) {
      event.res.statusCode = 400;
      return { 
        success: false,
        message: 'パスワードは4文字以上で入力してください' 
      };
    }

    // Check if user already exists
    const existingUser = await database.getUserByEmail(email);
    if (existingUser) {
      event.res.statusCode = 409;
      return { 
        success: false,
        message: 'このメールアドレスは既に登録されています' 
      };
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const displayName = username || email.split('@')[0];
    const newUser = await database.createUser(email, displayName, passwordHash);

    // Create session
    const sessionId = await sessionStore.createSession(email, displayName);

    // Set secure cookie
    setCookie(event, 'session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax'
    });

    return { 
      success: true,
      user: {
        username: displayName,
        email: email
      },
      message: 'ユーザー登録が完了しました'
    };

  } catch (error) {
    console.error('Registration error:', error);
    event.res.statusCode = 500;
    return { 
      success: false,
      message: '登録処理中にエラーが発生しました' 
    };
  }
});