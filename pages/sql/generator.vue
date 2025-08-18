<template>
    <div class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 min-h-screen flex flex-col items-center justify-start py-8">
        <!-- Header -->
        <div class="max-w-4xl w-full mx-auto mb-6">
            <div class="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
                <div class="flex items-center justify-between">
                    <h1 class="text-2xl font-bold text-purple-700">🤖 AI SQL問題生成</h1>
                    <button
                        @click="navigateBack"
                        class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        ← 問題一覧に戻る
                    </button>
                </div>
                <p class="text-gray-600 mt-2">
                    AIがカスタマイズされたSQL問題を生成します。こちらで生成された問題の正解は、プロフィールやデータベースに記録されません。
                </p>
            </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-4xl w-full mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Question Generator Panel -->
                <div class="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
                    <SqlQuestionGenerator 
                        @question-generated="handleGeneratedQuestion"
                    />
                </div>

                <!-- Generated Question Display Panel -->
                <div class="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
                    <div v-if="!generatedQuestion" class="text-center py-16">
                        <div class="text-gray-400 text-6xl mb-4">📝</div>
                        <h3 class="text-lg font-semibold text-gray-600 mb-2">問題がまだ生成されていません</h3>
                        <p class="text-gray-500">左側のパネルで条件を選択し、「問題を生成」ボタンをクリックしてください。</p>
                    </div>

                    <div v-else>
                        <div class="mb-4">
                            <span class="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">
                                練習問題（プロフィールに記録されません）
                            </span>
                        </div>

                        <!-- Question Content -->
                        <SqlQuestionContent 
                            :current-q-a="generatedQuestion"
                            :index="1"
                            :questions-length="1"
                            :already-answered="false"
                        />

                        <!-- AI Assistant -->
                        <SqlAiAssistant 
                            :ai-answer="aiAnswer"
                            :ai-error-display="aiErrorDisplay"
                        />

                        <!-- SQL Execution Panel (for traditional questions) -->
                        <SqlExecutionPanel
                            v-if="generatedQuestion.type === 'execution'"
                            v-model:sql="sql"
                            :is-ai-loading="isAiLoading"
                            :show-ai-prompt-modal="showAiPromptModal"
                            :user-answer-columns="userAnswerColumns"
                            :result="result"
                            :sql-error-display="sqlErrorDisplay"
                            :is-correct="isCorrect"
                            :current-answer="generatedQuestion.answer || ''"
                            @execute="executeUserSQL"
                            @ask-ai="askAI"
                            @check="checkAnswer"
                        />

                        <!-- SQL Analysis Panel (for analysis questions) -->
                        <SqlAnalysisPanel
                            v-if="generatedQuestion.type === 'analysis'"
                            :analysis-code="generatedQuestion.analysisCode || ''"
                            :is-ai-loading="isAiLoading"
                            :genre="generatedQuestion.genre[0]"
                            @ask-ai="askAnalysisAI"
                            @submit-answer="submitAnalysisAnswer"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSqlDb } from '~/composables/useSqlDb';
import { useSqlQuestionState } from '~/composables/useSqlQuestionState';
import { useSqlExecution } from '~/composables/useSqlExecution';

import SqlQuestionGenerator from '~/components/sql/SqlQuestionGenerator.vue';
import SqlQuestionContent from '~/components/sql/SqlQuestionContent.vue';
import SqlExecutionPanel from '~/components/sql/SqlExecutionPanel.vue';
import SqlAnalysisPanel from '~/components/sql/SqlAnalysisPanel.vue';
import SqlAiAssistant from '~/components/sql/SqlAiAssistant.vue';

// ===== Composables =====
const { loadDatabases, getDatabaseByName } = useSqlDb();
const { 
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
  resetSqlAndAi,
} = useSqlQuestionState();

const { 
  executeUserSQL: executeUserSQLComposable,
  executeAnswerSQL,
  createUserCopyTables,
  createAnswerCopyTables,
  checkAnswer: checkAnswerComposable
} = useSqlExecution();

// ===== Generator State =====
const generatedQuestion = ref(null);

// ===== Navigation =====
function navigateBack() {
    navigateTo('/sql/1'); // Navigate back to first question
}

// ===== Question Generation =====
function handleGeneratedQuestion(question: any) {
    // Convert generated question to the expected format
    generatedQuestion.value = {
        question: question.question,
        answer: question.answer || '',
        analysisCode: question.analysisCode || '',
        type: question.type || 'execution',
        showRecordsSql: question.showRecordsSql || '',
        dbNames: question.DbName ? question.DbName.split(',') : ['users'],
        dbs: question.DbName ? question.DbName.split(',').map(getDatabaseByName).filter(Boolean) : [getDatabaseByName('users')].filter(Boolean),
        genre: Array.isArray(question.genre) ? question.genre : [question.genre],
        subgenre: Array.isArray(question.subgenre) ? question.subgenre : (question.subgenre ? [question.subgenre] : []),
        generated: true
    };
    
    // Reset states
    resetSqlAndAi();
    isCorrect.value = null;
    
    // Set up database tables for the generated question
    if (generatedQuestion.value.dbs.length > 0) {
        createUserCopyTables(generatedQuestion.value.dbs);
        createAnswerCopyTables(generatedQuestion.value.dbs);
    }
}

// ===== SQL & AI Functions =====
async function executeUserSQL() {
    await executeUserSQLComposable(sql.value, generatedQuestion, result, userAnswerColumns, sqlErrorDisplay);
    isCorrect.value = null;
}

