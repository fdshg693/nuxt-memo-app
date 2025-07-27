// server/api/generate-question.post.ts
// GENERATE-001: AI-powered SQL question generation API
import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import sqlDatabases from '@/data/sqlDatabases.json'

// Input validation schema
const QuestionGenerateRequestSchema = z.object({
  databaseName: z.string().min(1, 'Database name is required'),
  difficulty: z.number().int().min(1).max(5),
  sqlTypes: z.array(z.enum(['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'JOIN', 'GROUP BY', 'ORDER BY', 'WHERE'])),
  questionCount: z.number().int().min(1).max(10).default(1),
  options: z.object({
    includeExplanation: z.boolean().default(true),
    language: z.enum(['ja', 'en']).default('ja'),
    generateTestData: z.boolean().default(false),
  }).optional(),
})

type QuestionGenerateRequest = z.infer<typeof QuestionGenerateRequestSchema>

interface GeneratedQuestion {
  question: string
  answer: string
  explanation: string
  difficulty: number
  DbName: string
  genre: string
  level: number
}

interface QuestionGenerateResponse {
  success: boolean
  questions: GeneratedQuestion[]
  error?: string
  metadata?: {
    databaseInfo: any
    generationTime: number
    model: string
  }
}

export default defineEventHandler(async (event): Promise<QuestionGenerateResponse> => {
  const startTime = Date.now()
  
  try {
    // Parse and validate request
    const rawBody = await readBody(event)
    const body = QuestionGenerateRequestSchema.parse(rawBody)
    
    const config = useRuntimeConfig()
    
    if (!config.openaiApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'OpenAI API key not configured'
      })
    }

    // Find target database
    const database = findDatabaseByName(body.databaseName)
    if (!database) {
      throw createError({
        statusCode: 404,
        statusMessage: `Database '${body.databaseName}' not found`
      })
    }

    // Analyze database structure
    const databaseAnalysis = analyzeDatabaseStructure(database)
    
    // Generate questions using OpenAI
    const questions = await generateQuestionsWithAI(body, database, databaseAnalysis, config)
    
    const generationTime = Date.now() - startTime
    
    return {
      success: true,
      questions,
      metadata: {
        databaseInfo: {
          name: database.name,
          tables: databaseAnalysis.tableCount,
          columns: databaseAnalysis.totalColumns,
          rows: databaseAnalysis.totalRows,
        },
        generationTime,
        model: 'gpt-4o-mini'
      }
    }
    
  } catch (error) {
    console.error('Error generating questions:', error)
    
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request format',
        data: error.errors
      })
    }
    
    if (error.statusCode) {
      throw error
    }
    
    return {
      success: false,
      questions: [],
      error: '問題生成中にエラーが発生しました。'
    }
  }
})

function findDatabaseByName(name: string): any | null {
  return sqlDatabases.find(db => db.name === name) || null
}

function analyzeDatabaseStructure(database: any) {
  const analysis = {
    tableCount: 1, // Single table in current structure
    totalColumns: database.columns?.length || 0,
    totalRows: database.rows?.length || 0,
    columnDetails: database.columns || [],
    sampleData: database.rows?.slice(0, 3) || [], // First 3 rows for context
    dataTypes: inferDataTypes(database),
  }
  
  return analysis
}

function inferDataTypes(database: any) {
  if (!database.rows || database.rows.length === 0) return {}
  
  const types: { [key: string]: string } = {}
  const firstRow = database.rows[0]
  
  for (const column of database.columns || []) {
    const value = firstRow[column]
    if (typeof value === 'number') {
      types[column] = Number.isInteger(value) ? 'INTEGER' : 'DECIMAL'
    } else if (typeof value === 'string') {
      types[column] = 'VARCHAR'
    } else if (value instanceof Date) {
      types[column] = 'DATE'
    } else {
      types[column] = 'TEXT'
    }
  }
  
  return types
}

async function generateQuestionsWithAI(
  request: QuestionGenerateRequest, 
  database: any, 
  analysis: any, 
  config: any
): Promise<GeneratedQuestion[]> {
  
  const prompt = buildQuestionGenerationPrompt(request, database, analysis)
  
  console.log("Question generation prompt:", prompt)
  
  const response: any = await $fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'あなたはSQL学習問題を生成するAIです。指定された条件に基づいて、教育的で実践的なSQL問題を作成してください。回答は指定されたJSON形式で返してください。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.7, // Higher creativity for question generation
    }
  })

  const rawResponse = response.choices[0].message.content
  
  // Parse the JSON response
  try {
    const parsedQuestions = parseGeneratedQuestions(rawResponse, request)
    return parsedQuestions
  } catch (parseError) {
    console.error('Failed to parse generated questions:', parseError)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to parse generated questions'
    })
  }
}

