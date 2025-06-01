<template>
    <div
        class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 min-h-screen flex flex-col items-center justify-start py-8">
        <NuxtLink to="/" class="btn-gradient">トップ</NuxtLink>
        <NuxtLink to="/sql/explanation" class="btn-gradient">SQL解説</NuxtLink>
        <p>関連するジャンルのSQL解説</p>
        <div v-if="currentQA.genre && currentQA.genre.length" class="flex flex-wrap justify-center gap-4 mt-4">
            <NuxtLink v-for="genre in currentQA.genre" :key="genre" :to="`/sql/explanation/${genre}`"
                class="btn-gradient">{{ genre }}解説</NuxtLink>
        </div>

        <h1
            class="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            SQLの問題</h1>
        <div id="app" class="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <div v-if="currentQA.question" class="mb-4">
                <h2 class="text-xl font-bold text-indigo-700 mb-2">{{ currentQA.question }}</h2>
            </div>
            <QuestionNavigation :index="index" :questions-length="questions.length" @prev="prevQuestion"
                @next="nextQuestion" />
            <div class="flex flex-row flex-wrap gap-4 mb-4">
                <div v-if="currentQA.dbs.length === 0" class="text-gray-500 text-sm">データベースが見つかりません</div>
                <div v-else class="text-gray-500 text-sm">
                    <div v-for="db in currentQA.dbs" :key="db.name" class="flex-1 min-w-[250px]">
                        <DatabaseTable :db="db" />
                    </div>
                </div>
            </div>
            <div @click="createUserCopyTables"
                class="text-sm text-gray-500 cursor-pointer mb-4 flex items-center justify-around">
                データベースをリセット
            </div>

            <SqlEditor v-model="sql" @execute="executeUserSQL" @ask-ai="askAI" :is-ai-loading="isAiLoading" />

            <div v-if="aiAnswer || aiErrorDisplay" class="mb-4">
                <div v-if="aiAnswer"
                    class="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-400 text-indigo-800 p-3 rounded mb-2">
                    <span class="font-semibold">AIの回答:</span> {{ aiAnswer }}
                </div>
                <div v-if="aiErrorDisplay" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 rounded">
                    {{ aiErrorDisplay }}
                </div>
            </div>

            <ResultTable :columns="userAnswerColumns" :result="result" />
            <div v-if="sqlErrorDisplay" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 rounded">
                {{ sqlErrorDisplay }}
            </div>

            <AnswerCheck :is-correct="isCorrect" :current-answer="currentQA.answer" @check="checkAnswer" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, toRaw } from 'vue';
import { useRoute } from 'vue-router'
import isEqual from 'lodash/isEqual';
import { useNuxtApp } from '#app';

import { useSqlQuiz } from '~/composables/useSqlQuiz';
import { useSqlDb } from '~/composables/useSqlDb';
import { useSqlTableUtils } from '~/composables/useSqlTableUtils';

import QuestionNavigation from '~/components/QuestionNavigation.vue';
import DatabaseTable from '~/components/DatabaseTable.vue';
import SqlEditor from '~/components/SqlEditor.vue';
import ResultTable from '~/components/ResultTable.vue';
import AnswerCheck from '~/components/AnswerCheck.vue';

// 型定義
defineProps();

interface Table {
    name: string;
    columns: string[];
    rows: Record<string, any>[];
}

// ===== Composables & Nuxt App =====
const route = useRoute();
const nuxt = useNuxtApp();
const $alasql = nuxt.$alasql as typeof import('alasql');
const { questions, loadQuestions } = useSqlQuiz();
const { loadDatabases, getDatabaseByName } = useSqlDb();

// ===== State =====
// ルーティング・インデックス
const index = ref(1);

// SQL・AI・判定関連
const sql = ref('');
const isCorrect = ref<boolean | null>(null);
const aiErrorDisplay = ref<string | null>(null);
const aiAnswer = ref<string>('');
const isAiLoading = ref(false);
const sqlErrorDisplay = ref<string | null>(null);

// 結果・カラム
const userAnswerColumns = ref<string[]>([]);
const result = ref<Record<string, any>[]>([]);
const correctResult = ref<Record<string, any>[]>([]);

// 現在のQA・DB情報
const currentQA = ref({
    question: '',
    answer: '',
    showRecordsSql: '',
    dbNames: [] as string[],
    dbs: [] as Table[],
    genre: [] as string[],
});

// ===== DBユーティリティ =====
const { createCopyTables, executeSQLWithTablePostfix } = useSqlTableUtils($alasql);

// ===== Utility Functions =====
function setRouteParams() {
    const id = route.params.id;
    index.value = id == '' ? 1 : Number(id);
}

function resetSqlAndAi() {
    sql.value = '';
    aiErrorDisplay.value = null;
    aiAnswer.value = '';
    isAiLoading.value = false;
    isCorrect.value = null;
    userAnswerColumns.value = [];
    result.value = [];
    correctResult.value = [];
}

