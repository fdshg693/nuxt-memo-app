import { defineEventHandler, readBody } from 'h3'
import { useAI } from '~/composables/useAI'
import { useDatabaseValidation } from '~/composables/useDatabaseValidation'

export default defineEventHandler(async (event) => {
    const { genre, level, dbName } = await readBody(event)
    const { callOpenAIWithMock } = useAI()
    const { 
        validateTable, 
        getAvailableTables, 
        getDatabaseSchemaForPrompt,
        validateGeneratedQuestion 
    } = useDatabaseValidation()

    console.log("Generating question for:", { genre, level, dbName })

    // Validate request parameters
    if (!genre || !level) {
        return { error: 'ジャンルとレベルを指定してください。' }
    }

    // Validate database name if provided
    if (dbName && !validateTable(dbName)) {
        return { 
            error: `指定されたテーブル '${dbName}' が存在しません。`,
            availableTables: getAvailableTables()
        }
    }

    try {
        // System prompt for SQL question generation with database schema awareness
        const systemPrompt = `あなたはSQL教育の専門家です。
指定されたジャンル、レベル、データベーステーブルに基づいて、適切なSQL学習問題を生成してください。

重要な制約:
- 存在するテーブルとカラムのみを使用してください
- 生成するSQLクエリは実際に実行可能なものにしてください
- テーブル名とカラム名は正確に指定してください

${getDatabaseSchemaForPrompt(dbName)}

回答は以下のJSON形式で返してください：
{
  "question": "問題文（日本語）",
  "answer": "正解のSQLクエリ",
  "explanation": "この問題のポイントや学習目標"
}

問題は実践的で教育的価値があり、指定されたレベルに適した難易度にしてください。`

        // Generate prompt based on parameters
        const selectedTable = dbName || getAvailableTables()[0] // Use first available table if none specified
        let prompt = `以下の条件でSQL学習問題を生成してください：

ジャンル: ${genre}
レベル: ${level}
使用テーブル: ${selectedTable}

レベル1: 基本的な単一テーブル操作
レベル2: 条件付きクエリや関数使用
レベル3: 複数テーブルの結合や複雑な条件
レベル4: サブクエリや高度な機能
レベル5: パフォーマンス最適化や複雑なビジネスロジック

必ず指定されたテーブルの実際のカラム名を使用してください。`

        // Mock response for testing purposes when API key is not available
        const mockResponse = JSON.stringify({
            question: `${genre}に関するレベル${level}の問題です。${selectedTable}テーブルを使用して適切なSQLクエリを作成してください。`,
            answer: `SELECT * FROM ${selectedTable}`,
            explanation: `${genre}の基本操作を理解するための問題です。`
        })

        // Call AI service with mock fallback
        const aiResponse = await callOpenAIWithMock(systemPrompt, prompt, mockResponse, 1000)
        
        try {
            // Try to parse JSON response
            const parsedResponse = JSON.parse(aiResponse)
            
            // Create question object with generated content
            const generatedQuestion = {
                id: Date.now(), // Temporary ID for generated questions
                level: level,
                genre: genre,
                question: parsedResponse.question,
                answer: parsedResponse.answer,
                DbName: selectedTable,
                explanation: parsedResponse.explanation,
                generated: true // Flag to indicate this is a generated question
            }

            // Validate the generated question
            const validation = validateGeneratedQuestion(generatedQuestion)
            
            if (!validation.isValid) {
                console.warn('Generated question validation failed:', validation.errors)
                // Return question with validation warnings
                return {
                    ...generatedQuestion,
                    validationWarnings: validation.errors,
                    suggestions: validation.suggestions
                }
            }
            
            return generatedQuestion
        } catch (parseError) {
            // If JSON parsing fails, create a fallback response
            console.error('Failed to parse AI response as JSON:', parseError)
            return {
                id: Date.now(),
                level: level,
                genre: genre,
                question: `${genre}に関するレベル${level}の問題を生成中にエラーが発生しました。`,
                answer: `-- Generated question parsing failed`,
                DbName: selectedTable,
                explanation: 'AIの応答をパースできませんでした。',
                generated: true,
                error: 'AI応答の解析に失敗しました。'
            }
        }
    }
    catch (error) {
        console.error('Error generating SQL question:', error)
        return { error: 'SQL問題の生成に失敗しました。' }
    }
})