<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { useUserProgress } from '~/composables/useUserProgress';

// Global app initialization
const { isLoggedIn, checkAuth } = useAuth();
const { loadProgressFromServer } = useUserProgress();

// Check authentication on app start and initialize user progress
onMounted(async () => {
  const isAuthenticated = await checkAuth();

  if (isAuthenticated) {
    try {
      // Load user progress from server when authenticated
      await loadProgressFromServer();
    } catch (error) {
      console.warn('Failed to load progress on app init:', error);
    }
  }
});
</script>
