<template>
  <div>
    <!-- Analysis Code Display -->
    <div class="mb-6">
      <h2 class="text-lg font-bold text-purple-700 mb-2">分析対象のSQL</h2>
      <div class="bg-gray-50 border border-purple-200 rounded-lg p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap">{{ analysisCode }}</div>
    </div>

    <!-- User Answer Input -->
    <div class="mb-6">
      <h3 class="text-md font-semibold text-purple-600 mb-2">あなたの分析を入力してください</h3>
      <textarea 
        v-model="userAnswer"
        :placeholder="getPlaceholderText()"
        class="w-full h-32 p-4 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        :disabled="isAiLoading"
      ></textarea>
      
      <div class="flex gap-2 mt-3">
        <button 
          @click="submitAnswer"
          :disabled="!userAnswer.trim() || isAiLoading"
          class="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition shadow disabled:opacity-50 disabled:cursor-not-allowed">
          回答を保存
        </button>
        <button 
          @click="clearAnswer"
          :disabled="!userAnswer.trim() || isAiLoading"
          class="px-4 py-2 rounded-lg border border-purple-300 text-purple-600 font-medium hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed">
          クリア
        </button>
      </div>
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
import { ref } from 'vue';

const props = defineProps<{
  analysisCode: string;
  isAiLoading: boolean;
  genre?: string;
}>();

const emit = defineEmits<{
  'ask-ai': [prompt: string];
  'submit-answer': [answer: string];
}>();

const userAnswer = ref('');

function getPlaceholderText(): string {
  const genre = props.genre || '';
  
  switch (genre) {
    case 'PERFORMANCE':
      return 'パフォーマンスの問題点、インデックスの活用、実行計画の予測、改善案などを分析してください...';
    case 'TRANSACTION':
      return 'トランザクションの分離レベル、並行性制御、ロック戦略、ACID特性などを分析してください...';
    case 'DEADLOCK':
      return 'デッドロック発生の可能性、リソースアクセス順序、回避策などを分析してください...';
    default:
      return 'SQLコードの問題点や改善点を分析して入力してください...';
  }
}

function submitAnswer() {
  if (userAnswer.value.trim()) {
    emit('submit-answer', userAnswer.value);
  }
}

function clearAnswer() {
  userAnswer.value = '';
}

function analyzeSQL() {
  // Generate analysis prompt based on question genre
  let analysisPrompt = 'このSQLコードを詳しく分析してください。';
  
  // This will be called by the parent component which has access to genre
  emit('ask-ai', analysisPrompt);
}
</script>