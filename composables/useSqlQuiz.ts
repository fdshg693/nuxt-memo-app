// how this file is used
// const { questions, currentIndex, loadQuestions } = useQuiz();
//const currentQuestion = ref(questions[index.value]);
//const currentAnswer = ref(questions[index.value].answer);

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