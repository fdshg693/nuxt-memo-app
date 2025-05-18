// middleware/auth.global.ts
import type { NavigationGuard } from 'vue-router';
import { useAuth } from '~/composables/useAuth';

export default defineNuxtRouteMiddleware((to, from) => {
    const { isLoggedIn } = useAuth();

    // ログインしていない状態で /janken など保護ルートにアクセスしたら /login へリダイレクト
    if (!isLoggedIn.value && to.path.startsWith('/janken')) {
        return navigateTo('/login');
    }
});
