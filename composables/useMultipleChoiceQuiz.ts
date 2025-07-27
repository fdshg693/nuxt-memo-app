import { ref } from 'vue'
import multipleChoiceQuestions from '@/data/multipleChoiceQuestions.json'

// Multiple choice question types
interface QuestionReference {
  title: string
  url: string
}

interface MultipleChoiceQuestion {
  id: string
  type: 'multiple-choice'
  category: 'transaction' | 'performance' | 'deadlock'
  subCategory: string
  level: number
  question: string
  choices: string[]
  correct: number
  explanation: string
  tags: string[]
  references: QuestionReference[]
}

export function useMultipleChoiceQuiz() {
  const questions = ref<MultipleChoiceQuestion[]>([])

  async function loadQuestions() {
    const loaded = multipleChoiceQuestions as MultipleChoiceQuestion[]
    // Sort by category, subCategory, then level
    questions.value = loaded.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category)
      if (a.subCategory !== b.subCategory) return a.subCategory.localeCompare(b.subCategory)
      return a.level - b.level
    })
  }

  function getQuestionById(id: string): MultipleChoiceQuestion | undefined {
    return questions.value.find(question => question.id === id)
  }

  function getQuestionsByCategory(category: MultipleChoiceQuestion['category']): MultipleChoiceQuestion[] {
    return questions.value.filter(question => question.category === category)
  }

  function getQuestionsByLevel(level: number): MultipleChoiceQuestion[] {
    return questions.value.filter(question => question.level === level)
  }

  function getQuestionsByTag(tag: string): MultipleChoiceQuestion[] {
    return questions.value.filter(question => question.tags.includes(tag))
  }

  function searchQuestions(searchTerm: string): MultipleChoiceQuestion[] {
    const lowerTerm = searchTerm.toLowerCase()
    return questions.value.filter(question => 
      question.question.toLowerCase().includes(lowerTerm) ||
      question.tags.some(tag => tag.toLowerCase().includes(lowerTerm)) ||
      question.subCategory.toLowerCase().includes(lowerTerm)
    )
  }

  function checkAnswer(questionId: string, selectedIndex: number): {
    isCorrect: boolean
    correctIndex: number
    explanation: string
  } {
    const question = getQuestionById(questionId)
    if (!question) {
      throw new Error(`Question with id "${questionId}" not found`)
    }

    return {
      isCorrect: selectedIndex === question.correct,
      correctIndex: question.correct,
      explanation: question.explanation
    }
  }

  // Group questions for navigation (similar to useSqlQuiz pattern)
  function getGroupedQuestions() {
    const grouped: Record<string, Record<string, MultipleChoiceQuestion[]>> = {}
    
    questions.value.forEach(question => {
      if (!grouped[question.category]) {
        grouped[question.category] = {}
      }
      if (!grouped[question.category][question.subCategory]) {
        grouped[question.category][question.subCategory] = []
      }
      grouped[question.category][question.subCategory].push(question)
    })

    return grouped
  }

  return {
    questions,
    loadQuestions,
    getQuestionById,
    getQuestionsByCategory,
    getQuestionsByLevel,
    getQuestionsByTag,
    searchQuestions,
    checkAnswer,
    getGroupedQuestions
  }
}