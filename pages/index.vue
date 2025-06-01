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
    <NuxtLink to="sql/allTables" class="
           inline-block
           px-8 py-4
           font-semibold text-white
           bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
           rounded-full
           shadow-lg
           transform transition
           hover:scale-105 hover:brightness-110
           focus:outline-none focus:ring-4 focus:ring-purple-300 mb-8">SQLで使うテーブルの一覧</NuxtLink>
    <div class="border-2 border-purple-400 rounded-lg p-4 mt-8 bg-white shadow-md">
        <h2 class="text-lg font-bold mb-4 text-purple-700">SQL問題一覧</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <NuxtLink v-for="question in questions" :key="question.id" :to="`sql/${question.id}`"
                class="px-4 py-2 rounded bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium transition text-center">
                SQL問題{{ question.id }}
            </NuxtLink>
        </div>
    </div>
</template>
<script setup lang="ts">

import { ref, onMounted } from 'vue'
import { useSqlQuiz } from '~/composables/useSqlQuiz';

const { questions, loadQuestions } = useSqlQuiz();

onMounted(() => {
    loadQuestions();
})

</script>