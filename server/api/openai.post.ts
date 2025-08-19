import { defineEventHandler, readBody } from 'h3'
import { useSqlExplanationLinks } from '~/composables/useSqlExplanationLinks'
import { useSqlQuizAssistant } from '~/composables/ai/use-sql-quiz-assistant'

/**
 * OpenAI API を使用したSQL学習支援エンドポイント
 * 
 * このエンドポイントは新しいAI専用サービスを使用してSQL関連の質問に回答します。
 * プロンプトインジェクション対策とSQL専門教師としての制約を実装しています。
 * 
 * @route POST /api/openai
 * @body {string} prompt - ユーザーからのプロンプト
 * @body {string} sqlQuery - 分析対象のSQLクエリ（オプション）
 * @body {string} question - 質問内容（オプション）
 * @body {string} userPrompt - ユーザー入力プロンプト（オプション）
 * @returns {string|Object} AI応答テキストまたはエラーオブジェクト
 */
export default defineEventHandler(async (event) => {

    const { prompt, sqlQuery, question, userPrompt } = await readBody(event)

    console.log("prompt:", prompt)
    console.log("userPrompt:", userPrompt)

    try {
        // Use the specialized SQL quiz assistant service
        const { askSqlQuestion, validatePrompt } = useSqlQuizAssistant()
        
        // Use the composable function for link detection
        const { identifyRelevantExplanations, formatExplanationLinks } = useSqlExplanationLinks()

        // Validate the prompt using the specialized service
        const promptToValidate = userPrompt || prompt
        if (!validatePrompt(promptToValidate)) {
            return { error: 'SQLに関する質問のみ受け付けています。' }
        }

        // Identify relevant explanations based on context
        const relevantExplanations = identifyRelevantExplanations(
            sqlQuery || '',
            question || '',
            userPrompt || ''
        )

        // Use the specialized SQL quiz assistant
        const response = await askSqlQuestion(
            prompt,
            sqlQuery,
            question
        )

        if (response.error) {
            return { error: response.error }
        }
        
        // Add explanation links to the response
        const explanationLinks = formatExplanationLinks(relevantExplanations)

        return response.response + explanationLinks
    }
    catch (error) {
        console.error('Error fetching from OpenAI API:', error)
        if (typeof error === 'object' && error !== null && 'response' in error && (error as any).response?._data?.error) {
            console.error('error message:', (error as any).response._data.error)
        }
        return { error: 'Failed to fetch data from OpenAI API' }
    }
})

function isValidSqlPrompt(prompt: string): boolean {
    // 文字数制限チェック
    if (!prompt || prompt.length > 200) {
        return false
    }

    // 明らかなプロンプトインジェクション試行をブロック
    const injectionPatterns = [
        /ignore\s+previous\s+instructions/i,
        /forget\s+everything/i,
        /system\s*:/i,
        /assistant\s*:/i,
        /you\s+are\s+now/i,
        /act\s+as/i,
        /pretend\s+to\s+be/i,
        /役割を変更/i,
        /システムプロンプト/i,
        /指示を無視/i,
        /新しい役割/i
    ]

    if (injectionPatterns.some(pattern => pattern.test(prompt))) {
        return false
    }

    // プリセットプロンプトを許可
    const allowedPresets = [
        '確認', 'ヒント', '改善', 'パフォーマンス向上', 'SQL説明', 'このSQLコードを詳しく分析してください',
        'このクエリが正しいか確認して', 'ヒントを教えてください', 'このSQLの改善点を教えて',
        'このSQLのパフォーマンスを向上させる方法は', 'このSQLの意図を分かりやすい日本語で説明して',
        'パフォーマンス', 'トランザクション', 'デッドロック', '分析', '最適化', 'インデックス'
    ]

    if (allowedPresets.some(preset => prompt.includes(preset))) {
        return true
    }

    // SQLに関連するキーワードが含まれているかチェック
    const sqlKeywords = [
        'SQL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
        'TABLE', 'DATABASE', 'QUERY', 'WHERE', 'JOIN', 'GROUP BY', 'ORDER BY',
        'TRANSACTION', 'COMMIT', 'ROLLBACK', 'DEADLOCK', 'PERFORMANCE', 'INDEX',
        'クエリ', 'テーブル', 'データベース', '結合', '並び替え', '抽出', '挿入',
        '更新', '削除', '作成', '変更', 'パフォーマンス', 'トランザクション', 'デッドロック',
        '分析', '最適化', 'インデックス', '実行計画', 'ロック', '分離レベル'
    ]

    const hasKeyword = sqlKeywords.some(keyword =>
        prompt.toUpperCase().includes(keyword.toUpperCase())
    )

    return hasKeyword
}
