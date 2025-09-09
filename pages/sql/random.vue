<template>
    <div
        class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 min-h-screen flex flex-col items-center justify-start py-8">
        <!-- Loading State -->
        <div v-if="isPageLoading"
            class="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <div class="flex flex-col items-center justify-center py-16">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                <p class="text-purple-600 font-medium">ランダム問題を準備中...</p>
                <p class="text-sm text-gray-500 mt-2">SQL問題とデータベース情報を読み込んでいます</p>
            </div>
        </div>

        <template v-else>
            <SqlQuestionHeader :current-q-a="currentQA" />
            <div class="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
                <!-- Refresh Button -->
                <div class="mb-4 flex gap-2 items-center justify-between">
                    <button @click="refreshQuestion"
                        :disabled="isRefreshing || questions.length === 0 || questions.length === 1"
                        class="px-4 py-2 rounded-lg text-sm font-medium shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="isRefreshing || questions.length <= 1 ? 'bg-gray-400 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'">
                        🔄 他の問題を出題
                    </button>
                    <div class="text-xs text-gray-500" v-if="questions.length === 1">1問のみのため再出題不可</div>
                </div>

                <!-- Question Content without navigation -->
                <SqlQuestionContent :current-q-a="currentQA" :index="0" :questions-length="questions.length"
                    :hide-navigation="true" :already-answered="currentQuestionAnswered"
                    @show-explanation="openExplanationModal" />

                <!-- AI Assistant -->
                <SqlAiAssistant :ai-answer="aiAnswer" :ai-error-display="aiErrorDisplay" />

                <!-- Execution Panel -->
                <SqlExecutionPanel v-if="currentQA.type === 'execution'" v-model:sql="sql" :is-ai-loading="isAiLoading"
                    :show-ai-prompt-modal="showAiPromptModal" :user-answer-columns="userAnswerColumns" :result="result"
                    :sql-error-display="sqlErrorDisplay" :is-correct="isCorrect"
                    :current-answer="currentQA.answer || ''" @execute="executeUserSQL" @ask-ai="askAI"
                    @check="checkAnswer" />

                <!-- Analysis Panel -->
                <SqlAnalysisPanel v-if="currentQA.type === 'analysis'" :analysis-code="currentQA.analysisCode || ''"
                    :is-ai-loading="isAiLoading" :genre="currentQA.genre[0]" @ask-ai="askAnalysisAI"
                    @submit-answer="submitAnalysisAnswer" />
            </div>
        </template>

        <!-- Explanation Modal -->
        <SqlExplanationModal :is-visible="showExplanationModal" :genre="explanationGenre"
            :question-id="explanationQuestionId" @close="closeExplanationModal" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import SqlQuestionHeader from '~/components/sql/SqlQuestionHeader.vue';
import SqlQuestionContent from '~/components/sql/SqlQuestionContent.vue';
import SqlExecutionPanel from '~/components/sql/SqlExecutionPanel.vue';
import SqlAnalysisPanel from '~/components/sql/SqlAnalysisPanel.vue';
import SqlAiAssistant from '~/components/sql/SqlAiAssistant.vue';
import SqlExplanationModal from '~/components/sql/SqlExplanationModal.vue';

import { useSqlQuiz } from '~/composables/useSqlQuiz';
import { useSqlDb } from '~/composables/useSqlDb';
import { useSqlQuestionState } from '~/composables/useSqlQuestionState';
import { useSqlExecution } from '~/composables/useSqlExecution';
import { useAuth } from '~/composables/useAuth';
import { useUserProgress } from '~/composables/useUserProgress';
import { useSqlQuizAssistant } from '~/composables/ai/use-sql-quiz-assistant';
import { useSqlAnalysisAssistant } from '~/composables/ai/use-sql-analysis-assistant';

// AI services
const { askSqlQuestion } = useSqlQuizAssistant();
const { analyzeSql } = useSqlAnalysisAssistant();

// Composables
const { questions, loadQuestions } = useSqlQuiz();
const { loadDatabases, getDatabaseByName } = useSqlDb();
const { isLoggedIn } = useAuth();
const { recordCorrectAnswer, isQuestionAnsweredCorrectly, loadProgressFromServer } = useUserProgress();
const {
    index, // holds current question id
    sql,
    isCorrect,
    aiErrorDisplay,
    aiAnswer,
    isAiLoading,
    sqlErrorDisplay,
    showAiPromptModal,
    userAnswerColumns,
    result,
    correctResult,
    currentQA,
    resetSqlAndAi,
    setNoQuestion
} = useSqlQuestionState();

const {
    executeUserSQL: executeUserSQLComposable,
    executeAnswerSQL,
    createUserCopyTables,
    createAnswerCopyTables,
    checkAnswer: checkAnswerComposable
} = useSqlExecution();

// Loading state
const isPageLoading = ref(true);
const isRefreshing = ref(false);

// Explanation modal state
const showExplanationModal = ref(false);
const explanationGenre = ref('');
const explanationQuestionId = ref<number | undefined>(undefined);

// Computed
const currentQuestionAnswered = computed(() => {
    if (!isLoggedIn.value) return false;
    const currentQuestion = questions.value.find(q => q.id === index.value);
    return currentQuestion ? isQuestionAnsweredCorrectly(currentQuestion.id) : false;
});