function setNoQuestion() {
    currentQA.value = {
        question: '問題が見つかりません',
        answer: '',
        dbNames: [],
        dbs: [],
        genre: [],
        showRecordsSql: '',
    };
}

function setCurrentQA() {
    const idx = index.value;
    if (questions.value.length > 0 && idx >= 0 && idx < questions.value.length) {
        const questionSet = questions.value.find(q => q.id === idx);
        if (questionSet) {
            currentQA.value = {
                question: questionSet.question,
                answer: questionSet.answer,
                dbNames: questionSet.DbName.split(','),
                dbs: questionSet.DbName.split(',').map(getDatabaseByName).filter(Boolean),
                genre: Array.isArray(questionSet.genre) ? questionSet.genre : (questionSet.genre ? [questionSet.genre] : []),
                showRecordsSql: questionSet.showRecordsSql || '',
            };
            return;
        }
    }
    setNoQuestion();
}

// ===== DBテーブル操作 =====
// ===== SQL実行・AI =====
async function executeUserSQL() {
    sqlErrorDisplay.value = null;
    isCorrect.value = null;
    try {
        if (currentQA.value.dbs) {
            let { result: userRes, columns } = executeSQLWithTablePostfix(sql.value, 'user', currentQA.value.dbNames);
            if (currentQA.value.showRecordsSql !== '') {
                ({ result: userRes, columns } = executeSQLWithTablePostfix(currentQA.value.showRecordsSql, 'user', currentQA.value.dbNames));
            }
            result.value = userRes;
            userAnswerColumns.value = columns;
        } else {
            sqlErrorDisplay.value = 'データベースが見つかりません';
        }
    } catch (error) {
        result.value = [];
        userAnswerColumns.value = [];
        sqlErrorDisplay.value = `SQLの実行中にエラーが発生しました。${error instanceof Error ? error.message : String(error)}`;
    } finally {
        await createUserCopyTables();
    }
}

async function executeAnswerSQL() {
    try {
        if (currentQA.value.dbs) {
            let { result: answerRes } = executeSQLWithTablePostfix(currentQA.value.answer, 'answer', currentQA.value.dbNames);
            correctResult.value = answerRes;
            if (currentQA.value.showRecordsSql !== '') {
                ({ result: answerRes } = executeSQLWithTablePostfix(currentQA.value.showRecordsSql, 'answer', currentQA.value.dbNames));
                correctResult.value = answerRes;
            }
        } else {
            correctResult.value = [];
        }
    } catch (error) {
        correctResult.value = [];
    } finally {
        await createAnswerCopyTables();
    }
}

async function createUserCopyTables() {
    await createCopyTables('user', currentQA.value.dbs);
}

async function createAnswerCopyTables() {
    await createCopyTables('answer', currentQA.value.dbs);
}

function checkAnswer() {
    executeAnswerSQL();
    isCorrect.value = isEqual(toRaw(result.value), toRaw(correctResult.value));
}

// ===== AI回答 =====
async function askAI(userPrompt: string) {
    isAiLoading.value = true;
    aiErrorDisplay.value = null;
    aiAnswer.value = '';
    let databasesInfo = currentQA.value.dbs.map(db => {
        const rows = db.rows.map((row: any) => JSON.stringify(row)).join('\n');
        return `テーブル名: ${db.name}\nカラム: ${db.columns.join(', ')}\nデータ:\n${rows}`;
    }).join('\n');
    const prompt = `\nあなたはSQL教師です。\nSQLクエリと問題文が与えられます。\nあなたの役割は、SQLに関するユーザの質問に答えることです。\n-----------------            \n問題文: ${currentQA.value.question}\n正しいSQLクエリ: ${currentQA.value.answer}\nデータベースの情報:\n${databasesInfo}\nユーザの質問: ${userPrompt}\nユーザの入力したSQLクエリ: ${sql.value}\n-----------------\n`;
    const { data: aiResponse, error } = await useFetch('/api/openai', {
        method: 'POST',
        body: { prompt },
    });
    if (error.value) {
        aiErrorDisplay.value = 'AIからの応答に失敗しました。';
    } else {
        aiAnswer.value = String(aiResponse.value ?? 'AIからの応答に失敗しました。');
    }
    isAiLoading.value = false;
}

// ===== ナビゲーション =====
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

// ===== ウォッチ・初期化 =====
watch([questions, index], async () => {
    setCurrentQA();
    resetSqlAndAi();
    if (currentQA.value.dbs.length > 0) {
        await createUserCopyTables();
        await createAnswerCopyTables();
    }
});

onMounted(async () => {
    await loadQuestions();
    await loadDatabases();
    setRouteParams();
    setCurrentQA();
    await createUserCopyTables();
    await createAnswerCopyTables();
});
</script>

<style scoped>
/**** 追加のカスタムスタイル（必要に応じて） ****/
</style>