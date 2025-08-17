// server/api/user/reset.post.ts
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
    
    try {
        // Clear all user progress data
        const cleared = await database.clearUserProgress(session.user_id);
        
        if (cleared) {
            return { 
                success: true, 
                message: 'ユーザー進捗データがリセットされました' 
            };
        } else {
            return { 
                success: true, 
                message: 'リセットするデータがありませんでした' 
            };
        }
    } catch (error) {
        console.error('Error resetting user progress:', error);
        event.res.statusCode = 500;
        return { error: 'データのリセットに失敗しました' };
    }
});