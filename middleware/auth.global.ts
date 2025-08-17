// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip middleware on server side to avoid initialization issues
    if (process.server) return;
    
    const { isLoggedIn, checkAuth } = useAuth();

    // Always check authentication state when navigating
    // This ensures session consistency across all page transitions
    await checkAuth();

    // /profile や /janken など保護ルートにアクセスする場合
    if (to.path.startsWith('/profile') || to.path.startsWith('/janken')) {
        // セッション状態をチェック
        if (!isLoggedIn.value) {
            return navigateTo('/login');
        }
    }
});
