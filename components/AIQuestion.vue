<template>
    <div
        class="min-h-[60vh] bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div class="max-w-md w-full bg-white/90 shadow-2xl rounded-2xl p-8 border border-gray-200">
            <h2 class="text-2xl font-extrabold mb-6 text-center text-blue-700 tracking-wide drop-shadow">AIに質問</h2>
            <input v-model="question" type="text" placeholder="質問を入力してください"
                class="border border-gray-300 rounded-xl p-3 w-full mb-5 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all shadow-sm text-lg" />
            <button @click="fetchAIResponse(question)" :disabled="isButtonDisabled"
                class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-xl font-semibold shadow-md hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <span class="inline-flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 17l4 4 4-4m0-5V3" />
                    </svg>
                    質問する
                </span>
            </button>
            <div v-if="response"
                class="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 shadow flex items-start gap-3">
                <span class="text-blue-400 mt-1">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 20h9" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m0 0H3" />
                    </svg>
                </span>
                <div>
                    <h3 class="font-semibold text-blue-700 mb-1">AIの応答:</h3>
                    <p class="text-gray-800 whitespace-pre-line">{{ response }}</p>
                </div>
            </div>
            <div v-if="errorMessage"
                class="mt-8 bg-red-50 border border-red-200 rounded-xl p-5 shadow flex items-start gap-3">
                <span class="text-red-400 mt-1">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                    </svg>
                </span>
                <div>
                    <p class="text-red-700 font-medium">{{ errorMessage }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
//APIのレスポンスを格納する変数
const response = ref<string>('')
//APIのエラーメッセージを格納する変数
const errorMessage = ref<string>('')
//APIを叩く関数
async function fetchAIResponse(prompt: string) {
    const { data: aiResoponse, error } = await useFetch('/api/openai', {
        method: 'POST',
        body: { prompt },
    })
    if (error.value) {
        errorMessage.value = 'AIからの応答に失敗しました。'
        response.value = ''
    } else {
        response.value = aiResoponse.value
        errorMessage.value = ''
    }
}
//質問を格納する変数
const question = ref<string>('')
//質問が空でないかをチェックするcomputedプロパティ
const isQuestionValid = computed(() => {
    return question.value.trim() !== ''
})
//質問が空でない場合にボタンを有効にする
const isButtonDisabled = computed(() => {
    return !isQuestionValid.value
})
//ボタンをクリックしたときに質問を送信する
function handleSubmit() {
    if (isQuestionValid.value) {
        fetchAIResponse(question.value)
    }
}
//質問が送信されたときに入力フィールドをクリアする
watch(question, (newValue) => {
    if (newValue.trim() === '') {
        response.value = ''
        errorMessage.value = ''
    }
})
//コンポーネントがマウントされたときに初期化する
onMounted(() => {
    question.value = ''
    response.value = ''
    errorMessage.value = ''
})
</script>