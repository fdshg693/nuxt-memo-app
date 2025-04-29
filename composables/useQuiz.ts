import { ref } from 'vue'

export interface Question {
  id: number
  operand1: number
  operand2: number
  operator: '+' | '-' | '*' | '/'
  answer: number
}

export function useQuiz() {
  const questions = ref<Question[]>([])
  const currentIndex = ref(0)
  const userAnswer = ref<number | null>(null)
  const result = ref<string | null>(null)

  /**
   * JSONファイルから問題をロード
   */
  async function loadQuestions() {
    const res = await fetch('/questions.json')
    questions.value = await res.json()
  }

  /**
   * ユーザー回答を判定
   */
  function checkAnswer() {
    if (userAnswer.value === null) {
      result.value = '回答を入力してください'
      return
    }
    const correct = questions.value[currentIndex.value].answer
    result.value =
      userAnswer.value === correct
        ? '正解！'
        : `不正解… 正解は ${correct} です`
  }

  /**
   * 次の問題へ
   */
  function nextQuestion() {
    currentIndex.value =
      (currentIndex.value + 1) % questions.value.length
    userAnswer.value = null
    result.value = null
  }

  return {
    questions,
    currentIndex,
    userAnswer,
    result,
    loadQuestions,
    checkAnswer,
    nextQuestion,
  }
}