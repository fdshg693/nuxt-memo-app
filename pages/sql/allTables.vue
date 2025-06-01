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
        <div class="max-w-4xl mx-auto">
            <h1
                class="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                すべてのテーブル一覧
            </h1>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DatabaseTable v-for="db in databases" :key="db.name" :db="db" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DatabaseTable from '~/components/DatabaseTable.vue'
import databasesJson from '@/data/sqlDatabases.json'

const databases = ref<any[]>([])

onMounted(async () => {
    databases.value = databasesJson
})
</script>
