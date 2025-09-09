<template>
  <div class="flex flex-col items-center mb-8">
    <!-- Top navigation links -->
    <div class="flex gap-4 mb-4">
      <NuxtLink to="/" class="btn-gradient">トップ</NuxtLink>
      <NuxtLink to="/sql/explanation" class="btn-gradient">SQL解説</NuxtLink>
      <NuxtLink v-if="isLoggedIn" to="/profile" class="btn-gradient bg-gradient-to-r from-purple-600 to-indigo-600">
        プロフィール</NuxtLink>
    </div>

    <!-- Genre explanation links -->
    <p>関連するジャンルのSQL解説</p>
    <div v-if="currentQA.genre && currentQA.genre.length" class="flex flex-wrap justify-center gap-4 mt-4">
      <NuxtLink v-for="genre in currentQA.genre" :key="genre" :to="`/sql/explanation/${genre}`" class="btn-gradient">{{
        genre }}解説</NuxtLink>
    </div>
    <div v-else class="mt-2 text-sm text-gray-500">関連するジャンルはありません。</div>

    <!-- Subgenre explanation links -->
    <p>関連するサブジャンルのSQL解説</p>
    <div v-if="currentQA.subgenre && currentQA.subgenre.length" class="flex flex-wrap justify-center gap-4 mt-4">
      <NuxtLink v-for="subgenre in currentQA.subgenre" :key="subgenre" :to="`/sql/explanation/${subgenre}`"
        class="btn-gradient">{{ subgenre }}解説</NuxtLink>
    </div>
    <div v-else class="mt-2 text-sm text-gray-500">関連するサブジャンルはありません。</div>

    <!-- Page title -->
    <h1
      class="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
      SQLの問題
    </h1>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

const { isLoggedIn } = useAuth();

interface QuestionAnswer {
  genre: string[];
  subgenre: string[];
}

defineProps<{
  currentQA: QuestionAnswer;
}>();
</script>