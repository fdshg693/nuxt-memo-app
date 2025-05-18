import { ref } from 'vue'

export function useQuiz() {
    const questions = ref<{ question: string; answer: string; DbName: string }[]>([]) // Array of questions

    async function loadQuestions() {
        // Load questions from an Internal Json file
        const response = await fetch('../api/sqlQuestions')
        questions.value = await response.json()
    }

    return {
        questions,
        loadQuestions
    }
}