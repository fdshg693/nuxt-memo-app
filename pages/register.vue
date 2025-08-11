<!-- pages/register.vue -->
<template>
    <div class="max-w-sm mx-auto mt-20">
        <h1 class="text-2xl font-bold mb-6">新規登録</h1>
        <form @submit.prevent="onSubmit">
            <div class="mb-4">
                <label class="block mb-1">メールアドレス</label>
                <input 
                    v-model="form.email" 
                    type="email" 
                    required 
                    class="w-full border px-3 py-2 rounded" 
                    placeholder="メールアドレスを入力してください" 
                />
            </div>
            <div class="mb-4">
                <label class="block mb-1">ユーザー名（オプション）</label>
                <input 
                    v-model="form.username" 
                    type="text" 
                    class="w-full border px-3 py-2 rounded" 
                    placeholder="ユーザー名を入力してください（未入力の場合はメールアドレスから自動生成）" 
                />
            </div>
            <div class="mb-4">
                <label class="block mb-1">パスワード</label>
                <input 
                    v-model="form.password" 
                    type="password" 
                    required 
                    minlength="4"
                    class="w-full border px-3 py-2 rounded" 
                    placeholder="パスワードを入力してください（4文字以上）" 
                />
            </div>
            <div class="mb-4">
                <label class="block mb-1">パスワード（確認）</label>
                <input 
                    v-model="form.confirmPassword" 
                    type="password" 
                    required 
                    class="w-full border px-3 py-2 rounded" 
                    placeholder="もう一度パスワードを入力してください" 
                />
            </div>
            <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>
            <div v-if="success" class="text-green-600 mb-4">{{ success }}</div>
            <button 
                type="submit" 
                :disabled="isLoading || !isFormValid" 
                class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
                {{ isLoading ? '登録中...' : '新規登録' }}
            </button>
        </form>
        
        <div class="mt-6 text-center">
            <p class="text-gray-600">
                既にアカウントをお持ちですか？
                <NuxtLink to="/login" class="text-blue-600 hover:underline">ログイン</NuxtLink>
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
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import { useUserProgress } from '~/composables/useUserProgress';

const router = useRouter();
const { register } = useAuth();
const { initializeProgress } = useUserProgress();

const form = reactive({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
});

const error = ref<string | null>(null);
const success = ref<string | null>(null);
const isLoading = ref(false);

const isFormValid = computed(() => {
    return form.email && 
           form.password && 
           form.confirmPassword && 
           form.password === form.confirmPassword &&
           form.password.length >= 4;
});

const onSubmit = async () => {
    error.value = null;
    success.value = null;
    
    if (!isFormValid.value) {
        error.value = 'フォームに正しく入力してください';
        return;
    }
    
    if (form.password !== form.confirmPassword) {
        error.value = 'パスワードが一致しません';
        return;
    }
    
    isLoading.value = true;
    
    try {
        console.log('Attempting registration with:', form.email);
        const result = await register(form.email, form.password, form.username || undefined);
        console.log('Registration result:', result);
        
        if (result.success) {
            success.value = result.message || '登録が完了しました';
            console.log('Registration successful, initializing progress...');
            
            // ユーザー進捗を初期化
            await initializeProgress(form.email);
            
            console.log('Redirecting to home page...');
            // 2秒後にホームページに遷移
            setTimeout(async () => {
                await router.push('/');
            }, 2000);
        } else {
            console.error('Registration failed:', result.message);
            error.value = result.message || '新規登録に失敗しました';
        }
    } catch (err: any) {
        console.error('Registration error:', err);
        error.value = '新規登録に失敗しました';
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
/* お好みで TailwindCSS 以外のスタイルを追加 */
</style>