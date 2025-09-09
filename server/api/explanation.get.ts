import { defineEventHandler, getQuery } from 'h3'

// Explicit static imports (removes all import.meta.glob usage for serverless safety)
import performanceExplanation from '~/data/sqlExplanation/performanceExplanation.json'
import transactionExplanation from '~/data/sqlExplanation/transactionExplanation.json'
import deadlockExplanation from '~/data/sqlExplanation/deadlockExplanation.json'
import selectExplanation from '~/data/sqlExplanation/selectExplanation.json'
import insertExplanation from '~/data/sqlExplanation/insertExplanation.json'
import updateExplanation from '~/data/sqlExplanation/updateExplanation.json'
import deleteExplanation from '~/data/sqlExplanation/deleteExplanation.json'
import joinExplanation from '~/data/sqlExplanation/joinExplanation.json'
import whereExplanation from '~/data/sqlExplanation/whereExplanation.json'
import groupbyExplanation from '~/data/sqlExplanation/groupbyExplanation.json'
import orderbyExplanation from '~/data/sqlExplanation/orderbyExplanation.json'
import countExplanation from '~/data/sqlExplanation/countExplanation.json'
import sumExplanation from '~/data/sqlExplanation/sumExplanation.json'

// Map of UPPER genre key -> first element of corresponding explanation (assuming arrays)
const explanationIndex: Record<string, any> = {
  PERFORMANCE: performanceExplanation?.[0],
  TRANSACTION: transactionExplanation?.[0],
  DEADLOCK: deadlockExplanation?.[0],
  SELECT: selectExplanation?.[0],
  INSERT: insertExplanation?.[0],
  UPDATE: updateExplanation?.[0],
  DELETE: deleteExplanation?.[0],
  JOIN: joinExplanation?.[0],
  WHERE: whereExplanation?.[0],
  GROUP_BY: groupbyExplanation?.[0],
  ORDER_BY: orderbyExplanation?.[0],
  COUNT: countExplanation?.[0],
  SUM: sumExplanation?.[0]
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { genre } = query

  if (!genre) {
    return { error: 'Genre parameter is required' }
  }

  try {
    // Map genre to explanation file name
    const key = genre.toString().toUpperCase()
    const data = explanationIndex[key]
    if (!data) {
      return {
        error: 'Explanation not found',
        title: `${genre} の解説`,
        description: 'この内容の詳細解説は準備中です。'
      }
    }
    return data
  } catch (error) {
    console.error('Error loading explanation:', error)
    return {
      error: 'Failed to load explanation',
      title: `${genre} の解説`,
      description: '解説の読み込み中にエラーが発生しました。'
    }
  }
})