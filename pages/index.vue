<template>
    <div class="p-4 max-w-md mx-auto">
      <h1 class="text-2xl font-bold mb-4">計算クイズ</h1>
  
      <div v-if="questions.length">
        <!-- 問題表示 -->
        <div class="mb-2">
          <span class="text-lg">
            Q{{ currentIndex + 1 }}:
            {{ questions[currentIndex].operand1 }}
            {{ questions[currentIndex].operator }}
            {{ questions[currentIndex].operand2 }} =
          </span>
        </div>
  
        <!-- 回答入力 -->
        <input
          v-model="userAnswer"
          type="number"
          placeholder="答えを入力"
          class="border rounded px-2 py-1 mr-2"
        />
        <button @click="checkAnswer" class="bg-blue-500 text-white px-3 py-1 rounded">
          判定
        </button>
  
        <!-- 判定結果 -->
        <div v-if="result !== null" class="mt-2">
          <span :class="result === '正解！' ? 'text-green-600' : 'text-red-600'">
            {{ result }}
          </span>
        </div>
  
        <!-- 次の問題ボタン -->
        <button
          @click="nextQuestion"
          class="mt-4 bg-gray-200 px-3 py-1 rounded"
        >
          次の問題へ
        </button>
      </div>
  
      <div v-else>
        問題をロード中…
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  
  // 型定義（お好みで .d.ts に分離してもOK）
  interface Question {
    id: number
    operand1: number
    operand2: number
    operator: '+' | '-' | '*' | '/'
    answer: number
  }
  
  const questions = ref<Question[]>([])
  const currentIndex = ref(0)
  const userAnswer = ref<number | null>(null)
  const result = ref<string | null>(null)
  
  onMounted(async () => {
    // public/questions.json をフェッチ
    const res = await fetch('/questions.json')
    questions.value = await res.json()
  })
  
  function checkAnswer() {
    if (userAnswer.value === null) {
      result.value = '回答を入力してください'
      return
    }
    const correct = questions.value[currentIndex.value].answer
    result.value =
      userAnswer.value === correct ? '正解！' : `不正解… 正解は ${correct} です`
  }
  
  function nextQuestion() {
    // インデックスを次に進める（最後まで行ったら最初に戻る）
    currentIndex.value =
      (currentIndex.value + 1) % questions.value.length
    // 状態クリア
    userAnswer.value = null
    result.value = null
  }
  </script>
  
  <style scoped>
  /* TailwindCSS を導入していない場合はお好みのスタイルを */
  </style>
  