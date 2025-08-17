// server/api/user/progress.get.ts
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
        // Get user details to include username in response
        const user = await database.getUserById(session.user_id);
        if (!user) {
            event.res.statusCode = 401;
            return { error: 'ユーザーが見つかりません' };
        }
        
        const progress = await database.getUserProgress(session.user_id);
        
        // Transform to match frontend format
        const correctAnswers = progress.map(p => ({
            questionId: p.question_id,
            answeredAt: p.answered_at,
            genre: p.genre || undefined,
            subgenre: p.subgenre || undefined,
            level: p.level || undefined
        }));
        
        return {
            username: user.username,
            correctAnswers,
            stats: {
                totalCorrect: correctAnswers.length,
                lastActivity: progress.length > 0 ? progress[0].answered_at : new Date().toISOString()
            }
        };
    } catch (error) {
        console.error('Error loading user progress:', error);
        event.res.statusCode = 500;
        return { error: '進捗データの読み込みに失敗しました' };
    }
});