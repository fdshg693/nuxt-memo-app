// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip middleware on server side to avoid initialization issues
    if (process.server) return;
    
    const { isLoggedIn, checkAuth } = useAuth();

    // /profile や /janken など保護ルートにアクセスする場合
    if (to.path.startsWith('/profile') || to.path.startsWith('/janken')) {
        // セッション状態をチェック
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
            return navigateTo('/login');
        }
    }
});
