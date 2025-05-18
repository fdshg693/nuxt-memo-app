// composables/useAuth.ts
export const useAuth = () => {
    const token = useCookie<string | null>('auth_token');

    const isLoggedIn = computed(() => !!token.value);

    const setToken = (t: string) => {
        token.value = t;
    };

    const logout = () => {
        token.value = null;
    };

    return { token, isLoggedIn, setToken, logout };
};
