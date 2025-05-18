import { ref } from 'vue'

export function useSqlQuiz() {
    const questions = ref<{ id: number; question: string; answer: string; DbName: string }[]>([]) // Array of questions

    async function loadQuestions() {
        // Load questions from an Internal Json file
        const response = await fetch('/api/sqlQuestions')
        questions.value = await response.json()
    }

    return {
        questions,
        loadQuestions
    }
}