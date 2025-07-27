<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
      データスキーマ検証ページ
    </h1>

    <!-- プロンプトテンプレートのテスト -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-6">プロンプトテンプレート (PROMPT-001)</h2>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-medium mb-4">テンプレート一覧</h3>
          <div class="space-y-2">
            <div v-for="template in promptTemplates" :key="template.id" 
                 class="p-3 border rounded cursor-pointer hover:bg-gray-50"
                 @click="selectedTemplate = template">
              <div class="font-medium">{{ template.name }}</div>
              <div class="text-sm text-gray-600">{{ template.category }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-medium mb-4">テンプレート詳細</h3>
          <div v-if="selectedTemplate">
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">ID:</label>
              <div class="text-sm bg-gray-100 p-2 rounded">{{ selectedTemplate.id }}</div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">カテゴリ:</label>
              <div class="text-sm bg-gray-100 p-2 rounded">{{ selectedTemplate.category }}</div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">テンプレート:</label>
              <div class="text-sm bg-gray-100 p-2 rounded whitespace-pre-wrap">{{ selectedTemplate.template }}</div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">変数:</label>
              <div class="space-y-2">
                <div v-for="variable in selectedTemplate.variables" :key="variable.name" 
                     class="text-sm bg-blue-50 p-2 rounded">
                  <span class="font-medium">{{ variable.name }}</span>
                  <span class="text-gray-600">({{ variable.type }})</span>
                  <span v-if="variable.required" class="text-red-500">*</span>
                  <div class="text-xs text-gray-500">{{ variable.description }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 text-center py-8">
            テンプレートを選択してください
          </div>
        </div>
      </div>
    </section>

    <!-- 選択式問題のテスト -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-6">選択式問題 (PRACTICAL-001)</h2>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-medium mb-4">問題一覧</h3>
          
          <!-- カテゴリ選択 -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">カテゴリ:</label>
            <select v-model="selectedCategory" class="w-full p-2 border rounded">
              <option value="">全て</option>
              <option value="transaction">Transaction</option>
              <option value="performance">Performance</option>
              <option value="deadlock">Deadlock</option>
            </select>
          </div>

          <div class="space-y-2">
            <div v-for="question in filteredQuestions" :key="question.id" 
                 class="p-3 border rounded cursor-pointer hover:bg-gray-50"
                 @click="selectedQuestion = question">
              <div class="font-medium">{{ question.id }}</div>
              <div class="text-sm text-gray-600">
                Level {{ question.level }} - {{ question.subCategory }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Tags: {{ question.tags.join(', ') }}
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-medium mb-4">問題詳細</h3>
          <div v-if="selectedQuestion">
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">問題文:</label>
              <div class="text-sm bg-gray-100 p-3 rounded whitespace-pre-wrap" v-html="selectedQuestion.question"></div>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">選択肢:</label>
              <div class="space-y-2">
                <label v-for="(choice, index) in selectedQuestion.choices" :key="index" 
                       class="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input type="radio" :value="index" v-model="selectedAnswer" class="mr-2">
                  <span>{{ choice }}</span>
                  <span v-if="showAnswer && index === selectedQuestion.correct" 
                        class="ml-2 text-green-600 font-bold">✓</span>
                </label>
              </div>
            </div>

            <div class="mb-4">
              <button @click="checkAnswer" 
                      class="btn-gradient text-white px-4 py-2 rounded mr-2">
                回答をチェック
              </button>
              <button @click="resetAnswer" 
                      class="bg-gray-500 text-white px-4 py-2 rounded">
                リセット
              </button>
            </div>

            <div v-if="showAnswer" class="mb-4">
              <label class="block text-sm font-medium mb-2">解説:</label>
              <div class="text-sm bg-yellow-50 p-3 rounded whitespace-pre-wrap" v-html="selectedQuestion.explanation"></div>
            </div>

            <div v-if="selectedQuestion.references.length > 0" class="mb-4">
              <label class="block text-sm font-medium mb-2">参考資料:</label>
              <div class="space-y-1">
                <a v-for="ref in selectedQuestion.references" :key="ref.url" 
                   :href="ref.url" target="_blank" 
                   class="block text-sm text-blue-600 hover:underline">
                  {{ ref.title }}
                </a>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 text-center py-8">
            問題を選択してください
          </div>
        </div>
      </div>
    </section>

    <!-- 統計情報 -->
    <section class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-semibold mb-6">統計情報</h2>
      <div class="grid md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-indigo-600">{{ promptTemplates.length }}</div>
          <div class="text-sm text-gray-600">プロンプトテンプレート</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">{{ multipleChoiceQuestions.length }}</div>
          <div class="text-sm text-gray-600">選択式問題</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-pink-600">{{ uniqueCategories.length }}</div>
          <div class="text-sm text-gray-600">問題カテゴリ</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ uniqueTags.length }}</div>
          <div class="text-sm text-gray-600">ユニークタグ</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePromptTemplates } from '@/composables/usePromptTemplates'
import { useMultipleChoiceQuiz } from '@/composables/useMultipleChoiceQuiz'

// プロンプトテンプレート
const { templates: promptTemplates, loadTemplates } = usePromptTemplates()
const selectedTemplate = ref(null)

// 選択式問題
const { questions: multipleChoiceQuestions, loadQuestions, checkAnswer: checkMCAnswer } = useMultipleChoiceQuiz()
const selectedQuestion = ref(null)
const selectedCategory = ref('')
const selectedAnswer = ref(null)
const showAnswer = ref(false)

// フィルタリングされた問題
const filteredQuestions = computed(() => {
  if (!selectedCategory.value) return multipleChoiceQuestions.value
  return multipleChoiceQuestions.value.filter(q => q.category === selectedCategory.value)
})

// 統計情報
const uniqueCategories = computed(() => {
  const categories = new Set(multipleChoiceQuestions.value.map(q => q.category))
  return Array.from(categories)
})

const uniqueTags = computed(() => {
  const tags = new Set()
  multipleChoiceQuestions.value.forEach(q => q.tags.forEach(tag => tags.add(tag)))
  return Array.from(tags)
})

// 回答チェック
function checkAnswer() {
  if (selectedAnswer.value === null || !selectedQuestion.value) return
  
  const result = checkMCAnswer(selectedQuestion.value.id, selectedAnswer.value)
  showAnswer.value = true
  
  // 結果を表示（実際のアプリではより良いUIで表示）
  if (result.isCorrect) {
    alert('正解です！')
  } else {
    alert(`不正解です。正解は選択肢 ${result.correctIndex + 1} です。`)
  }
}

function resetAnswer() {
  selectedAnswer.value = null
  showAnswer.value = false
}

// 初期化
onMounted(async () => {
  await loadTemplates()
  await loadQuestions()
})
</script>

<style scoped>
.btn-gradient {
  @apply bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600;
}
</style>