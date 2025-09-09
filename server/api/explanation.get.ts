import { defineEventHandler, getQuery } from 'h3'

// Local type augmentation for Vite's import.meta.glob (if global types not present)
declare interface ImportMeta {
  glob: (pattern: string, options?: { eager?: boolean; import?: string }) => Record<string, any>
}

// Eagerly import all explanation JSON files at build time (no runtime fs)
const explanationModules = import.meta.glob('../../data/sqlExplanation/*Explanation.json', { eager: true, import: 'default' }) as Record<string, any>
// Normalize to a map from filename to JSON content
const explanationDataMap: Record<string, any> = Object.fromEntries(
  Object.entries(explanationModules).map(([path, data]) => {
    const fileName = path.split('/').pop() as string
    return [fileName, data]
  })
)

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

    // Retrieve pre-imported JSON data
    const explanationData = explanationDataMap[fileName]

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