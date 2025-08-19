<template>
    <div
        class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 min-h-screen flex flex-col items-center justify-start py-8">
        <!-- Loading State -->
        <div v-if="isPageLoading" class="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <div class="flex flex-col items-center justify-center py-16">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                <p class="text-purple-600 font-medium">データを読み込んでいます...</p>
                <p class="text-sm text-gray-500 mt-2">SQL問題とデータベース情報を準備中</p>
            </div>
        </div>

        <!-- Main Content (only shown when fully loaded) -->
        <template v-else>
            <!-- Header and Navigation -->
            <SqlQuestionHeader :current-q-a="currentQA" />
            
            <!-- Main Content -->
            <div id="app" class="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
                <!-- Navigate to Question Generator Button -->
                <div class="mb-4 text-center">
                    <button
                        @click="navigateToGenerator"
                        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        AI問題を生成
                    </button>
                </div>

                <!-- Question Content -->
            <SqlQuestionContent 
                :current-q-a="currentQA"
                :index="currentQuestionIndex"
                :questions-length="questions.length"
                :already-answered="currentQuestionAnswered"
                @prev="prevQuestion"
                @next="nextQuestion"
                @show-explanation="openExplanationModal"
            />

            <!-- AI Assistant -->
            <SqlAiAssistant 
                :ai-answer="aiAnswer"
                :ai-error-display="aiErrorDisplay"
            />

            <!-- SQL Execution Panel (for traditional questions) -->
            <SqlExecutionPanel
                v-if="currentQA.type === 'execution'"
                v-model:sql="sql"
                :is-ai-loading="isAiLoading"
                :show-ai-prompt-modal="showAiPromptModal"
                :user-answer-columns="userAnswerColumns"
                :result="result"
                :sql-error-display="sqlErrorDisplay"
                :is-correct="isCorrect"
                :current-answer="currentQA.answer || ''"
                @execute="executeUserSQL"
                @ask-ai="askAI"
                @check="checkAnswer"
            />

            <!-- SQL Analysis Panel (for performance/transaction/deadlock questions) -->
            <SqlAnalysisPanel
                v-if="currentQA.type === 'analysis'"
                :analysis-code="currentQA.analysisCode || ''"
                :is-ai-loading="isAiLoading"
                :genre="currentQA.genre[0]"
                @ask-ai="askAnalysisAI"
                @submit-answer="submitAnalysisAnswer"
            />
            </div>
        </template>
        
        <!-- Explanation Modal -->
        <SqlExplanationModal 
            :is-visible="showExplanationModal"
            :genre="explanationGenre"
            :question-id="explanationQuestionId"
            @close="closeExplanationModal"
        />
    </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useRoute } from 'vue-router'

import { useSqlQuiz } from '~/composables/useSqlQuiz';
import { useSqlDb } from '~/composables/useSqlDb';
import { useSqlQuestionState } from '~/composables/useSqlQuestionState';
import { useSqlExecution } from '~/composables/useSqlExecution';
import { useAuth } from '~/composables/useAuth';
import { useUserProgress } from '~/composables/useUserProgress';

import SqlQuestionHeader from '~/components/sql/SqlQuestionHeader.vue';
import SqlQuestionContent from '~/components/sql/SqlQuestionContent.vue';
import SqlExecutionPanel from '~/components/sql/SqlExecutionPanel.vue';
import SqlAnalysisPanel from '~/components/sql/SqlAnalysisPanel.vue';
import SqlAiAssistant from '~/components/sql/SqlAiAssistant.vue';
import SqlExplanationModal from '~/components/sql/SqlExplanationModal.vue';
import { useSqlQuizAssistant } from '~/composables/ai/use-sql-quiz-assistant'
import { useSqlAnalysisAssistant } from '~/composables/ai/use-sql-analysis-assistant'

// ===== AI Services =====
const { askSqlQuestion } = useSqlQuizAssistant()
const { analyzeSql } = useSqlAnalysisAssistant()

