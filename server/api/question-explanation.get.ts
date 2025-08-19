import { defineEventHandler, getQuery } from 'h3'
import { readFileSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { questionId } = query

  if (!questionId) {
    return { error: 'Question ID parameter is required' }
  }

  try {
    // Read the SQL questions file
    const filePath = join(process.cwd(), 'data', 'sqlQuestions.json')
    const fileContent = readFileSync(filePath, 'utf8')
    const questions = JSON.parse(fileContent)

    // Find the question by ID
    const question = questions.find((q: any) => q.id === parseInt(questionId.toString()))
    
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