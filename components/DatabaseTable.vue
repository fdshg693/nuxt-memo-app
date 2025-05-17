<template>
    <div class="mb-6">
        <p class="mb-2 text-gray-600">テーブル名: <span class="font-mono text-indigo-700 font-bold">{{ dbName }}</span></p>
        <table class="w-full border border-purple-200 rounded-lg mb-2 overflow-hidden">
            <thead class="bg-gradient-to-r from-indigo-100 to-purple-100">
                <tr>
                    <th v-for="col in columns" :key="col"
                        class="px-2 py-1 border-b border-purple-100 text-left text-sm text-indigo-700 font-semibold">
                        {{ col }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, idx) in rows" :key="idx" class="hover:bg-indigo-50">
                    <td v-for="col in columns" :key="col" class="px-2 py-1 border-b border-purple-50">{{ row[col] }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script setup lang="ts">
defineProps<{ dbName: string, columns: string[], rows: any[] }>()
</script>
