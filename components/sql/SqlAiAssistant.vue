<template>
  <div v-if="aiAnswer || aiErrorDisplay" class="mb-4">
    <!-- AI Answer -->
    <div v-if="aiAnswer"
      class="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-400 text-indigo-800 p-3 rounded mb-2">
      <span class="font-semibold">AIの回答:</span> 
      <SafeAiResponse :response="aiAnswer" />
    </div>
    
    <!-- AI Error Display -->
    <div v-if="aiErrorDisplay" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 rounded">
      {{ aiErrorDisplay }}
    </div>
  </div>
</template>

<script setup lang="ts">
import SafeAiResponse from '~/components/SafeAiResponse.vue';

defineProps<{
  aiAnswer: string;
  aiErrorDisplay: string | null;
}>();
</script>