// Helpers
function mapQuestionToCurrentQA(question: any) {
    currentQA.value = {
        id: question.id,
        question: question.question,
        answer: question.answer || '',
        analysisCode: question.analysisCode || '',
        type: question.type || 'execution',
        dbNames: question.DbName.split(','),
        dbs: question.DbName.split(',').map(getDatabaseByName).filter(Boolean),
        genre: Array.isArray(question.genre) ? question.genre : (question.genre ? [question.genre] : []),
        showRecordsSql: question.showRecordsSql || '',
        subgenre: Array.isArray(question.subgenre) ? question.subgenre : (question.subgenre ? [question.subgenre] : []),
    } as any;
}

function pickRandomQuestion(excludeId?: number) {
    if (questions.value.length === 0) return null;
    if (questions.value.length === 1) return questions.value[0];
    let candidate;
    do {
        candidate = questions.value[Math.floor(Math.random() * questions.value.length)];
    } while (excludeId && candidate.id === excludeId);
    return candidate;
}

async function setupQuestion(initial = false) {
    const q = pickRandomQuestion(initial ? undefined : index.value || undefined);
    if (!q) { setNoQuestion(); return; }
    mapQuestionToCurrentQA(q);
    index.value = q.id;
    resetSqlAndAi();
    if (currentQA.value.dbs.length > 0) {
        await createUserCopyTables(currentQA.value.dbs);
        await createAnswerCopyTables(currentQA.value.dbs);
    }
}

async function refreshQuestion() {
    if (isRefreshing.value) return;
    isRefreshing.value = true;
    try {
        await setupQuestion();
    } finally {
        isRefreshing.value = false;
    }
}

// SQL Execution & Answer check
async function executeUserSQL() {
    await executeUserSQLComposable(sql.value, currentQA, result, userAnswerColumns, sqlErrorDisplay);
    isCorrect.value = null;
}

async function checkAnswer() {
    await checkAnswerComposable(
        result,
        correctResult,
        isCorrect,
        () => executeAnswerSQL(currentQA, correctResult)
    );
    if (isCorrect.value === true && isLoggedIn.value) {
        const currentQuestion = questions.value.find(q => q.id === index.value);
        if (currentQuestion) {
            await recordCorrectAnswer(
                currentQuestion.id,
                currentQuestion.genre,
                currentQuestion.subgenre,
                currentQuestion.level
            );
        }
    }
}

// AI helpers
async function askAI(userPrompt: string) {
    isAiLoading.value = true;
    aiErrorDisplay.value = null;
    aiAnswer.value = '';
    try {
        let databasesInfo = currentQA.value.dbs.map(db => {
            const rows = db.rows.map((row: any) => JSON.stringify(row)).join('\n');
            return `テーブル名: ${db.name}\nカラム: ${db.columns.join(', ')}\nデータ:\n${rows}`;
        }).join('\n');

        const contextualPrompt = `問題文: ${currentQA.value.question}\n正しいSQLクエリ: ${currentQA.value.answer}\nユーザの入力したSQLクエリ: ${sql.value}\nユーザの質問: ${userPrompt}`;

        const response = await askSqlQuestion(
            contextualPrompt,
            sql.value,
            currentQA.value.question,
            databasesInfo
        );
        if (response.error) aiErrorDisplay.value = response.error; else aiAnswer.value = response.response;
    } catch (e) {
        console.error(e);
        aiErrorDisplay.value = 'AIからの応答に失敗しました。';
    } finally {
        isAiLoading.value = false;
    }
}

function submitAnalysisAnswer(userAnswer: string) {
    console.log('User analysis submitted:', userAnswer);
    if (isLoggedIn.value) {
        const currentQuestion = questions.value.find(q => q.id === index.value);
        if (currentQuestion) {
            recordCorrectAnswer(
                currentQuestion.id,
                currentQuestion.genre,
                currentQuestion.subgenre,
                currentQuestion.level
            );
        }
    }
    aiAnswer.value = `✅ あなたの分析が保存されました。\n\n【あなたの回答】\n${userAnswer}\n\n「SQL分析を開始」ボタンをクリックして、AIの分析と比較してみてください。`;
}

async function askAnalysisAI(userPrompt: string) {
    isAiLoading.value = true;
    aiErrorDisplay.value = null;
    aiAnswer.value = '';
    try {
        const genre = currentQA.value.genre[0] || '';
        const response = await analyzeSql(
            userPrompt,
            genre,
            currentQA.value.analysisCode || '',
            currentQA.value.question
        );
        if (response.error) aiErrorDisplay.value = response.error; else aiAnswer.value = response.response;
    } catch (e) {
        console.error(e);
        aiErrorDisplay.value = 'AIからの応答に失敗しました。';
    } finally {
        isAiLoading.value = false;
    }
}

// Explanation Modal
function openExplanationModal(data: { questionId?: number; genre: string }) {
    explanationGenre.value = data.genre;
    explanationQuestionId.value = data.questionId;
    showExplanationModal.value = true;
}
function closeExplanationModal() {
    showExplanationModal.value = false;
    explanationGenre.value = '';
    explanationQuestionId.value = undefined;
}

// Watch index change to rebuild tables if a new question is set (already handled in setupQuestion but keep parity)
watch(index, async (newVal, oldVal) => {
    if (newVal !== oldVal && currentQA.value.dbs.length > 0) {
        await createUserCopyTables(currentQA.value.dbs);
        await createAnswerCopyTables(currentQA.value.dbs);
    }
});

onMounted(async () => {
    try {
        await loadQuestions();
        await loadDatabases();
        if (isLoggedIn.value) {
            try { await loadProgressFromServer(); } catch (e) { console.warn('Failed to load progress:', e); }
        }
        await setupQuestion(true);
    } catch (e) {
        console.error('Initialization error:', e);
        setNoQuestion();
    } finally {
        isPageLoading.value = false;
    }
});
</script>
