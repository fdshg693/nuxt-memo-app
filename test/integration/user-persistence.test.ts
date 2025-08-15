// test/integration/user-persistence.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userDatabase } from '~/server/utils/database';
import { sessionStore } from '~/server/utils/sessionStore';

describe('User Data Persistence', () => {
    const testEmail = 'test@example.com';
    const testUsername = 'Test User';
    let sessionId: string;
    let userId: number;

    beforeEach(async () => {
        // Create a test session and user
        sessionId = await sessionStore.createSession(testEmail, testUsername);
        const session = await sessionStore.getSession(sessionId);
        userId = session!.userId;
    });

    afterEach(async () => {
        // Clean up test data
        if (sessionId) {
            await sessionStore.destroySession(sessionId);
        }
        if (userId) {
            await userDatabase.clearUserProgress(userId);
        }
    });

    it('should create user and session in database', async () => {
        const session = await sessionStore.getSession(sessionId);
        expect(session).toBeTruthy();
        expect(session!.email).toBe(testEmail);
        expect(session!.username).toBe(testUsername);
        
        const user = await userDatabase.getUserById(userId);
        expect(user).toBeTruthy();
        expect(user!.email).toBe(testEmail);
        expect(user!.username).toBe(testUsername);
    });

    it('should save and retrieve user progress', async () => {
        const questionId = 1;
        const genre = 'SELECT';
        const subgenre = 'Basic';
        const level = 1;
        
        // Save progress
        await userDatabase.saveProgress(userId, questionId, genre, subgenre, level);
        
        // Retrieve progress
        const progress = await userDatabase.getUserProgress(userId);
        expect(progress).toHaveLength(1);
        expect(progress[0].question_id).toBe(questionId);
        expect(progress[0].genre).toBe(genre);
        expect(progress[0].subgenre).toBe(subgenre);
        expect(progress[0].level).toBe(level);
    });

    it('should clear user progress', async () => {
        // Add some progress first
        await userDatabase.saveProgress(userId, 1, 'SELECT', 'Basic', 1);
        await userDatabase.saveProgress(userId, 2, 'INSERT', 'Basic', 1);
        
        let progress = await userDatabase.getUserProgress(userId);
        expect(progress).toHaveLength(2);
        
        // Clear progress
        const cleared = await userDatabase.clearUserProgress(userId);
        expect(cleared).toBe(true);
        
        progress = await userDatabase.getUserProgress(userId);
        expect(progress).toHaveLength(0);
    });

    it('should handle duplicate progress entries correctly', async () => {
        const questionId = 1;
        const genre = 'SELECT';
        
        // Save progress twice for the same question
        await userDatabase.saveProgress(userId, questionId, genre, 'Basic', 1);
        await userDatabase.saveProgress(userId, questionId, genre, 'Advanced', 2);
        
        // Should only have one entry (replaced)
        const progress = await userDatabase.getUserProgress(userId);
        expect(progress).toHaveLength(1);
        expect(progress[0].subgenre).toBe('Advanced');
        expect(progress[0].level).toBe(2);
    });

    it('should persist sessions across server restarts', async () => {
        // Get the session
        const session1 = await sessionStore.getSession(sessionId);
        expect(session1).toBeTruthy();
        
        // Simulate getting the session again (as would happen after server restart)
        const session2 = await sessionStore.getSession(sessionId);
        expect(session2).toBeTruthy();
        expect(session2!.userId).toBe(session1!.userId);
        expect(session2!.email).toBe(session1!.email);
    });
});