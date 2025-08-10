<template>
  <div>
    <!-- Analysis Code Display -->
    <div class="mb-6">
      <h2 class="text-lg font-bold text-purple-700 mb-2">分析対象のSQL</h2>
      <div class="bg-gray-50 border border-purple-200 rounded-lg p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap">{{ analysisCode }}</div>
    </div>

    <!-- AI Assistant for Analysis -->
    <div class="mb-4">
      <h3 class="text-md font-semibold text-purple-600 mb-2">AIによる分析</h3>
      <div class="flex gap-2 mb-4">
        <button 
          @click="analyzeSQL"
          :disabled="isAiLoading"
          class="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition shadow disabled:opacity-50">
          {{ isAiLoading ? '分析中...' : 'SQL分析を開始' }}
        </button>
        <AiPromptModal v-if="!isAiLoading" :isAiLoading="false" @ask-ai="$emit('ask-ai', $event)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AiPromptModal from '~/components/AiPromptModal.vue';

const props = defineProps<{
  analysisCode: string;
  isAiLoading: boolean;
}>();

const emit = defineEmits<{
  'ask-ai': [prompt: string];
}>();

function analyzeSQL() {
  // Generate analysis prompt based on question genre
  let analysisPrompt = 'このSQLコードを詳しく分析してください。';
  
  // This will be called by the parent component which has access to genre
  emit('ask-ai', analysisPrompt);
}
</script>