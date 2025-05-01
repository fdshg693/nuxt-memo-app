<template>
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