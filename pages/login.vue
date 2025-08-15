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
                <div class="relative">
                    <input 
                        v-model="form.password" 
                        :type="showPassword ? 'text' : 'password'" 
                        required 
                        class="w-full border px-3 py-2 pr-10 rounded" 
                        placeholder="パスワードを入力してください" 
                    />
                    <button 
                        type="button"
                        @click="togglePasswordVisibility"
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        :aria-label="showPassword ? 'パスワードを隠す' : 'パスワードを表示する'"
                    >
                        <!-- Eye icon for show password -->
                        <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        <!-- Eye-off icon for hide password -->
                        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                        </svg>
                    </button>
                </div>
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
const showPassword = ref(false);

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
};

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
