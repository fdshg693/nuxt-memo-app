<!-- pages/login.vue -->
<template>
    <div class="max-w-sm mx-auto mt-20">
        <h1 class="text-2xl font-bold mb-6">ログイン</h1>
        <form @submit.prevent="onSubmit">
            <div class="mb-4">
                <label class="block mb-1">ユーザー名</label>
                <input v-model="form.username" type="text" required class="w-full border px-3 py-2 rounded" placeholder="ユーザー名を入力してください" />
            </div>
            <div class="mb-4">
                <label class="block mb-1">メールアドレス</label>
                <input v-model="form.email" type="email" required class="w-full border px-3 py-2 rounded" />
            </div>
            <div class="mb-4">
                <label class="block mb-1">パスワード</label>
                <input v-model="form.password" type="password" required class="w-full border px-3 py-2 rounded" />
            </div>
            <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>
            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                ログイン
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import { useUserProgress } from '~/composables/useUserProgress';

const router = useRouter();
const { login } = useAuth();
const { initializeProgress } = useUserProgress();

const form = reactive({
    username: '',
    email: '',
    password: ''
});
const error = ref<string | null>(null);

const onSubmit = async () => {
    error.value = null;
    try {
        // API 呼び出し
        const res = await $fetch<{ token: string; user: { username: string; email: string } }>('/api/login', {
            method: 'POST',
            body: form
        });
        // ユーザープロファイルとトークンを保存
        login(res.token, {
            username: res.user.username,
            email: res.user.email,
            loginAt: new Date().toISOString()
        });
        // ユーザー進捗を初期化
        initializeProgress(res.user.username);
        // ページ遷移を確実に待つ
        await router.push('/');
    } catch (err: any) {
        error.value = err?.data?.message || 'ログインに失敗しました';
    }
};
</script>

<style scoped>
/* お好みで TailwindCSS 以外のスタイルを追加 */
</style>
