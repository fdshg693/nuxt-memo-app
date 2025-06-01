<template>
    <div
        class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 min-h-screen flex flex-col items-center justify-start py-8">
        <NuxtLink to="/" class="
           inline-block
           px-8 py-4
           font-semibold text-white
           bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
           rounded-full
           shadow-lg
           transform transition
           hover:scale-105 hover:brightness-110
           focus:outline-none focus:ring-4 focus:ring-purple-300 mb-8">トップ</NuxtLink>
        <h1 class="text-2xl font-bold mb-6 text-center">SQL文の説明</h1>
        <ul v-if="explanations.length">
            <li v-for="item in explanations" :key="item.keyword" class="mb-8">
                <h2 class="text-lg font-semibold text-blue-700 mb-2">{{ item.title }}</h2>
                <p class="text-gray-700">{{ item.description }}</p>
                <NuxtLink :to="`/sql/explanation/${item.keyword}`"
                    class="inline-block mt-2 px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition">
                    詳細を見る
                </NuxtLink>
            </li>
        </ul>
        <div v-else class="text-center text-gray-500">説明データを読み込み中...</div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import sampleData from '@/data/sqlExplanation/sqlExplanation.json'

interface SqlExplanation {
    keyword: string
    title: string
    description: string
}

const explanations = ref<SqlExplanation[]>([])

onMounted(async () => {
    explanations.value = sampleData
})
</script>
