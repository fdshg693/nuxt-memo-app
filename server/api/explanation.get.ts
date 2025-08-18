import { defineEventHandler, getQuery } from 'h3'
import { readFileSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { genre } = query

  if (!genre) {
    return { error: 'Genre parameter is required' }
  }

  try {
    // Map genre to explanation file name
    const explanationFileMap: Record<string, string> = {
      'PERFORMANCE': 'performanceExplanation.json',
      'TRANSACTION': 'transactionExplanation.json', 
      'DEADLOCK': 'deadlockExplanation.json',
      'SELECT': 'selectExplanation.json',
      'INSERT': 'insertExplanation.json',
      'UPDATE': 'updateExplanation.json',
      'DELETE': 'deleteExplanation.json',
      'JOIN': 'joinExplanation.json',
      'WHERE': 'whereExplanation.json',
      'GROUP_BY': 'groupbyExplanation.json',
      'ORDER_BY': 'orderbyExplanation.json',
      'COUNT': 'countExplanation.json',
      'SUM': 'sumExplanation.json'
    }
    
    const fileName = explanationFileMap[genre.toString().toUpperCase()]
    if (!fileName) {
      return { 
        error: 'Explanation not found',
        title: `${genre} の解説`,
        description: 'この内容の詳細解説は準備中です。'
      }
    }

    // Read the explanation file
    const filePath = join(process.cwd(), 'data', 'sqlExplanation', fileName)
    const fileContent = readFileSync(filePath, 'utf8')
    const explanationData = JSON.parse(fileContent)

    if (explanationData && explanationData.length > 0) {
      return explanationData[0]
    } else {
      return {
        error: 'Invalid explanation data format',
        title: `${genre} の解説`,
        description: '解説データの読み込みに失敗しました。'
      }
    }
  } catch (error) {
    console.error('Error loading explanation:', error)
    return {
      error: 'Failed to load explanation',
      title: `${genre} の解説`,
      description: '解説の読み込み中にエラーが発生しました。'
    }
  }
})