<template>
  <div
    class="min-h-[60vh] bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50 p-6 max-w-lg mx-auto rounded-2xl shadow-2xl border border-gray-100">
    <div class="mb-4 flex items-center gap-2">
      <span class="text-lg font-bold text-blue-700 drop-shadow">Q{{ questionIndex + 1 }}:</span>
      <span class="text-lg text-gray-800">{{ question.question }}</span>
    </div>

    <div class="flex items-center gap-2 mb-2">
      <input v-model.string="localAnswer" placeholder="答えを入力"
        class="border border-gray-300 rounded-xl px-3 py-2 w-2/3 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm text-base transition-all" />
      <button @click="emitCheck"
        class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold shadow hover:from-blue-600 hover:to-purple-600 transition-all">
        判定
      </button>
    </div>

    <div v-if="result !== null" class="mt-3">
      <span :class="result === '正解！' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
        {{ result }}
      </span>
    </div>

    <button @click="emitNext"
      class="mt-6 w-full bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl font-medium shadow transition-all border border-gray-200">
      次の問題へ
    </button>
    <div class="flex justify-between mt-6 px-2">
      <p class="text-green-700 font-semibold">正解数: <span class="font-bold">{{ correctNumber }}</span></p>
      <p class="text-red-700 font-semibold">不正解数: <span class="font-bold">{{ wrongNumber }}</span></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, toRef } from 'vue'
import type { Question } from '~/composables/useQuiz'

// 親コンポーネントから受け取るprops
const props = defineProps<{
  question: Question
  questionIndex: number
  userAnswer: string | null
  result: string | null
  correctNumber: number
  wrongNumber: number
}>()
const emit = defineEmits<{
  (e: 'update:answer', val: string | null): void
  (e: 'check'): void
  (e: 'next'): void
}>()

// v-modelのローカルコピー
const localAnswer = ref<string | null>(props.userAnswer)
watch(
  () => localAnswer.value,
  (val) => {
    emit('update:answer', val)
  }
)

function emitCheck() {
  emit('check')
}

function emitNext() {
  emit('next')
  localAnswer.value = null
}
</script>