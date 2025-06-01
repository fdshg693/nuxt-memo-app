<template>
    <div class="mb-6">
        <button @click="$emit('check')"
            class="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:from-green-600 hover:to-green-700 transition shadow">
            解答を確認
        </button>
    </div>
    <div>
        <p v-if="isCorrect === null" class="text-gray-500">まだ解答していません</p>
        <div v-else>
            <p class="font-semibold text-purple-700">解答例</p>
            <div v-if="currentAnswer">
                <pre
                    class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 text-sm text-indigo-900 mb-2 border border-purple-100 whitespace-pre-wrap break-words">{{ currentAnswer }}</pre>
            </div>
            <p v-if="isCorrect === true" class="text-green-600 font-bold">✅ 正解です！</p>
            <p v-else-if="isCorrect === false" class="text-red-600 font-bold">❌ 不正解です</p>
        </div>
    </div>
</template>
<script setup lang="ts">
defineProps<{ isCorrect: boolean | null, currentAnswer: string }>()
defineEmits(['check'])
</script>
