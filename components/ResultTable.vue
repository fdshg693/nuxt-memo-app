<template>
    <div v-if="result.length" class="mb-6">
        <h3 class="font-semibold text-purple-700 mb-2">結果</h3>
        <table class="w-full border border-purple-200 rounded-lg overflow-hidden">
            <thead class="bg-gradient-to-r from-indigo-100 to-purple-100">
                <tr>
                    <th v-for="col in columns" :key="col"
                        class="px-2 py-1 border-b border-purple-100 text-left text-sm text-indigo-700 font-semibold">
                        {{ col }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, idx) in result" :key="idx" class="hover:bg-indigo-50">
                    <td v-for="col in columns" :key="col" class="px-2 py-1 border-b border-purple-50">{{ row[col] }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script setup lang="ts">
defineProps<{ columns: string[], result: any[] }>()
</script>
