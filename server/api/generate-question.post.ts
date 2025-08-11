import OpenAI from "openai";
import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const { genre, level, dbName } = await readBody(event)
    const config = useRuntimeConfig()

    console.log("Generating question for:", { genre, level, dbName })

    // Validate request parameters
    if (!genre || !level) {
        return { error: 'ジャンルとレベルを指定してください。' }
    }

    try {
        // Check if OpenAI API key is available
        if (!config.openaiApiKey) {
            // Mock response for testing purposes when API key is not available
            const mockQuestion = {
                id: Date.now(), // Temporary ID for generated questions
                level: level,
                genre: genre,
                question: `${genre}に関するレベル${level}の問題です。${dbName ? `${dbName}テーブルを使用して` : ''}適切なSQLクエリを作成してください。`,
                answer: `SELECT * FROM ${dbName || 'table_name'}`,
                DbName: dbName || 'users',
                generated: true // Flag to indicate this is a generated question
            }
            return mockQuestion
        }

        // System prompt for SQL question generation
        const systemPrompt = `あなたはSQL教育の専門家です。
指定されたジャンル、レベル、データベーステーブルに基づいて、適切なSQL学習問題を生成してください。

回答は以下のJSON形式で返してください：
{
  "question": "問題文（日本語）",
  "answer": "正解のSQLクエリ",
  "explanation": "この問題のポイントや学習目標"
}

問題は実践的で教育的価値があり、指定されたレベルに適した難易度にしてください。`

        // Generate prompt based on parameters
        let prompt = `以下の条件でSQL学習問題を生成してください：

ジャンル: ${genre}
レベル: ${level}
データベーステーブル: ${dbName || '適切なテーブル名を選択'}

レベル1: 基本的な単一テーブル操作
レベル2: 条件付きクエリや関数使用
レベル3: 複数テーブルの結合や複雑な条件
レベル4: サブクエリや高度な機能
レベル5: パフォーマンス最適化や複雑なビジネスロジック`

        const client = new OpenAI({
            apiKey: config.openaiApiKey
        });
        
        const response = await client.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.8
        });

        const aiResponse = response.choices[0]?.message?.content || ''
        
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
                DbName: dbName || 'users',
                explanation: parsedResponse.explanation,
                generated: true // Flag to indicate this is a generated question
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
                DbName: dbName || 'users',
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