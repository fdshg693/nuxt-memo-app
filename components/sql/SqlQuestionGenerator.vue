<template>
  <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6 border border-green-200">
    <h3 class="text-lg font-semibold text-green-800 mb-4">
      🤖 AI SQL問題生成
    </h3>
    
    <div class="space-y-4">
      <!-- Genre Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          ジャンル
        </label>
        <select 
          v-model="selectedGenre" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">ジャンルを選択</option>
          <option value="SELECT">SELECT</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="JOIN">JOIN</option>
          <option value="GROUP BY">GROUP BY</option>
          <option value="ORDER BY">ORDER BY</option>
          <option value="WHERE">WHERE</option>
          <option value="PERFORMANCE">PERFORMANCE</option>
          <option value="TRANSACTION">TRANSACTION</option>
          <option value="DEADLOCK">DEADLOCK</option>
        </select>
      </div>

      <!-- Level Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          レベル
        </label>
        <select 
          v-model="selectedLevel" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">レベルを選択</option>
          <option value="1">レベル1 (基本)</option>
          <option value="2">レベル2 (初級)</option>
          <option value="3">レベル3 (中級)</option>
          <option value="4">レベル4 (上級)</option>
          <option value="5">レベル5 (エキスパート)</option>
        </select>
      </div>

      <!-- Database Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          データベーステーブル (オプション)
        </label>
        <select 
          v-model="selectedDb" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">テーブルを選択 (任意)</option>
          <option value="users">users</option>
          <option value="customers">customers</option>
          <option value="products">products</option>
          <option value="orders">orders</option>
          <option value="categories">categories</option>
        </select>
      </div>

      <!-- Generate Button -->
      <div class="flex justify-center">
        <button
          @click="generateQuestion"
          :disabled="!selectedGenre || !selectedLevel || isGenerating"
          class="btn-gradient px-6 py-3 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isGenerating" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            生成中...
          </span>
          <span v-else>問題を生成</span>
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 rounded">
        {{ error }}
      </div>

      <!-- Generated Question Display -->
      <div v-if="generatedQuestion" class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <h4 class="font-semibold text-blue-800 mb-2">生成された問題:</h4>
        <p class="text-blue-700 mb-3">{{ generatedQuestion.question }}</p>
        
        <div class="mb-3">
          <span class="text-sm font-medium text-blue-600">正解SQL:</span>
          <code class="block bg-blue-100 p-2 rounded text-sm mt-1">{{ generatedQuestion.answer }}</code>
        </div>
        
        <div v-if="generatedQuestion.explanation" class="mb-3">
          <span class="text-sm font-medium text-blue-600">解説:</span>
          <p class="text-sm text-blue-700 mt-1">{{ generatedQuestion.explanation }}</p>
        </div>

        <button
          @click="useGeneratedQuestion"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          この問題を使用する
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Props and emits
const emit = defineEmits<{
  questionGenerated: [question: any]
}>()

// Reactive data
const selectedGenre = ref('')
const selectedLevel = ref('')
const selectedDb = ref('')
const isGenerating = ref(false)
const error = ref('')
const generatedQuestion = ref(null)

// Generate question function
async function generateQuestion() {
  if (!selectedGenre.value || !selectedLevel.value) {
    error.value = 'ジャンルとレベルを選択してください。'
    return
  }

  isGenerating.value = true
  error.value = ''
  generatedQuestion.value = null

  try {
    const { data: response, error: fetchError } = await useFetch('/api/generate-question', {
      method: 'POST',
      body: {
        genre: selectedGenre.value,
        level: parseInt(selectedLevel.value),
        dbName: selectedDb.value
      }
    })

    if (fetchError.value) {
      error.value = 'SQL問題の生成に失敗しました。'
    } else if (response.value?.error) {
      error.value = response.value.error
    } else {
      generatedQuestion.value = response.value
    }
  } catch (err) {
    console.error('Error generating question:', err)
    error.value = 'SQL問題の生成中にエラーが発生しました。'
  } finally {
    isGenerating.value = false
  }
}

// Use generated question
function useGeneratedQuestion() {
  if (generatedQuestion.value) {
    emit('questionGenerated', generatedQuestion.value)
    
    // Reset form
    selectedGenre.value = ''
    selectedLevel.value = ''
    selectedDb.value = ''
    generatedQuestion.value = null
  }
}
</script>

<style scoped>
.btn-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: all 0.3s ease;
}

.btn-gradient:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(103, 125, 233, 0.3);
}
</style>