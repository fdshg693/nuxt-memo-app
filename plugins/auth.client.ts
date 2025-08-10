// plugins/auth.client.ts
export default defineNuxtPlugin(async () => {
    const { checkAuth } = useAuth();
    
    // クライアント起動時にセッション状態をチェック
    await checkAuth();
});