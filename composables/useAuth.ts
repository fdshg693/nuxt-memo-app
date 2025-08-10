// composables/useAuth.ts
export interface UserProfile {
    username: string;
    email: string;
    loginAt: string;
}

export const useAuth = () => {
    const token = useCookie<string | null>('auth_token');
    const userProfile = useCookie<UserProfile | null>('user_profile');

    const isLoggedIn = computed(() => !!token.value);
    const username = computed(() => userProfile.value?.username || null);

    const setToken = (t: string) => {
        token.value = t;
    };

    const setUserProfile = (profile: UserProfile) => {
        userProfile.value = profile;
    };

    const login = (tokenValue: string, profile: UserProfile) => {
        setToken(tokenValue);
        setUserProfile(profile);
    };

    const logout = () => {
        token.value = null;
        userProfile.value = null;
    };

    return { 
        token, 
        userProfile,
        isLoggedIn, 
        username,
        setToken, 
        setUserProfile,
        login,
        logout 
    };
};
