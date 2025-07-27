/**
 * Composable for managing SQL explanation links in AI responses
 */

interface ExplanationLink {
  keyword: string
  title: string
  url: string
}

export const useSqlExplanationLinks = () => {
  /**
   * Get available SQL explanation topics
   */
  const getAvailableExplanations = (): ExplanationLink[] => {
    return [
      { keyword: 'select', title: 'SELECT文の解説', url: '/sql/explanation/select' },
      { keyword: 'insert', title: 'INSERT文の解説', url: '/sql/explanation/insert' },
      { keyword: 'update', title: 'UPDATE文の解説', url: '/sql/explanation/update' },
      { keyword: 'delete', title: 'DELETE文の解説', url: '/sql/explanation/delete' },
      { keyword: 'join', title: 'JOIN句の解説', url: '/sql/explanation/join' },
      { keyword: 'where', title: 'WHERE句の解説', url: '/sql/explanation/where' },
      { keyword: 'groupby', title: 'GROUP BY句の解説', url: '/sql/explanation/groupby' },
      { keyword: 'orderby', title: 'ORDER BY句の解説', url: '/sql/explanation/orderby' },
      { keyword: 'count', title: 'COUNT関数の解説', url: '/sql/explanation/count' },
      { keyword: 'sum', title: 'SUM関数の解説', url: '/sql/explanation/sum' }
    ]
  }

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
      const keyword = explanation.keyword.toLowerCase()
      
      // Check for direct keyword matches
      if (allText.includes(keyword)) {
        relevantExplanations.push(explanation)
        return
      }
      
      // Check for specific SQL statement patterns
      switch (keyword) {
        case 'select':
          if (allText.includes('select') || allText.includes('抽出') || allText.includes('取得')) {
            relevantExplanations.push(explanation)
          }
          break
        case 'insert':
          if (allText.includes('insert') || allText.includes('追加') || allText.includes('挿入')) {
            relevantExplanations.push(explanation)
          }
          break
        case 'update':
          if (allText.includes('update') || allText.includes('更新') || allText.includes('変更')) {
            relevantExplanations.push(explanation)
          }
          break
        case 'delete':
          if (allText.includes('delete') || allText.includes('削除')) {
            relevantExplanations.push(explanation)
          }
          break
        case 'join':
          if (allText.includes('join') || allText.includes('結合') || allText.includes('inner') || allText.includes('left')) {
            relevantExplanations.push(explanation)
          }
          break
        case 'where':
          if (allText.includes('where') || allText.includes('条件') || allText.includes('絞り込み')) {
            relevantExplanations.push(explanation)
          }
          break
        case 'groupby':
          if (allText.includes('group by') || allText.includes('group') || allText.includes('グループ') || allText.includes('集計')) {
            relevantExplanations.push(explanation)
          }
          break
        case 'orderby':
          if (allText.includes('order by') || allText.includes('order') || allText.includes('並び替え') || allText.includes('ソート')) {
            relevantExplanations.push(explanation)
          }
          break
        case 'count':
          if (allText.includes('count') || allText.includes('件数') || allText.includes('数える')) {
            relevantExplanations.push(explanation)
          }
          break
        case 'sum':
          if (allText.includes('sum') || allText.includes('合計') || allText.includes('総計')) {
            relevantExplanations.push(explanation)
          }
          break
      }
    })
    
    // Remove duplicates
    return relevantExplanations.filter((explanation, index, self) => 
      index === self.findIndex(e => e.keyword === explanation.keyword)
    )
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