import { ref } from 'vue'
import sqlQuestions from '@/data/sqlQuestions.json'

export function useSqlQuiz() {
    // 型を拡張してgenre, subgenre, level, analysis typeを含める
    const questions = ref<Array<{
        id: number;
        question: string;
        answer?: string;
        analysisCode?: string;
        type?: 'analysis' | 'execution';
        showRecordsSql?: string;
        DbName: string;
        genre?: string;
        subgenre?: string;
        level?: number;
    }>>([])

    async function loadQuestions() {
        const loaded = sqlQuestions
        // level, genre, subgenreで分類・ソート
        questions.value = loaded.sort((a: any, b: any) => {
            if (a.genre !== b.genre) return (a.genre || '').localeCompare(b.genre || '')
            if ((a.subgenre || '') !== (b.subgenre || '')) return (a.subgenre || '').localeCompare(b.subgenre || '')
            return (a.level || 0) - (b.level || 0)
        })
    }

    return {
        questions,
        loadQuestions
    }
}