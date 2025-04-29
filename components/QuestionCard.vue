<template>
    <div class="p-4 max-w-md mx-auto">
      <div class="mb-2">
        <span class="text-lg">
          Q{{ questionIndex + 1 }}: {{ question.operand1 }}
          {{ question.operator }} {{ question.operand2 }} =
        </span>
      </div>
  
      <div class="flex items-center">
        <input
          v-model.number="localAnswer"
          type="number"
          placeholder="答えを入力"
          class="border rounded px-2 py-1 mr-2"
        />
        <button
          @click="emitCheck"
          class="bg-blue-500 text-white px-3 py-1 rounded"
        >
          判定
        </button>
      </div>
  
      <div v-if="result !== null" class="mt-2">
        <span :class="result === '正解！' ? 'text-green-600' : 'text-red-600'">
          {{ result }}
        </span>
      </div>
  
      <button
        @click="emitNext"
        class="mt-4 bg-gray-200 px-3 py-1 rounded"
      >
        次の問題へ
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { watch, ref, toRef } from 'vue'
  import type { Question } from '~/composables/useQuiz'
  
  // 親コンポーネントから受け取るprops
  const props = defineProps<{
    question: Question
    questionIndex: number
    userAnswer: number | null
    result: string | null
  }>()
  const emit = defineEmits<{
    (e: 'update:answer', val: number | null): void
    (e: 'check'): void
    (e: 'next'): void
  }>()
  
  // v-modelのローカルコピー
  const localAnswer = ref<number | null>(props.userAnswer)
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
  }
  </script>