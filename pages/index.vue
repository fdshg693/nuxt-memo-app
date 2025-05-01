<template>
  <div class="bg-gray-100 flex items-center justify-center">
    <NuxtLink to="janken" class="
       inline-block
       px-8 py-4
       font-semibold text-white
       bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
       rounded-full
       shadow-lg
       transform transition
       hover:scale-105 hover:brightness-110
       focus:outline-none focus:ring-4 focus:ring-purple-300">ジャンケンゲーム</NuxtLink>
  </div>    
    <QuestionCard
      v-if="questions.length"
      :question="questions[currentIndex]"
      :questionIndex="currentIndex"
      :userAnswer="userAnswer"
      :result="result"
      @update:answer="userAnswer = $event"
      @check="checkAnswer"
      @next="nextQuestion"
    />
    <div v-else class="p-4 text-center">問題をロード中…</div>
    <RandomCalc/>
  </template>
  
  <script setup lang="ts">
  import { onMounted } from 'vue'
  import { useQuiz } from '~/composables/useQuiz'
  import QuestionCard from '~/components/QuestionCard.vue'
  import RandomCalc from '~/components/RandomCalc.vue'
  
  const {
    questions,
    currentIndex,
    userAnswer,
    result,
    loadQuestions,
    checkAnswer,
    nextQuestion,
  } = useQuiz()
  
  onMounted(loadQuestions)
  </script>