// server/api/login.post.ts
import { defineEventHandler, readBody, setCookie } from 'h3';
import { sessionStore } from '~/server/utils/sessionStore';

export default defineEventHandler(async (event) => {
    const { email, password } = await readBody<{ email: string; password: string }>(event);

    // 本番用の認証ロジック - メールアドレス「1@gmail.com」、パスワード「1234」のみ許可
    if (email === '1@gmail.com' && password === '1234') {
        const username = 'テストユーザー'; // 固定のユーザー名
        
        // セッションIDを生成（データベースに永続化）
        const sessionId = sessionStore.createSession(email, username);
        
        // HttpOnly、Secure、SameSite cookieをセット（JavaScriptからアクセス不可）
        setCookie(event, 'session', sessionId, {
            httpOnly: true, // JavaScript からアクセス不可（セキュリティ向上）
            secure: false, // 開発環境では false に設定
            maxAge: 60 * 60 * 24 * 7, // 7日
            path: '/',
            sameSite: 'lax',
            domain: undefined // 開発環境では明示的にドメインを設定しない
        });
        
        return { 
            success: true,
            user: {
                username: username,
                email: email
            }
        };
    }

    // 認証失敗
    event.res.statusCode = 401;
    return { 
        success: false,
        message: 'メールアドレスまたはパスワードが正しくありません' 
    };
});
