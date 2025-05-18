<template>
    <NuxtLink to="janken" class="
           inline-block
           px-8 py-4
           font-semibold text-white
           bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
           rounded-full
           shadow-lg
           transform transition
           hover:scale-105 hover:brightness-110
           focus:outline-none focus:ring-4 focus:ring-purple-300 mb-8">ジャンケン</NuxtLink>
    <NuxtLink to="quiz" class="
           inline-block
           px-8 py-4
           font-semibold text-white
           bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
           rounded-full
           shadow-lg
           transform transition
           hover:scale-105 hover:brightness-110
           focus:outline-none focus:ring-4 focus:ring-purple-300">クイズ</NuxtLink>
    <NuxtLink to="sql" class="
           inline-block
           px-8 py-4
           font-semibold text-white
           bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
           rounded-full
           shadow-lg
           transform transition
           hover:scale-105 hover:brightness-110
           focus:outline-none focus:ring-4 focus:ring-purple-300 mb-8">SQL</NuxtLink>
    <NuxtLink v-for="question in questions" :key="question.id" :to="`sql/${question.id}`">
        <br>
        SQL問題{{ question.id }}
    </NuxtLink>
</template>
<script setup lang="ts">

import { ref, onMounted } from 'vue'
import { useSqlQuiz } from '~/composables/useSqlQuiz';

const { questions, loadQuestions } = useSqlQuiz();

onMounted(() => {
    loadQuestions();
})

</script>