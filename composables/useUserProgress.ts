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
    // Keep local state for immediate UI updates
    const userProgress = ref<UserProgress | null>(null);

    const initializeProgress = async (userIdentifier: string) => {
        // Clear any existing progress data first
        userProgress.value = null;
        
        // Try to load progress from server first (using authenticated session)
        try {
            await loadProgressFromServer();
        } catch (error) {
            console.warn('Failed to load progress from server, using local storage:', error);
            // Fallback to local storage for offline support
            loadProgressFromLocal(userIdentifier);
        }
    };

    const loadProgressFromServer = async (): Promise<void> => {
        const response = await fetch('/api/user/progress', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Loaded progress from server:', data);
            userProgress.value = data;
            // Also save to local storage as backup, but keyed by username from server
            if (data.username) {
                saveProgressToLocal(data);
            }
        } else {
            throw new Error(`Failed to load progress from server: ${response.status}`);
        }
    };

    const loadProgressFromLocal = (username: string) => {
        const localData = useCookie<UserProgress | null>('user_progress');
        if (!localData.value || localData.value.username !== username) {
            userProgress.value = {
                username,
                correctAnswers: [],
                stats: {
                    totalCorrect: 0,
                    lastActivity: new Date().toISOString()
                }
            };
        } else {
            userProgress.value = localData.value;
        }
    };

    const saveProgressToLocal = (data: UserProgress) => {
        const localData = useCookie<UserProgress | null>('user_progress');
        localData.value = data;
    };

    const recordCorrectAnswer = async (questionId: number, genre?: string, subgenre?: string, level?: number) => {
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

            // Update local state immediately for responsive UI
            userProgress.value.correctAnswers.push(newAnswer);
            userProgress.value.stats.totalCorrect++;
        }
        
        userProgress.value.stats.lastActivity = new Date().toISOString();

        // Save to server in background
        try {
            const response = await fetch('/api/user/progress', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ questionId, genre, subgenre, level })
            });

            if (!response.ok) {
                console.warn('Failed to save progress to server');
            }

            // Also save to local storage as backup
            saveProgressToLocal(userProgress.value);
        } catch (error) {
            console.warn('Error saving progress to server:', error);
            // Save to local storage as fallback
            saveProgressToLocal(userProgress.value);
        }
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

    const clearProgress = async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/user/reset', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Clear local state
                if (userProgress.value) {
                    userProgress.value.correctAnswers = [];
                    userProgress.value.stats.totalCorrect = 0;
                    userProgress.value.stats.lastActivity = new Date().toISOString();
                }
                
                // Clear local storage
                const localData = useCookie<UserProgress | null>('user_progress');
                localData.value = null;
                
                return true;
            } else {
                console.error('Failed to reset progress on server');
                return false;
            }
        } catch (error) {
            console.error('Error resetting progress:', error);
            return false;
        }
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
        clearProgress,
        loadProgressFromServer
    };
};