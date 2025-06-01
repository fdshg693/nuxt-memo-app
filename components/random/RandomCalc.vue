<!-- components/ArithmeticQuiz.vue -->
<template>
    <div
        class="min-h-[60vh] bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6 max-w-lg mx-auto rounded-2xl shadow-2xl border border-gray-100">
        <h2 class="text-2xl font-extrabold mb-6 text-center text-blue-700 tracking-wide drop-shadow">ランダム計算クイズ</h2>
        <p class="question text-lg text-gray-800 mb-4 text-center font-medium">{{ questionText }}</p>

        <div class="flex items-center gap-2 mb-2 justify-center">
            <input v-model.number="userAnswer" @keyup.enter="checkAnswer" type="number" placeholder="答えを入力"
                class="border border-gray-300 rounded-xl px-3 py-2 w-2/3 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm text-base transition-all" />
            <button @click="checkAnswer"
                class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold shadow hover:from-blue-600 hover:to-purple-600 transition-all">
                回答する
            </button>
        </div>

        <div v-if="feedback" class="mt-4 flex justify-center">
            <span :class="isCorrect ? 'text-green-600 font-bold text-lg' : 'text-red-600 font-bold text-lg'">
                {{ feedback }}
            </span>
        </div>

        <button @click="nextQuestion"
            class="mt-6 w-full bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl font-medium shadow transition-all border border-gray-200">
            次の問題
        </button>
        <div class="flex justify-between mt-6 px-2">
            <p class="text-green-700 font-semibold">正解数: <span class="font-bold">{{ correctNumber }}</span></p>
            <p class="text-red-700 font-semibold">不正解数: <span class="font-bold">{{ wrongNumber }}</span></p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const operand1 = ref<number>(0)
const operand2 = ref<number>(0)
const operator = ref<'+' | '-' | '×' | '÷'>('+')
const userAnswer = ref<number | null>(null)
const feedback = ref<string>('')
const isCorrect = ref<boolean>(false)
const correctNumber = ref<number>(0)
const wrongNumber = ref<number>(0)

// 出題用に利用可能な演算子
const operators = ['+', '-', '×', '÷'] as const

// 問題文表示用
const questionText = computed(() => {
    return `${operand1.value} ${operator.value} ${operand2.value} = ?`
})

// 新しい問題を生成
function generateQuestion(): void {
    // 1〜20 の整数をランダムに生成
    operand1.value = Math.floor(Math.random() * 20) + 1
    operand2.value = Math.floor(Math.random() * 20) + 1
    operator.value = operators[Math.floor(Math.random() * operators.length)]
    // 割り算のときは、きれいに割り切れる組み合わせに
    if (operator.value === '÷') {
        // operand1 を operand2 で割り切れるように設定
        operand2.value = Math.floor(Math.random() * 10) + 1
        operand1.value = operand2.value * (Math.floor(Math.random() * 10) + 1)
    }
    // 初期化漏れしていた箇所をリセット
    userAnswer.value = null
    feedback.value = ''
    isCorrect.value = false
}
// 回答の正誤をチェック
function checkAnswer() {
    let correctAnswer: number = 0

    switch (operator.value) {
        case '+':
            correctAnswer = operand1.value + operand2.value
            break
        case '-':
            correctAnswer = operand1.value - operand2.value
            break
        case '×':
            correctAnswer = operand1.value * operand2.value
            break
        case '÷':
            correctAnswer = operand1.value / operand2.value
            break
    }

    if (userAnswer.value === correctAnswer) {
        feedback.value = '正解！🎉'
        isCorrect.value = true
        correctNumber.value++
    } else {
        feedback.value = `不正解… 正しい答えは ${correctAnswer} です。`
        isCorrect.value = false
        wrongNumber.value++
    }
}

// 次の問題へ
function nextQuestion(): void {
    generateQuestion()
}

// 初回出題
onMounted(generateQuestion)
</script>