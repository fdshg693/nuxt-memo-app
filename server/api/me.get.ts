// server/api/me.get.ts
import { defineEventHandler, getCookie } from 'h3';
import { sessionStore } from '~/server/utils/sessionStore';

export default defineEventHandler(async (event) => {
    const sessionId = getCookie(event, 'session');
    
    if (!sessionId) {
        event.res.statusCode = 401;
        return { error: 'セッションが見つかりません' };
    }
    
    const session = sessionStore.getSession(sessionId);
    
    if (!session) {
        event.res.statusCode = 401;
        return { error: 'セッションが無効です' };
    }
    
    return {
        user: {
            username: session.username,
            email: session.email,
            loginAt: session.createdAt.toISOString()
        }
    };
});