// composables/useUserProgress.ts
import { ref, computed } from 'vue';

export interface QuestionProgress {
    questionId: number;
    answeredAt: string;
    genre?: string;
    subgenre?: string;
    level?: number;
}

export interface UserProgress {
    username: string;
    correctAnswers: QuestionProgress[];
    stats: {
        totalCorrect: number;
        lastActivity: string;
    };
}

export const useUserProgress = () => {
    // Use localStorage to persist user progress data
    const userProgress = useCookie<UserProgress | null>('user_progress');

    const initializeProgress = (username: string) => {
        if (!userProgress.value || userProgress.value.username !== username) {
            userProgress.value = {
                username,
                correctAnswers: [],
                stats: {
                    totalCorrect: 0,
                    lastActivity: new Date().toISOString()
                }
            };
        }
    };

    const recordCorrectAnswer = (questionId: number, genre?: string, subgenre?: string, level?: number) => {
        if (!userProgress.value) return;

        // Check if this question was already answered correctly
        const existingAnswer = userProgress.value.correctAnswers.find(
            answer => answer.questionId === questionId
        );

        if (!existingAnswer) {
            const newAnswer: QuestionProgress = {
                questionId,
                answeredAt: new Date().toISOString(),
                genre,
                subgenre,
                level
            };

            userProgress.value.correctAnswers.push(newAnswer);
            userProgress.value.stats.totalCorrect++;
        }
        
        userProgress.value.stats.lastActivity = new Date().toISOString();
    };

    const isQuestionAnsweredCorrectly = (questionId: number): boolean => {
        if (!userProgress.value) return false;
        return userProgress.value.correctAnswers.some(answer => answer.questionId === questionId);
    };

    const getProgressByGenre = () => {
        if (!userProgress.value) return {};
        
        const genreStats: Record<string, { total: number; correct: number }> = {};
        
        userProgress.value.correctAnswers.forEach(answer => {
            const genre = answer.genre || 'その他';
            if (!genreStats[genre]) {
                genreStats[genre] = { total: 0, correct: 0 };
            }
            genreStats[genre].correct++;
        });

        return genreStats;
    };

    const clearProgress = () => {
        userProgress.value = null;
    };

    const progress = computed(() => userProgress.value);
    const totalCorrectAnswers = computed(() => userProgress.value?.stats.totalCorrect || 0);
    const lastActivity = computed(() => userProgress.value?.stats.lastActivity || null);

    return {
        progress,
        totalCorrectAnswers,
        lastActivity,
        initializeProgress,
        recordCorrectAnswer,
        isQuestionAnsweredCorrectly,
        getProgressByGenre,
        clearProgress
    };
};