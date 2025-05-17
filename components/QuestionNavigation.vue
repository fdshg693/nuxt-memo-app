<template>
    <div class="flex gap-2 mb-6">
        <button @click="$emit('prev')" :disabled="index === 0"
            class="px-4 py-2 rounded-lg border border-gray-300 bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 text-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition">
            前へ
        </button>
        <button @click="$emit('next')" :disabled="index === questionsLength - 1"
            class="px-4 py-2 rounded-lg border border-gray-300 bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 text-pink-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition">
            次へ
        </button>
    </div>
</template>
<script setup lang="ts">
defineProps<{ index: number, questionsLength: number }>()
defineEmits(['prev', 'next'])
</script>
