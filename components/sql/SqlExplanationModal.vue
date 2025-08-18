<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-purple-200 p-6 rounded-t-2xl">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-purple-700">{{ explanationData?.title || '解説' }}</h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 text-2xl font-bold transition"
          >
            ×
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div v-if="explanationData">
          <!-- Description -->
          <div class="mb-6">
            <p class="text-gray-700 leading-relaxed">{{ explanationData.description }}</p>
          </div>

          <!-- Examples -->
          <div v-if="explanationData.examples && explanationData.examples.length > 0">
            <h3 class="text-lg font-semibold text-purple-600 mb-4">実例とポイント</h3>
            <div class="space-y-6">
              <div
                v-for="(example, index) in explanationData.examples"
                :key="index"
                class="border border-purple-200 rounded-lg p-4 bg-purple-50"
              >
                <!-- SQL Example -->
                <div class="mb-3">
                  <h4 class="text-sm font-semibold text-purple-600 mb-2">SQL例:</h4>
                  <pre class="bg-gray-800 text-green-400 p-3 rounded-lg text-sm overflow-x-auto"><code>{{ example.example }}</code></pre>
                </div>
                
                <!-- Explanation -->
                <div>
                  <h4 class="text-sm font-semibold text-purple-600 mb-2">解説:</h4>
                  <p class="text-gray-700 text-sm leading-relaxed">{{ example.explanation }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p class="text-purple-600">解説を読み込んでいます...</p>
        </div>

        <!-- Error State -->
        <div v-else class="text-center py-8">
          <p class="text-red-600">解説の読み込みに失敗しました。</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-gray-50 border-t border-purple-200 p-4 rounded-b-2xl">
        <div class="flex justify-end">
          <button
            @click="closeModal"
            class="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition shadow"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface ExplanationExample {
  example: string;
  explanation: string;
  DbName?: string;
}

interface ExplanationData {
  title: string;
  description: string;
  examples?: ExplanationExample[];
}

const props = defineProps<{
  isVisible: boolean;
  genre?: string;
}>();

const emit = defineEmits<{
  'close': [];
}>();

const explanationData = ref<ExplanationData | null>(null);
const isLoading = ref(false);

function closeModal() {
  emit('close');
}

async function loadExplanation(genre: string) {
  if (!genre) return;
  
  isLoading.value = true;
  explanationData.value = null;
  
  try {
    // Map genre to explanation file name
    const explanationFileMap: Record<string, string> = {
      'PERFORMANCE': 'performanceExplanation',
      'TRANSACTION': 'transactionExplanation', 
      'DEADLOCK': 'deadlockExplanation',
      'SELECT': 'selectExplanation',
      'INSERT': 'insertExplanation',
      'UPDATE': 'updateExplanation',
      'DELETE': 'deleteExplanation',
      'JOIN': 'joinExplanation',
      'WHERE': 'whereExplanation',
      'GROUP_BY': 'groupbyExplanation',
      'ORDER_BY': 'orderbyExplanation',
      'COUNT': 'countExplanation',
      'SUM': 'sumExplanation'
    };
    
    const fileName = explanationFileMap[genre.toUpperCase()];
    if (!fileName) {
      explanationData.value = {
        title: `${genre} の解説`,
        description: 'この内容の詳細解説は準備中です。'
      };
      return;
    }
    
    // Load explanation data
    const data = await $fetch(`/data/sqlExplanation/${fileName}.json`);
    if (data && data.length > 0) {
      explanationData.value = data[0];
    } else {
      explanationData.value = {
        title: `${genre} の解説`,
        description: '解説データの読み込みに失敗しました。'
      };
    }
  } catch (error) {
    console.error('Error loading explanation:', error);
    explanationData.value = {
      title: `${genre} の解説`,
      description: '解説の読み込み中にエラーが発生しました。'
    };
  } finally {
    isLoading.value = false;
  }
}

// Watch for genre changes when modal is opened
watch([() => props.isVisible, () => props.genre], ([visible, genre]) => {
  if (visible && genre) {
    loadExplanation(genre);
  }
});
</script>