// ===== Composables =====
const route = useRoute();
const { questions, loadQuestions } = useSqlQuiz();
const { loadDatabases, getDatabaseByName } = useSqlDb();
const { isLoggedIn } = useAuth();
const { recordCorrectAnswer, isQuestionAnsweredCorrectly, loadProgressFromServer } = useUserProgress();
const { 
  index, 
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

// ===== Loading State =====
const isPageLoading = ref(true);
const loadingStates = {
    questions: ref(false),
    databases: ref(false),
    userProgress: ref(false),
    tablesCreated: ref(false)
};

// ===== Explanation Modal State =====
const showExplanationModal = ref(false);
const explanationGenre = ref('');
const explanationQuestionId = ref<number | undefined>(undefined);

// ===== Computed Properties =====
const currentQuestionAnswered = computed(() => {
    if (!isLoggedIn.value) return false;
    const currentQuestion = questions.value.find(q => q.id === index.value);
    return currentQuestion ? isQuestionAnsweredCorrectly(currentQuestion.id) : false;
});

const currentQuestionIndex = computed(() => {
    // Convert 1-based question ID to 0-based array index for navigation
    if (questions.value.length === 0 || index.value === 0) {
        return 0; // Return 0 as default when questions haven't loaded yet
    }
    
    const availableIds = questions.value.map(q => q.id).sort((a, b) => a - b);
    const computedIndex = availableIds.indexOf(index.value);
    return computedIndex >= 0 ? computedIndex : 0;
});

// ===== Utility Functions =====
function setRouteParams() {
    const id = route.params.id;
    if (!id || id === '' || (Array.isArray(id) && id.length === 0)) {
        index.value = 1;
    } else {
        const numId = Array.isArray(id) ? Number(id[0]) : Number(id);
        index.value = isNaN(numId) ? 1 : numId;
    }
}

function setCurrentQA() {
    const idx = index.value;
    if (questions.value.length > 0 && idx > 0) {
        const questionSet = questions.value.find(q => q.id === idx);
        if (questionSet) {
            currentQA.value = {
                id: questionSet.id,
                question: questionSet.question,
                answer: questionSet.answer || '',
                analysisCode: questionSet.analysisCode || '',
                type: questionSet.type || 'execution',
                dbNames: questionSet.DbName.split(','),
                dbs: questionSet.DbName.split(',').map(getDatabaseByName).filter(Boolean),
                genre: Array.isArray(questionSet.genre) ? questionSet.genre : (questionSet.genre ? [questionSet.genre] : []),
                showRecordsSql: questionSet.showRecordsSql || '',
                subgenre: Array.isArray(questionSet.subgenre) ? questionSet.subgenre : (questionSet.subgenre ? [questionSet.subgenre] : []),
            };
            return;
        }
    }
    setNoQuestion();
}

// ===== SQL & AI Functions =====
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
    
    // 正解した場合、ログインしているユーザーの進捗を記録
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

// ===== AI Functions =====
async function askAI(userPrompt: string) {
    isAiLoading.value = true;
    aiErrorDisplay.value = null;
    aiAnswer.value = '';
    
    try {
        // Build database information for context
        let databasesInfo = currentQA.value.dbs.map(db => {
            const rows = db.rows.map((row: any) => JSON.stringify(row)).join('\n');
            return `テーブル名: ${db.name}\nカラム: ${db.columns.join(', ')}\nデータ:\n${rows}`;
        }).join('\n');
        
        // Create a comprehensive prompt with context information
        const contextualPrompt = `問題文: ${currentQA.value.question}
正しいSQLクエリ: ${currentQA.value.answer}
ユーザの入力したSQLクエリ: ${sql.value}
ユーザの質問: ${userPrompt}`;

        // Use the specialized SQL quiz assistant
        const response = await askSqlQuestion(
            contextualPrompt,
            sql.value,
            currentQA.value.question,
            databasesInfo
        );

        if (response.error) {
            aiErrorDisplay.value = response.error;
        } else {
            aiAnswer.value = response.response;
        }
    } catch (error) {
        console.error('Error calling SQL quiz assistant:', error);
        aiErrorDisplay.value = 'AIからの応答に失敗しました。';
    } finally {
        isAiLoading.value = false;
    }
}

function submitAnalysisAnswer(userAnswer: string) {
    // Save the user's analysis answer
    console.log('User analysis submitted:', userAnswer);
    
    // Record progress for analysis questions
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
        
        // Use the specialized SQL analysis assistant
        const response = await analyzeSql(
            userPrompt,
            genre,
            currentQA.value.analysisCode,
            currentQA.value.question
        );

        if (response.error) {
            aiErrorDisplay.value = response.error;
        } else {
            aiAnswer.value = response.response;
        }
    } catch (error) {
        console.error('Error calling SQL analysis assistant:', error);
        aiErrorDisplay.value = 'AIからの応答に失敗しました。';
    } finally {
        isAiLoading.value = false;
    }
}


