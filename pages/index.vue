<template>
    <!-- User Status Bar -->
    <div class="fixed top-4 right-4 z-10">
        <div v-if="isLoggedIn" class="bg-white rounded-lg shadow-lg p-3 border border-purple-200">
            <div class="flex items-center gap-3">
                <span class="text-sm text-gray-600">こんにちは、</span>
                <span class="font-medium text-purple-700">{{ username }}さん</span>
                <NuxtLink to="/profile" class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs hover:bg-purple-200">
                    プロフィール
                </NuxtLink>
                <button @click="logout" class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200">
                    ログアウト
                </button>
            </div>
        </div>
        <div v-else class="bg-white rounded-lg shadow-lg p-3 border border-purple-200">
            <NuxtLink to="/login" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                ログイン
            </NuxtLink>
        </div>
    </div>

    <a href="https://github.com/fdshg693/nuxt-memo-app" target="_blank"
        class="fixed bottom-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-600 transition">
        GitHubのソースコードです
    </a>
    <NuxtLink to="janken" class="btn-gradient mb-8">ジャンケン</NuxtLink>
    <NuxtLink to="quiz" class="btn-gradient">クイズ</NuxtLink>
    <NuxtLink to="sql" class="btn-gradient mb-8">SQL</NuxtLink>
    <NuxtLink to="sql/allTables" class="btn-gradient mb-8">SQLで使うテーブルの一覧</NuxtLink>
    <NuxtLink to="sql/explanation" class="btn-gradient mb-8">SQL文の説明</NuxtLink>
    <div class="border-2 border-purple-400 rounded-lg p-4 mt-8 bg-white shadow-md">
        <h2 class="text-lg font-bold mb-4 text-purple-700">SQL問題一覧</h2>
        <div v-for="(genreGroup, genre) in groupedQuestions" :key="genre" class="mb-6">
            <h3 class="text-base font-bold text-indigo-700 mb-2">{{ genre }}</h3>
            <div v-for="(subgenreGroup, subgenre) in genreGroup" :key="subgenre" class="mb-2 ml-4">
                <div v-if="subgenre !== ''" class="text-sm font-semibold text-purple-600 mb-1">{{ subgenre }}</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <NuxtLink v-for="question in subgenreGroup" :key="question.id" :to="`sql/${question.id}`"
                        class="btn-sql-question relative">
                        SQL問題{{ question.id }}
                        <span v-if="isLoggedIn && isQuestionAnsweredCorrectly(question.id)" 
                              class="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            ✓
                        </span>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router';
import { useSqlQuiz } from '~/composables/useSqlQuiz';
import { useAuth } from '~/composables/useAuth';
import { useUserProgress } from '~/composables/useUserProgress';

const router = useRouter();
const { questions, loadQuestions } = useSqlQuiz();
const { isLoggedIn, username, logout: authLogout } = useAuth();
const { isQuestionAnsweredCorrectly, clearProgress } = useUserProgress();

const groupedQuestions = computed(() => {
    // genre→subgenre→level順でグループ化
    const map: Record<string, Record<string, any[]>> = {};
    for (const q of questions.value) {
        const genre = q.genre || 'その他';
        const subgenre = q.subgenre || '';
        if (!map[genre]) map[genre] = {};
        if (!map[genre][subgenre]) map[genre][subgenre] = [];
        map[genre][subgenre].push(q);
    }
    // 各グループ内でlevel順にソート
    for (const genre in map) {
        for (const subgenre in map[genre]) {
            map[genre][subgenre].sort((a, b) => (a.level || 0) - (b.level || 0));
        }
    }
    return map;
});

const logout = async () => {
    authLogout();
    clearProgress();
    await router.push('/login');
};

onMounted(() => {
    loadQuestions();
})
</script>