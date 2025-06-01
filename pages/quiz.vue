<template>
  <div class="quiz-page bg-gray-100 min-h-screen flex flex-col items-center py-8">
    <NuxtLink to="/" class="quiz-top-btn">
      トップ
    </NuxtLink>
    <div class="quiz-content w-full max-w-6xl flex flex-row gap-8 justify-center items-start mt-8">
      <div class="flex-1 min-w-[320px] max-w-md">
        <QuestionCard v-if="questions.length" :question="questions[currentIndex]" :questionIndex="currentIndex"
          :userAnswer="userAnswer" :result="result" :correctNumber="correctNumber" :wrongNumber="wrongNumber"
          @update:answer="userAnswer = $event" @check="checkAnswer" @next="nextQuestion" />
        <div v-else class="p-4 text-center text-gray-500">問題をロード中…</div>
      </div>
      <div class="flex-1 min-w-[320px] max-w-md">
        <RandomCalc />
      </div>
      <div class="flex-1 min-w-[320px] max-w-md">
        <AIQuestion />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useQuiz } from '~/composables/useQuiz'
import QuestionCard from '~/components/random/QuestionCard.vue'
import RandomCalc from '~/components/random/RandomCalc.vue'
import AIQuestion from '~/components/random/AIQuestion.vue'

const {
  questions,
  currentIndex,
  userAnswer,
  result,
  correctNumber,
  wrongNumber,
  loadQuestions,
  checkAnswer,
  nextQuestion,
} = useQuiz()

onMounted(loadQuestions)
</script>

<style scoped>
.quiz-page {
  min-height: 100vh;
  background: #f3f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.quiz-top-btn {
  display: inline-block;
  padding: 1rem 2rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(to right, #6366f1, #a21caf, #ec4899);
  border-radius: 9999px;
  box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.10);
  transition: transform 0.2s, filter 0.2s;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.quiz-top-btn:hover,
.quiz-top-btn:focus {
  transform: scale(1.05);
  filter: brightness(1.1);
  outline: none;
  box-shadow: 0 6px 20px 0 rgba(168, 85, 247, 0.25);
}

.quiz-content {
  width: 100%;
  max-width: 96rem;
  display: flex;
  flex-direction: row;
  gap: 2rem;
  justify-content: center;
  align-items: flex-start;
}
</style>