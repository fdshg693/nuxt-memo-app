// server/api/me.get.ts
import { defineEventHandler, getCookie } from 'h3';
import { getDbSession } from '~/server/utils/sessionStore';
import { database } from '~/server/utils/database-factory';

export default defineEventHandler(async (event) => {
    const sessionId = getCookie(event, 'session');
    
    if (!sessionId) {
        event.res.statusCode = 401;
        return { error: 'セッションが見つかりません' };
    }
    
    const session = await getDbSession(sessionId);
    
    if (!session) {
        event.res.statusCode = 401;
        return { error: 'セッションが無効です' };
    }
    
    // Get user details from database to include admin status
    const user = await database.getUserById(session.user_id);
    
    if (!user) {
        event.res.statusCode = 401;
        return { error: 'ユーザーが見つかりません' };
    }
    
    return {
        user: {
            username: user.username,
            email: user.email,
            is_admin: user.is_admin,
            loginAt: user.updated_at
        }
    };
});