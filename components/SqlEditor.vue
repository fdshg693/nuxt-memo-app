<template>
    <div>
        <h2 class="text-lg font-bold text-purple-700 mb-2">SQLを実行する</h2>
        <textarea :value="modelValue" @input="$emit('update:modelValue', ($event.target! as HTMLTextAreaElement).value)"
            rows="5" cols="60" placeholder="ここにSQLを入力"
            class="w-full border border-purple-200 rounded-lg p-3 mb-2 font-mono focus:outline-none focus:ring-2 focus:ring-purple-300 transition bg-indigo-50 text-indigo-900"></textarea>
        <div class="flex gap-2 mb-6">
            <button @click="$emit('execute')"
                class="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold hover:from-indigo-600 hover:to-purple-600 transition shadow">
                実行
            </button>
            <button @click="openPromptModal"
                class="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold hover:from-pink-600 hover:to-purple-600 transition shadow">
                AIに質問
            </button>
        </div>
        <div v-if="showPromptModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                <h3 class="text-lg font-bold mb-2">AIへのプロンプト</h3>
                <select v-model="promptText" class="w-full border rounded p-2 mb-2">
                    <option v-for="option in promptOptions" :key="option" :value="option">{{ option }}</option>
                </select>
                <textarea v-model="promptText" rows="3" class="w-full border rounded p-2 mb-4"></textarea>
                <div class="flex justify-end gap-2">
                    <button @click="showPromptModal = false" class="px-4 py-2 rounded bg-gray-200">キャンセル</button>
                    <button @click="sendPrompt" class="px-4 py-2 rounded bg-purple-500 text-white">送信</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits(['update:modelValue', 'execute', 'ask-ai'])

import { ref } from 'vue'
const showPromptModal = ref(false)
const promptText = ref('私のクエリが正しいか確認して')
const promptOptions = [
    '私のクエリが正しいか確認して',
    'ヒントを教えて',
    'このSQLの改善点を教えて',
    'このクエリの実行結果を説明して',
    'このSQLのパフォーマンスを向上させる方法は？',
    'このSQLの意図を日本語で説明して'
]

function openPromptModal() {
    promptText.value = '私のクエリが正しいか確認して'
    showPromptModal.value = true
}
function sendPrompt() {
    emit('ask-ai', promptText.value)
    showPromptModal.value = false
}
</script>