// ===== Question Generator Functions =====
function navigateToGenerator() {
    navigateTo('/sql/generator');
}

// ===== Navigation Functions =====
function prevQuestion() {
    // Find the previous available question ID
    const currentId = index.value;
    const availableIds = questions.value.map(q => q.id).sort((a, b) => a - b);
    const currentIdx = availableIds.indexOf(currentId);
    
    if (currentIdx > 0) {
        const prevId = availableIds[currentIdx - 1];
        navigateTo(`/sql/${prevId}`);
    }
}
function nextQuestion() {
    // Find the next available question ID
    const currentId = index.value;
    const availableIds = questions.value.map(q => q.id).sort((a, b) => a - b);
    const currentIdx = availableIds.indexOf(currentId);
    
    if (currentIdx !== -1 && currentIdx < availableIds.length - 1) {
        const nextId = availableIds[currentIdx + 1];
        navigateTo(`/sql/${nextId}`);
    }
}

// ===== Explanation Modal Functions =====
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

// ===== Helper Functions =====
function checkAllLoaded() {
    const allLoaded = loadingStates.questions.value && 
                      loadingStates.databases.value && 
                      loadingStates.userProgress.value &&
                      loadingStates.tablesCreated.value;
    
    if (allLoaded) {
        isPageLoading.value = false;
    }
}

// ===== Lifecycle =====
watch([questions, index], async () => {
    if (!isPageLoading.value) {
        setCurrentQA();
        resetSqlAndAi();
        if (currentQA.value.dbs.length > 0) {
            await createUserCopyTables(currentQA.value.dbs);
            await createAnswerCopyTables(currentQA.value.dbs);
        }
    }
});

onMounted(async () => {
    try {
        // Load questions
        await loadQuestions();
        loadingStates.questions.value = true;
        
        // Load databases  
        await loadDatabases();
        loadingStates.databases.value = true;
        
        // Initialize user progress if logged in
        if (isLoggedIn.value) {
            try {
                await loadProgressFromServer();
            } catch (error) {
                console.warn('Failed to load progress in SQL page:', error);
            }
        }
        loadingStates.userProgress.value = true;
        
        // Set up the question
        setRouteParams();
        setCurrentQA();
        
        // Create tables
        if (currentQA.value.dbs.length > 0) {
            await createUserCopyTables(currentQA.value.dbs);
            await createAnswerCopyTables(currentQA.value.dbs);
        }
        loadingStates.tablesCreated.value = true;
        
        // Check if all loading is complete
        checkAllLoaded();
    } catch (error) {
        console.error('Error during page initialization:', error);
        // Still mark as loaded to prevent infinite loading
        isPageLoading.value = false;
    }
});
</script>

<style scoped>
/**** 追加のカスタムスタイル（必要に応じて） ****/
</style>