<template>
    <div class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 min-h-screen py-8">
        <div class="max-w-4xl mx-auto px-4">
            <!-- Header -->
            <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-purple-100">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-3xl font-bold text-indigo-700">ユーザープロフィール</h1>
                    <div class="flex gap-4">
                        <NuxtLink to="/" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                            ホームへ戻る
                        </NuxtLink>
                        <button @click="logout" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                            ログアウト
                        </button>
                    </div>
                </div>

                <div v-if="userProfile" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- User Info -->
                    <div class="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">ユーザー情報</h3>
                        <div class="space-y-2">
                            <p><span class="font-medium">ユーザー名:</span> {{ userProfile.username }}</p>
                            <p><span class="font-medium">メール:</span> {{ userProfile.email }}</p>
                            <p><span class="font-medium">ログイン:</span> {{ formatDate(userProfile.loginAt) }}</p>
                        </div>
                    </div>

                    <!-- Progress Stats -->
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">進捗統計</h3>
                        <div class="space-y-2">
                            <p><span class="font-medium">正解数:</span> {{ totalCorrectAnswers }}問</p>
                            <p v-if="lastActivity"><span class="font-medium">最終活動:</span> {{ formatDate(lastActivity) }}</p>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">クイックアクション</h3>
                        <div class="space-y-2">
                            <NuxtLink to="/sql/1" class="block bg-blue-600 text-white text-center px-4 py-2 rounded hover:bg-blue-700">
                                SQL問題を解く
                            </NuxtLink>
                            <NuxtLink to="/quiz" class="block bg-purple-600 text-white text-center px-4 py-2 rounded hover:bg-purple-700">
                                クイズに挑戦
                            </NuxtLink>
                            <button @click="resetProgress" 
                                    :disabled="isResetting" 
                                    class="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50">
                                {{ isResetting ? 'リセット中...' : '進捗をリセット' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Progress Details -->
            <div v-if="progress" class="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
                <h2 class="text-2xl font-bold text-indigo-700 mb-6">学習進捗</h2>
                
                <!-- Genre Progress -->
                <div v-if="Object.keys(genreProgress).length > 0" class="mb-8">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">ジャンル別進捗</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div v-for="(stats, genre) in genreProgress" :key="genre" class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-medium text-gray-800">{{ genre }}</h4>
                            <p class="text-sm text-gray-600">正解数: {{ stats.correct }}問</p>
                        </div>
                    </div>
                </div>

                <!-- Recent Answers -->
                <div v-if="recentAnswers.length > 0">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">最近の正解履歴</h3>
                    <div class="space-y-3">
                        <div v-for="answer in recentAnswers" :key="`${answer.questionId}-${answer.answeredAt}`" 
                             class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <span class="font-medium">問題 {{ answer.questionId }}</span>
                                <span v-if="answer.genre" class="ml-2 text-sm text-gray-600">{{ answer.genre }}</span>
                                <span v-if="answer.subgenre" class="ml-1 text-sm text-gray-600">/ {{ answer.subgenre }}</span>
                                <span v-if="answer.level" class="ml-1 text-sm text-gray-600">Level {{ answer.level }}</span>
                            </div>
                            <span class="text-sm text-gray-500">{{ formatDate(answer.answeredAt) }}</span>
                        </div>
                    </div>
                </div>

                <div v-else class="text-center py-8 text-gray-500">
                    まだ問題を解いていません。<br>
                    <NuxtLink to="/sql/1" class="text-indigo-600 hover:text-indigo-800 underline">
                        SQL問題に挑戦してみましょう！
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import { useUserProgress } from '~/composables/useUserProgress';

const router = useRouter();
const { userProfile, logout: authLogout, isLoggedIn, checkAuth } = useAuth();
const { progress, totalCorrectAnswers, lastActivity, getProgressByGenre, clearProgress, loadProgressFromServer } = useUserProgress();

const isResetting = ref(false);

// Check authentication status and redirect if not logged in
onMounted(async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        await router.push('/login');
        return;
    }
    
    // Load user progress from server after authentication
    try {
        await loadProgressFromServer();
    } catch (error) {
        console.warn('Failed to load progress from server:', error);
    }
});

const genreProgress = computed(() => getProgressByGenre());

const recentAnswers = computed(() => {
    if (!progress.value) return [];
    return [...progress.value.correctAnswers]
        .sort((a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime())
        .slice(0, 10); // Show last 10 answers
});

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const resetProgress = async () => {
    if (!confirm('本当に学習進捗をリセットしますか？この操作は取り消せません。')) {
        return;
    }
    
    isResetting.value = true;
    try {
        const success = await clearProgress();
        if (success) {
            alert('学習進捗がリセットされました。');
        } else {
            alert('進捗のリセットに失敗しました。もう一度お試しください。');
        }
    } catch (error) {
        console.error('Reset error:', error);
        alert('進捗のリセット中にエラーが発生しました。');
    } finally {
        isResetting.value = false;
    }
};

const logout = async () => {
    await authLogout();
    await router.push('/login');
};
</script>

<style scoped>
/* Additional styles if needed */
</style>