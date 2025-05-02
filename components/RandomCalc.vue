<!-- components/ArithmeticQuiz.vue -->
<template>
    <div class="p-4 max-w-md mx-auto">
        <h2>ランダム計算クイズ</h2>
        <p class="question">{{ questionText }}</p>

        <div class="input-group">
            <input v-model.number="userAnswer" @keyup.enter="checkAnswer" type="number" placeholder="答えを入力" />
            <button @click="checkAnswer" class="bg-blue-500 text-white px-3 py-1 rounded">回答する</button>
        </div>

        <p v-if="feedback" :class="{ 'correct': isCorrect, 'wrong': !isCorrect }">
            {{ feedback }}
        </p>

        <button @click="nextQuestion" class="mt-4 bg-gray-200 px-3 py-1 rounded">
            次の問題
        </button>
        <div class="score">
            <p>正解数: {{ correctNumber }}</p>
            <p>不正解数: {{ wrongNumber }}</p>
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