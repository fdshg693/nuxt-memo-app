import { defineEventHandler, readBody } from 'h3'
import { useSqlQuestionGenerator } from '~/composables/ai/use-sql-question-generator'

export default defineEventHandler(async (event) => {
    const { genre, level, dbName } = await readBody(event)
    const { generateQuestion, getAvailableTableList, isValidTable } = useSqlQuestionGenerator()

    console.log("Generating question for:", { genre, level, dbName })

    // Validate request parameters
    if (!genre || !level) {
        return { error: 'ジャンルとレベルを指定してください。' }
    }

    // Validate database name if provided
    if (dbName && !isValidTable(dbName)) {
        return { 
            error: `指定されたテーブル '${dbName}' が存在しません。`,
            availableTables: getAvailableTableList()
        }
    }

    try {
        // Use the specialized SQL question generator service
        const generatedQuestion = await generateQuestion(genre, level, dbName)
        
        return generatedQuestion
    }
    catch (error) {
        console.error('Error generating SQL question:', error)
        return { error: 'SQL問題の生成に失敗しました。' }
    }
})