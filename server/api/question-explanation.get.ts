import { defineEventHandler, getQuery } from 'h3'

// Type augmentation (local) for Vite's import.meta.glob in case global types not picked up.
declare interface ImportMeta {
  glob: (pattern: string, options?: { eager?: boolean; import?: string }) => Record<string, any>
}

// Eagerly import the questions JSON at build time for Vercel/serverless compatibility.
// This removes runtime fs/path usage (process.cwd()) which can fail in edge/serverless.
// Nuxt/Vite will include the JSON in the bundle; no dynamic I/O at runtime.
const questionsModules = import.meta.glob('../../data/sqlQuestions.json', { eager: true, import: 'default' }) as Record<string, any>
// There should only be one match; grab its default export (array of questions)
const questionsData: any[] = Object.values(questionsModules)[0] || []

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { questionId } = query

  if (!questionId) {
    return { error: 'Question ID parameter is required' }
  }

  try {
    // Find the question by ID from the eagerly imported data
    const question = questionsData.find((q: any) => q.id === parseInt(questionId.toString()))

    if (!question) {
      return {
        error: 'Question not found',
        title: `問題 ${questionId} の解説`,
        description: '指定された問題が見つかりません。'
      }
    }

    // Check if the question has a custom explanation
    if (question.explanation) {
      return {
        title: `問題 ${questionId}: ${question.question}`,
        description: question.explanation,
        questionId: question.id,
        genre: question.genre,
        answer: question.answer,
        hasCustomExplanation: true
      }
    } else {
      // Fallback to indicate no custom explanation is available
      return {
        title: `問題 ${questionId}: ${question.question}`,
        description: 'この問題には個別の解説がまだ用意されていません。ジャンル別の解説をご参照ください。',
        questionId: question.id,
        genre: question.genre,
        answer: question.answer,
        hasCustomExplanation: false
      }
    }
  } catch (error) {
    console.error('Error loading question explanation:', error)
    return {
      error: 'Failed to load question explanation',
      title: `問題 ${questionId} の解説`,
      description: '問題解説の読み込み中にエラーが発生しました。'
    }
  }
})