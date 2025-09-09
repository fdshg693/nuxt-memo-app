import { ref } from 'vue'
import sqlQuestions from '@/data/sqlQuestions.json'

// 質問データ型
export type Questions = {
    id: number
    question: string
    answer?: string
    analysisCode?: string
    type?: 'analysis' | 'execution'
    showRecordsSql?: string
    DbName: string
    genre?: string
    subgenre?: string
    level?: number
    // 追加メタ情報（将来の拡張用）
    difficulty?: string
    estimatedTime?: number
    prerequisites?: string[]
}

export function useSqlQuiz() {
    // 型を拡張してgenre, subgenre, level, analysis typeを含める
    const questions = ref<Array<Questions>>([])

    async function loadQuestions() {
        const loaded: any[] = sqlQuestions as any[]
        // level, genre, subgenreで分類・ソート
        const sorted = loaded.sort((a: any, b: any) => {
            if (a.genre !== b.genre) return (a.genre || '').localeCompare(b.genre || '')
            if ((a.subgenre || '') !== (b.subgenre || '')) return (a.subgenre || '').localeCompare(b.subgenre || '')
            return (a.level || 0) - (b.level || 0)
        })

        // 型安全にQuestions[]へマッピング（外部JSONが厳密型でないため正規化）
        questions.value = sorted.map((q: any) => {
            const normalizedType = (q.type === 'analysis' || q.type === 'execution') ? q.type : undefined
            const mapped: Questions = {
                id: q.id,
                question: q.question,
                answer: q.answer,
                analysisCode: q.analysisCode,
                type: normalizedType,
                showRecordsSql: q.showRecordsSql,
                DbName: q.DbName,
                genre: q.genre,
                subgenre: q.subgenre,
                level: q.level,
                difficulty: q.difficulty,
                estimatedTime: q.estimatedTime,
                prerequisites: q.prerequisites
            }
            return mapped
        })
    }

    return {
        questions,
        loadQuestions
    }
}