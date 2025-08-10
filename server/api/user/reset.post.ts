// server/api/user/reset.post.ts
import { defineEventHandler, getCookie } from 'h3';
import { sessionStore } from '~/server/utils/sessionStore';
import { userDatabase } from '~/server/utils/database';

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
    
    try {
        // Clear all user progress data
        const cleared = userDatabase.clearUserProgress(session.userId);
        
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