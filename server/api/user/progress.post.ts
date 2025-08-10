// server/api/user/progress.post.ts
import { defineEventHandler, getCookie, readBody } from 'h3';
import { sessionStore } from '~/server/utils/sessionStore';
import { database } from '~/server/utils/database-factory';

interface SaveProgressRequest {
    questionId: number;
    genre?: string;
    subgenre?: string;
    level?: number;
}

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
        const { questionId, genre, subgenre, level } = await readBody<SaveProgressRequest>(event);
        
        if (!questionId || typeof questionId !== 'number') {
            event.res.statusCode = 400;
            return { error: '有効な問題IDが必要です' };
        }
        
        // Save progress to database
        database.saveProgress(session.userId, questionId, genre, subgenre, level);
        
        return { success: true, message: '進捗が保存されました' };
    } catch (error) {
        console.error('Error saving user progress:', error);
        event.res.statusCode = 500;
        return { error: '進捗データの保存に失敗しました' };
    }
});