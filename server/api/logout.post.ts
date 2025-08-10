// server/api/logout.post.ts
import { defineEventHandler, getCookie, deleteCookie } from 'h3';
import { sessionStore } from '~/server/utils/sessionStore';

export default defineEventHandler(async (event) => {
    const sessionId = getCookie(event, 'session');
    
    if (sessionId) {
        // セッションストアからセッションを削除
        sessionStore.destroySession(sessionId);
    }
    
    // クッキーを削除
    deleteCookie(event, 'session', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    
    return { success: true, message: 'ログアウトしました' };
});