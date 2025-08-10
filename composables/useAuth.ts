// composables/useAuth.ts
export interface UserProfile {
    username: string;
    email: string;
    loginAt: string;
}

// Global state that persists across component instances
const globalAuthState = {
    isLoggedIn: ref(false),
    userProfile: ref<UserProfile | null>(null)
};

export const useAuth = () => {
    const isLoggedIn = globalAuthState.isLoggedIn;
    const userProfile = globalAuthState.userProfile;
    const username = computed(() => userProfile.value?.username || null);

    // セッション状態をサーバーから取得
    const checkAuth = async () => {
        try {
            console.log('Checking authentication...');
            // Native fetch を使用してクッキーを確実に送信
            const response = await fetch('/api/me', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Authentication successful:', data);
                userProfile.value = data.user;
                isLoggedIn.value = true;
                return true;
            } else {
                console.log('Authentication failed:', response.status);
                userProfile.value = null;
                isLoggedIn.value = false;
                return false;
            }
        } catch (error) {
            console.error('Authentication error:', error);
            userProfile.value = null;
            isLoggedIn.value = false;
            return false;
        }
    };

    // ログイン処理
    const login = async (email: string, password: string) => {
        try {
            // Native fetch を使用してクッキーを確実に送信
            const response = await fetch('/api/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // ログイン成功後、ユーザー情報を取得
                await checkAuth();
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error: any) {
            return { 
                success: false, 
                message: 'ログインに失敗しました' 
            };
        }
    };

    // ログアウト処理
    const logout = async () => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.warn('ログアウト API エラー:', error);
        } finally {
            userProfile.value = null;
            isLoggedIn.value = false;
        }
    };

    return { 
        isLoggedIn,
        userProfile,
        username,
        checkAuth,
        login,
        logout 
    };
};
