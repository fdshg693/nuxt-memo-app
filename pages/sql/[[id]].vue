<template>
    <div
        class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 min-h-screen flex flex-col items-center justify-start py-8">
        <!-- Header and Navigation -->
        <SqlQuestionHeader :current-q-a="currentQA" />
        
        <!-- Main Content -->
        <div id="app" class="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <!-- Question Content -->
            <SqlQuestionContent 
                :current-q-a="currentQA"
                :index="index"
                :questions-length="questions.length"
                :already-answered="currentQuestionAnswered"
                @prev="prevQuestion"
                @next="nextQuestion"
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

// ===== Composables =====
const route = useRoute();
const { questions, loadQuestions } = useSqlQuiz();
const { loadDatabases, getDatabaseByName } = useSqlDb();
const { isLoggedIn } = useAuth();
const { recordCorrectAnswer, isQuestionAnsweredCorrectly } = useUserProgress();
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

// ===== Computed Properties =====
const currentQuestionAnswered = computed(() => {
    if (!isLoggedIn.value) return false;
    const currentQuestion = questions.value.find(q => q.id === index.value);
    return currentQuestion ? isQuestionAnsweredCorrectly(currentQuestion.id) : false;
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
    if (questions.value.length > 0 && idx >= 0 && idx < questions.value.length) {
        const questionSet = questions.value.find(q => q.id === idx);
        if (questionSet) {
            currentQA.value = {
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
    checkAnswerComposable(
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
    let databasesInfo = currentQA.value.dbs.map(db => {
        const rows = db.rows.map((row: any) => JSON.stringify(row)).join('\n');
        return `テーブル名: ${db.name}\nカラム: ${db.columns.join(', ')}\nデータ:\n${rows}`;
    }).join('\n');
    const prompt = `\nあなたはSQL教師です。\nSQLクエリと問題文が与えられます。\nあなたの役割は、SQLに関するユーザの質問に答えることです。\n-----------------            \n問題文: ${currentQA.value.question}\n正しいSQLクエリ: ${currentQA.value.answer}\nデータベースの情報:\n${databasesInfo}\nユーザの質問: ${userPrompt}\nユーザの入力したSQLクエリ: ${sql.value}\n-----------------\n`;
    await callOpenAI(prompt, userPrompt);
}

function submitAnalysisAnswer(userAnswer: string) {
    // Save the user's analysis answer
    console.log('User analysis submitted:', userAnswer);
    // You could save this to localStorage or show a confirmation message
    // For now, we'll just show a simple alert to confirm the answer was saved
    aiAnswer.value = `✅ あなたの分析が保存されました。\n\n【あなたの回答】\n${userAnswer}\n\n「SQL分析を開始」ボタンをクリックして、AIの分析と比較してみてください。`;
}

async function askAnalysisAI(userPrompt: string) {
    isAiLoading.value = true;
    aiErrorDisplay.value = null;
    aiAnswer.value = '';
    
    const genre = currentQA.value.genre[0] || '';
    let prompt = '';
    
    if (genre === 'PERFORMANCE') {
        prompt = `\nあなたはSQLパフォーマンス専門家です。\n以下のSQLクエリのパフォーマンスを詳しく分析してください。\n\n問題文: ${currentQA.value.question}\n分析対象SQL:\n${currentQA.value.analysisCode}\n\n以下の観点から分析してください：\n1. クエリの実行計画の予測\n2. インデックスの活用状況\n3. パフォーマンス問題の特定\n4. 改善案の提案\n5. スケーラビリティの考慮事項\n\nユーザの質問: ${userPrompt}\n-----------------\n`;
    } else if (genre === 'TRANSACTION') {
        prompt = `\nあなたはSQLトランザクション専門家です。\n以下のトランザクションを詳しく分析してください。\n\n問題文: ${currentQA.value.question}\n分析対象SQL:\n${currentQA.value.analysisCode}\n\n以下の観点から分析してください：\n1. トランザクションの分離レベル\n2. 並行性制御の問題\n3. ロック戦略\n4. ACID特性の確保\n5. 潜在的な問題と解決策\n\nユーザの質問: ${userPrompt}\n-----------------\n`;
    } else if (genre === 'DEADLOCK') {
        prompt = `\nあなたはSQLデッドロック専門家です。\n以下のSQLコードのデッドロック可能性を詳しく分析してください。\n\n問題文: ${currentQA.value.question}\n分析対象SQL:\n${currentQA.value.analysisCode}\n\n以下の観点から分析してください：\n1. デッドロック発生の可能性\n2. リソースアクセスの順序\n3. ロック競合のシナリオ\n4. デッドロック回避策\n5. 最適な実装パターン\n\nユーザの質問: ${userPrompt}\n-----------------\n`;
    } else {
        prompt = `\nあなたはSQL専門家です。\n以下のSQLコードを詳しく分析してください。\n\n問題文: ${currentQA.value.question}\n分析対象SQL:\n${currentQA.value.analysisCode}\n\nユーザの質問: ${userPrompt}\n-----------------\n`;
    }
    
    await callOpenAI(prompt, userPrompt);
}

async function callOpenAI(prompt: string, userPrompt: string) {
    const { data: aiResponse, error } = await useFetch('/api/openai', {
        method: 'POST',
        body: { 
            prompt,
            sqlQuery: currentQA.value.type === 'analysis' ? currentQA.value.analysisCode : sql.value,
            question: currentQA.value.question,
            userPrompt
        },
    });
    if (error.value) {
        aiErrorDisplay.value = 'AIからの応答に失敗しました。';
    } else {
        // Handle the response properly
        const response = aiResponse.value;
        if (typeof response === 'string') {
            aiAnswer.value = response;
        } else if (response && typeof response === 'object') {
            // Handle error objects or other non-string responses
            if (response.error) {
                aiErrorDisplay.value = response.error;
            } else {
                aiAnswer.value = JSON.stringify(response);
            }
        } else {
            aiAnswer.value = 'AIからの応答に失敗しました。';
        }
    }
    isAiLoading.value = false;
}

// ===== Navigation Functions =====
function prevQuestion() {
    if (index.value > 0) {
        index.value--;
        setCurrentQA();
        isCorrect.value = null;
    }
}
function nextQuestion() {
    if (index.value < questions.value.length - 1) {
        index.value++;
        setCurrentQA();
        isCorrect.value = null;
    }
}

// ===== Lifecycle =====
watch([questions, index], async () => {
    setCurrentQA();
    resetSqlAndAi();
    if (currentQA.value.dbs.length > 0) {
        await createUserCopyTables(currentQA.value.dbs);
        await createAnswerCopyTables(currentQA.value.dbs);
    }
});

onMounted(async () => {
    await loadQuestions();
    await loadDatabases();
    setRouteParams();
    setCurrentQA();
    await createUserCopyTables(currentQA.value.dbs);
    await createAnswerCopyTables(currentQA.value.dbs);
});
</script>

<style scoped>
/**** 追加のカスタムスタイル（必要に応じて） ****/
</style>