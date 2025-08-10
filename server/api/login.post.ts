// server/api/login.post.ts
import { defineEventHandler, readBody, setCookie } from 'h3';

export default defineEventHandler(async (event) => {
    const { username, email, password } = await readBody<{ username: string; email: string; password: string }>(event);

    // ダミー認証ロジック - 実際の環境では適切な認証を実装
    if (email === 'user@example.com' && password === 'password123') {
        const fakeToken = 'abcdefg1234567'; // 実際は JWT を生成
        
        // クッキーにトークンをセット（httpOnly: false で client-side からアクセス可能）
        setCookie(event, 'auth_token', fakeToken, {
            httpOnly: false, // Client-side access を有効にする
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7日
            path: '/',
            sameSite: 'lax'
        });
        
        return { 
            token: fakeToken,
            user: {
                username: username || 'デフォルトユーザー',
                email: email
            }
        };
    }

    // 簡単なダミー認証 - usernameが入力されていれば認証成功とする（開発用）
    if (username && username.trim().length > 0) {
        const fakeToken = `token_${Date.now()}`;
        
        setCookie(event, 'auth_token', fakeToken, {
            httpOnly: false, // Client-side access を有効にする
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7日
            path: '/',
            sameSite: 'lax'
        });
        
        return { 
            token: fakeToken,
            user: {
                username: username,
                email: email
            }
        };
    }

    event.res.statusCode = 401;
    return { message: 'ユーザー名、メールアドレスまたはパスワードが正しくありません' };
});
