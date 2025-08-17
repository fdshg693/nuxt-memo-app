// test/integration/progress-recording.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { $fetch } from 'ofetch';

describe('Progress Recording Integration', () => {
    let sessionCookie: string;
    const testProgressData = {
        questionId: 99,
        genre: 'TEST',
        subgenre: 'Integration',
        level: 1
    };

    beforeEach(async () => {
        // Login with test user to get session
        const loginResponse = await $fetch('/api/login', {
            method: 'POST',
            body: {
                email: '1@gmail.com',
                password: '1234'
            }
        });

        expect(loginResponse.success).toBe(true);
        
        // Extract session cookie from Set-Cookie header
        // In a real test environment, this would be handled by the test framework
        // For now, we'll use a known session from the database
        sessionCookie = '3623948df5ca2b4b2a9fa5a4e3ea42119ff37375c94c6c0426971c72dd6bc5a3';
    });

    afterEach(async () => {
        // Clean up test progress data if needed
        // In a real test, we'd delete the test progress entry
    });

    it('should save progress successfully', async () => {
        const progressResponse = await $fetch('/api/user/progress', {
            method: 'POST',
            body: testProgressData,
            headers: {
                'Cookie': `session=${sessionCookie}`
            }
        });

        expect(progressResponse.success).toBe(true);
        expect(progressResponse.message).toBe('進捗が保存されました');
    });

    it('should retrieve progress successfully', async () => {
        // First save some progress
        await $fetch('/api/user/progress', {
            method: 'POST',
            body: testProgressData,
            headers: {
                'Cookie': `session=${sessionCookie}`
            }
        });

        // Then retrieve it
        const progressResponse = await $fetch('/api/user/progress', {
            method: 'GET',
            headers: {
                'Cookie': `session=${sessionCookie}`
            }
        });

        expect(progressResponse.username).toBe('テストユーザー');
        expect(progressResponse.correctAnswers).toBeDefined();
        expect(Array.isArray(progressResponse.correctAnswers)).toBe(true);
        expect(progressResponse.stats).toBeDefined();
        expect(progressResponse.stats.totalCorrect).toBeGreaterThan(0);
    });

    it('should return 401 for invalid session', async () => {
        try {
            await $fetch('/api/user/progress', {
                method: 'POST',
                body: testProgressData,
                headers: {
                    'Cookie': 'session=invalid_session_id'
                }
            });
            expect.fail('Should have thrown an error for invalid session');
        } catch (error: any) {
            expect(error.status || error.statusCode).toBe(401);
        }
    });

    it('should validate required fields', async () => {
        try {
            await $fetch('/api/user/progress', {
                method: 'POST',
                body: {
                    genre: 'TEST',
                    subgenre: 'Integration'
                    // Missing questionId
                },
                headers: {
                    'Cookie': `session=${sessionCookie}`
                }
            });
            expect.fail('Should have thrown an error for missing questionId');
        } catch (error: any) {
            expect(error.status || error.statusCode).toBe(400);
        }
    });
});