import { ref } from 'vue'
import randomQuestions from '@/data/randomQuestions.json'

export interface Question {
  id: number
  question: string
  answer: string
}

export function useQuiz() {
  const questions = ref<Question[]>([])
  const currentIndex = ref(0)
  const userAnswer = ref<string | null>(null)
  const result = ref<string | null>(null)
  const correctNumber = ref(0)
  const wrongNumber = ref(0)

  /**
   * JSONファイルから問題をロード
   */
  async function loadQuestions() {
    questions.value = randomQuestions
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
    if (userAnswer.value === correct) {
      result.value = '正解！'
      correctNumber.value++
    } else {
      result.value = `不正解！正解は「${correct}」です`
      wrongNumber.value++
    }
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
    correctNumber,
    wrongNumber,
    loadQuestions,
    checkAnswer,
    nextQuestion,
  }
}