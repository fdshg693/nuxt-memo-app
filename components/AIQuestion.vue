<template>
    <div class="bg-gray-100 flex items-center justify-center">
        <div class="max-w-md w-full bg-white shadow-md rounded-lg p-6">
            <h2 class="text-xl font-bold mb-4">AIに質問</h2>
            <input
                v-model="question"
                type="text"
                placeholder="質問を入力してください"
                class="border border-gray-300 rounded-lg p-2 w-full mb-4"
            />
            <button
                @click="fetchAIResponse(question)"
                class="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
                質問する
            </button>
            <div v-if="response" class="mt-4">
                <h3 class="font-semibold">AIの応答:</h3>
                <p>{{ response }}</p>
            </div>
            <div v-if="errorMessage" class="mt-4 text-red-500">
                {{ errorMessage }}
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