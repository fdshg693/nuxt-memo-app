/**
 * Composable for managing SQL explanation links in AI responses
 */
import type { ExplanationLink } from '~/composables/data/sqlExplanationData'
import { getAvailableExplanations } from '~/composables/data/sqlExplanationData'
import { matchSqlKeyword } from '~/composables/utils/sqlKeywordMatcher'

export const useSqlExplanationLinks = () => {
  /**
   * Identify relevant explanations based on SQL content and question context
   */
  const identifyRelevantExplanations = (
    sqlQuery: string,
    question: string,
    userPrompt: string
  ): ExplanationLink[] => {
    const explanations = getAvailableExplanations()
    const relevantExplanations: ExplanationLink[] = []

    // Combine all text to analyze
    const allText = `${sqlQuery} ${question} ${userPrompt}`.toLowerCase()

    // Check for each explanation keyword
    explanations.forEach(explanation => {
      if (matchSqlKeyword(allText, explanation.keyword)) {
        relevantExplanations.push(explanation)
      }
    })

    // Remove duplicates using a Map for better performance
    const uniqueExplanationsMap = new Map<string, ExplanationLink>()
    relevantExplanations.forEach(explanation => {
      uniqueExplanationsMap.set(explanation.keyword, explanation)
    })
    return Array.from(uniqueExplanationsMap.values())
  }

  /**
   * Format explanation links for AI response
   */
  const formatExplanationLinks = (explanations: ExplanationLink[]): string => {
    if (explanations.length === 0) {
      return ''
    }

    const linkText = explanations
      .map(exp => `[${exp.title}](${exp.url})`)
      .join('、')

    return `\n\n関連する解説ページ: ${linkText}`
  }

  return {
    getAvailableExplanations,
    identifyRelevantExplanations,
    formatExplanationLinks
  }
}
