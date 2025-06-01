<template>
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
        <div class="max-w-4xl mx-auto">
            <h1
                class="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                すべてのテーブル一覧
            </h1>
            <div v-if="loading" class="text-center text-gray-500">読み込み中...</div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DatabaseTable v-for="db in databases" :key="db.name" :db="db" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DatabaseTable from '~/components/DatabaseTable.vue'

const databases = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
    loading.value = true
    const res = await fetch('/api/sqlDatabases')
    databases.value = await res.json()
    loading.value = false
})
</script>
