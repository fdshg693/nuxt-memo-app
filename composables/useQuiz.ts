import { ref } from 'vue'
import randomQuestions from '@/data/randomQuestions.json'

export interface Question {
  id: number
  question: string
  answer?: string // For backward compatibility
  options?: string[] // For multiple choice questions
  correctAnswer?: number // Index of correct answer in options array
}

export function useQuiz() {
  const questions = ref<Question[]>([])
  const currentIndex = ref(0)
  const userAnswer = ref<string | number | null>(null)
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
      result.value = '回答を選択してください'
      return
    }
    
    const currentQuestion = questions.value[currentIndex.value]
    
    // Multiple choice question
    if (currentQuestion.options && currentQuestion.correctAnswer !== undefined) {
      const correctIndex = currentQuestion.correctAnswer
      if (userAnswer.value === correctIndex) {
        result.value = '正解！'
        correctNumber.value++
      } else {
        const correctAnswerText = currentQuestion.options[correctIndex]
        result.value = `不正解！正解は「${correctAnswerText}」です`
        wrongNumber.value++
      }
    }
    // Legacy text answer question
    else if (currentQuestion.answer) {
      const correct = currentQuestion.answer
      if (userAnswer.value === correct) {
        result.value = '正解！'
        correctNumber.value++
      } else {
        result.value = `不正解！正解は「${correct}」です`
        wrongNumber.value++
      }
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