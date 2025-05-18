// server/api/login.post.ts
import { defineEventHandler, readBody, setCookie } from 'h3';

export default defineEventHandler(async (event) => {
    const { email, password } = await readBody<{ email: string; password: string }>(event);

    // ダミー認証ロジック
    if (email === 'user@example.com' && password === 'password123') {
        const fakeToken = 'abcdefg1234567'; // 実際は JWT を生成
        // クッキーにトークンをセット（httpOnly, secure, sameSite などを設定可能）
        setCookie(event, 'auth_token', fakeToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7日
            path: '/'
        });
        return { token: fakeToken };
    }

    event.res.statusCode = 401;
    return { message: 'メールアドレスまたはパスワードが違います' };
});
