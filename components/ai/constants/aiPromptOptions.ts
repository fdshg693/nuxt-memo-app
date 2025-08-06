export interface PromptOption {
  display: string
  customPrompt: string
}

export const promptOptions: PromptOption[] = [
  { display: '確認', customPrompt: '私のクエリが正しいか確認して。確認したら、詳細に説明をしてください' },
  { display: 'ヒント', customPrompt: 'ヒントを教えてください。ただし、絶対に答えは教えないでください' },
  { display: '改善', customPrompt: 'このSQLの改善点を教えて。具体的な提案は含めず、関連する情報を提供してください' },
  { display: 'パフォーマンス向上', customPrompt: 'このSQLのパフォーマンスを向上させる方法は？具体的な方法をいくつか教えてください' },
  { display: 'SQL説明', customPrompt: 'このSQLの意図を分かりやすい日本語で説明して' }
]