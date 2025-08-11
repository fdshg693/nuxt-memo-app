// middleware/admin.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn, userProfile } = useAuth();
  
  if (!isLoggedIn.value) {
    return navigateTo('/login');
  }
  
  if (!userProfile.value?.is_admin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'このページにアクセスする権限がありません。管理者のみ利用できます。'
    });
  }
});