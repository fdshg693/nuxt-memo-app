<!-- pages/login.vue -->
<template>
    <div class="max-w-sm mx-auto mt-20">
        <h1 class="text-2xl font-bold mb-6">ログイン</h1>
        <form @submit.prevent="onSubmit">
            <div class="mb-4">
                <label class="block mb-1">メールアドレス</label>
                <input v-model="form.email" type="email" required class="w-full border px-3 py-2 rounded" placeholder="メールアドレスを入力してください" />
            </div>
            <div class="mb-4">
                <label class="block mb-1">パスワード</label>
                <input v-model="form.password" type="password" required class="w-full border px-3 py-2 rounded" placeholder="パスワードを入力してください" />
            </div>
            <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>
            <button type="submit" :disabled="isLoading" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                {{ isLoading ? 'ログイン中...' : 'ログイン' }}
            </button>
        </form>
        
        <div class="mt-6 text-center">
            <p class="text-gray-600">
                アカウントをお持ちでない方は
                <NuxtLink to="/register" class="text-green-600 hover:underline">新規登録</NuxtLink>
            </p>
        </div>
        
        <div class="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
            <p><strong>テスト用アカウント:</strong></p>
            <p>メール: 1@gmail.com</p>
            <p>パスワード: 1234</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import { useUserProgress } from '~/composables/useUserProgress';

const router = useRouter();
const { login, checkAuth } = useAuth();
const { initializeProgress } = useUserProgress();

const form = reactive({
    email: '',
    password: ''
});
const error = ref<string | null>(null);
const isLoading = ref(false);

const onSubmit = async () => {
    error.value = null;
    isLoading.value = true;
    
    try {
        console.log('Attempting login with:', form.email);
        const result = await login(form.email, form.password);
        console.log('Login result:', result);
        
        if (result.success) {
            console.log('Login successful, initializing progress...');
            // ユーザー進捗を初期化（メールアドレスをユーザーIDとして使用）
            await initializeProgress(form.email);
            
            console.log('Redirecting to home page...');
            // ホームページに遷移
            await router.push('/');
        } else {
            console.error('Login failed:', result.message);
            error.value = result.message || 'ログインに失敗しました';
        }
    } catch (err: any) {
        console.error('Login error:', err);
        error.value = 'ログインに失敗しました';
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
/* お好みで TailwindCSS 以外のスタイルを追加 */
</style>