function buildQuestionGenerationPrompt(request: QuestionGenerateRequest, database: any, analysis: any): string {
  const { databaseName, difficulty, sqlTypes, questionCount, options } = request
  
  let prompt = `【問題生成依頼】\n`
  prompt += `以下の条件でSQL学習問題を${questionCount}問生成してください:\n\n`
  
  prompt += `【データベース情報】\n`
  prompt += `- テーブル名: ${databaseName}\n`
  prompt += `- カラム: ${database.columns.join(', ')}\n`
  prompt += `- データ型: ${Object.entries(analysis.dataTypes).map(([col, type]) => `${col}(${type})`).join(', ')}\n`
  prompt += `- サンプルデータ:\n`
  
  // Show sample data
  analysis.sampleData.forEach((row: any, index: number) => {
    const rowData = database.columns.map((col: string) => `${col}: ${row[col]}`).join(', ')
    prompt += `  ${index + 1}. {${rowData}}\n`
  })
  
  prompt += `\n【生成条件】\n`
  prompt += `- 難易度: ${difficulty}/5 (1=初級, 5=上級)\n`
  prompt += `- 対象SQL種別: ${sqlTypes.join(', ')}\n`
  prompt += `- 問題数: ${questionCount}問\n`
  
  if (options?.includeExplanation) {
    prompt += `- 解説も含める\n`
  }
  
  prompt += `\n【出力形式】\n`
  prompt += `以下のJSON配列形式で出力してください:\n`
  prompt += `[\n`
  prompt += `  {\n`
  prompt += `    "question": "問題文（日本語で具体的に）",\n`
  prompt += `    "answer": "正解のSQL文",\n`
  prompt += `    "explanation": "解説（なぜその答えになるかの説明）",\n`
  prompt += `    "difficulty": ${difficulty},\n`
  prompt += `    "DbName": "${databaseName}",\n`
  prompt += `    "genre": "対象のSQL種別（SELECT、INSERT等）",\n`
  prompt += `    "level": ${difficulty}\n`
  prompt += `  }\n`
  prompt += `]\n\n`
  
  // Add difficulty-specific guidance
  prompt += getDifficultyGuidance(difficulty)
  
  return prompt
}

function getDifficultyGuidance(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return `【レベル1のガイドライン】\n- 基本的なSELECT、INSERT、UPDATE、DELETEの単純な操作\n- WHERE句は1つの条件のみ\n- JOINは使用しない\n`
    case 2:
      return `【レベル2のガイドライン】\n- 複数条件のWHERE句（AND、OR）\n- ORDER BY、GROUP BYの基本的な使用\n- 集計関数（COUNT、SUM等）の基本的な使用\n`
    case 3:
      return `【レベル3のガイドライン】\n- 内部結合（INNER JOIN）の使用\n- GROUP BY + HAVING句\n- サブクエリの基本的な使用\n`
    case 4:
      return `【レベル4のガイドライン】\n- 外部結合（LEFT/RIGHT JOIN）\n- 複雑なサブクエリ\n- ウィンドウ関数の基本的な使用\n`
    case 5:
      return `【レベル5のガイドライン】\n- 複雑な結合とサブクエリの組み合わせ\n- 高度なウィンドウ関数\n- CTEや再帰クエリ\n`
    default:
      return ''
  }
}

function parseGeneratedQuestions(rawResponse: string, request: QuestionGenerateRequest): GeneratedQuestion[] {
  // Try to extract JSON from the response
  const jsonMatch = rawResponse.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    throw new Error('No valid JSON array found in response')
  }
  
  const jsonStr = jsonMatch[0]
  const questions = JSON.parse(jsonStr)
  
  // Validate and normalize questions
  return questions.map((q: any, index: number) => ({
    question: q.question || `生成された問題 ${index + 1}`,
    answer: q.answer || 'SELECT * FROM ' + request.databaseName,
    explanation: q.explanation || '解説が生成されませんでした。',
    difficulty: q.difficulty || request.difficulty,
    DbName: q.DbName || request.databaseName,
    genre: q.genre || request.sqlTypes[0] || 'SELECT',
    level: q.level || request.difficulty,
  }))
}