async function checkAnswer() {
    await checkAnswerComposable(
        result,
        correctResult,
        isCorrect,
        () => executeAnswerSQL(generatedQuestion, correctResult)
    );
    
    // Note: We deliberately DO NOT record progress for generated questions
    // This is the key difference from the main SQL page
}

// ===== AI Functions =====
async function askAI(userPrompt: string) {
    isAiLoading.value = true;
    aiErrorDisplay.value = null;
    aiAnswer.value = '';
    
    let databasesInfo = generatedQuestion.value.dbs.map(db => {
        const rows = db.rows.map((row: any) => JSON.stringify(row)).join('\n');
        return `テーブル名: ${db.name}\nカラム: ${db.columns.join(', ')}\nデータ:\n${rows}`;
    }).join('\n');

    let prompt = `\nあなたはSQL学習アシスタントです。\n以下のSQL問題について、学習者の質問に答えてください。\n\n問題文: ${generatedQuestion.value.question}\n正解のSQL: ${generatedQuestion.value.answer}\n\n利用可能なデータベース情報:\n${databasesInfo}\n\n学習者の質問: ${userPrompt}\n学習者の現在のSQL: ${sql.value}\n-----------------\n`;

    const { data: aiResponse, error } = await $fetch('/api/openai', {
        method: 'POST',
        body: { 
            prompt,
            sqlQuery: sql.value,
            question: generatedQuestion.value.question,
            userPrompt
        },
    });
    
    if (error) {
        aiErrorDisplay.value = 'AIからの応答に失敗しました。';
    } else {
        const response = aiResponse;
        if (typeof response === 'string') {
            aiAnswer.value = response;
        } else if (response && typeof response === 'object') {
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

function submitAnalysisAnswer(userAnswer: string) {
    // Save the user's analysis answer (but don't record to profile/DB)
    console.log('User analysis submitted (not recorded):', userAnswer);
    
    // Note: We deliberately DO NOT record progress for generated questions
    
    aiAnswer.value = `✅ あなたの分析が保存されました。\n\n【あなたの回答】\n${userAnswer}\n\n「SQL分析を開始」ボタンをクリックして、AIの分析と比較してみてください。\n\n※ この練習問題の結果はプロフィールに記録されません。`;
}

async function askAnalysisAI(userPrompt: string) {
    isAiLoading.value = true;
    aiErrorDisplay.value = null;
    aiAnswer.value = '';
    
    const genre = generatedQuestion.value.genre[0] || '';
    let prompt = '';
    
    if (genre === 'PERFORMANCE') {
        prompt = `\nあなたはSQLパフォーマンス専門家です。\n以下のSQLクエリのパフォーマンスを詳しく分析してください。\n\n問題文: ${generatedQuestion.value.question}\n分析対象SQL:\n${generatedQuestion.value.analysisCode}\n\n以下の観点から分析してください：\n1. クエリの実行計画の予測\n2. インデックスの活用状況\n3. パフォーマンス問題の特定\n4. 改善案の提案\n5. スケーラビリティの考慮事項\n\nユーザの質問: ${userPrompt}\n-----------------\n`;
    } else if (genre === 'TRANSACTION') {
        prompt = `\nあなたはSQLトランザクション専門家です。\n以下のトランザクションを詳しく分析してください。\n\n問題文: ${generatedQuestion.value.question}\n分析対象SQL:\n${generatedQuestion.value.analysisCode}\n\n以下の観点から分析してください：\n1. トランザクションの分離レベル\n2. 並行性制御の問題\n3. ロック戦略\n4. ACID特性の確保\n5. 潜在的な問題と解決策\n\nユーザの質問: ${userPrompt}\n-----------------\n`;
    } else if (genre === 'DEADLOCK') {
        prompt = `\nあなたはSQLデッドロック専門家です。\n以下のSQLコードのデッドロック可能性を詳しく分析してください。\n\n問題文: ${generatedQuestion.value.question}\n分析対象SQL:\n${generatedQuestion.value.analysisCode}\n\n以下の観点から分析してください：\n1. デッドロック発生の可能性\n2. リソースアクセスの順序\n3. ロック競合のシナリオ\n4. デッドロック回避策\n5. 最適な実装パターン\n\nユーザの質問: ${userPrompt}\n-----------------\n`;
    } else {
        prompt = `\nあなたはSQL専門家です。\n以下のSQLコードを詳しく分析してください。\n\n問題文: ${generatedQuestion.value.question}\n分析対象SQL:\n${generatedQuestion.value.analysisCode}\n\nユーザの質問: ${userPrompt}\n-----------------\n`;
    }
    
    const { data: aiResponse, error } = await $fetch('/api/openai', {
        method: 'POST',
        body: { 
            prompt,
            sqlQuery: generatedQuestion.value.type === 'analysis' ? generatedQuestion.value.analysisCode : sql.value,
            question: generatedQuestion.value.question,
            userPrompt
        },
    });
    
    if (error) {
        aiErrorDisplay.value = 'AIからの応答に失敗しました。';
    } else {
        const response = aiResponse;
        if (typeof response === 'string') {
            aiAnswer.value = response;
        } else if (response && typeof response === 'object') {
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

// ===== Lifecycle =====
onMounted(async () => {
    await loadDatabases();
});
</script>

<style scoped>
/**** Generator page specific styles ****/
</style>