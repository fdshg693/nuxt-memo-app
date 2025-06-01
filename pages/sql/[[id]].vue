<template>
    <div
        class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 min-h-screen flex flex-col items-center justify-start py-8">
        <NuxtLink to="/" class="btn-gradient">トップ</NuxtLink>
        <NuxtLink to="/sql/explanation" class="btn-gradient">SQL解説</NuxtLink>
        <h1
            class="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            SQLの問題</h1>
        <div id="app" class="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <div v-if="currentQuestion" class="mb-4">
                <h2 class="text-xl font-bold text-indigo-700 mb-2">{{ currentQuestion }}</h2>
            </div>

            <QuestionNavigation :index="index" :questions-length="questions.length" @prev="prevQuestion"
                @next="nextQuestion" />
            <div class="flex flex-row flex-wrap gap-4 mb-4">
                <div v-for="db in currentDbs" :key="db.name" class="flex-1 min-w-[250px]">
                    <DatabaseTable :db="db" />
                </div>
            </div>
            <div @click="resetDatabases"
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

            <AnswerCheck :is-correct="isCorrect" :current-answer="currentAnswer" @check="checkAnswer" />
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

import QuestionNavigation from '~/components/QuestionNavigation.vue';
import DatabaseTable from '~/components/DatabaseTable.vue';
import SqlEditor from '~/components/SqlEditor.vue';
import ResultTable from '~/components/ResultTable.vue';
import AnswerCheck from '~/components/AnswerCheck.vue';

import databasesJson from '@/data/sqlDatabases.json'

// 型定義
interface Table {
    name: string;
    columns: string[];
    rows: Record<string, any>[];
}

// Route params
const route = useRoute()
const index = ref(0)

function setRouteParams() {
    const id = route.params.id;
    if (id == "") {
        index.value = 1;
    } else {
        index.value = Number(id);
    }
}

const nuxt = useNuxtApp();
const $alasql = nuxt.$alasql as typeof import('alasql');

// Quiz and DB composables
const { questions, loadQuestions } = useSqlQuiz();
const { loadDatabases, getDatabaseByName } = useSqlDb();

// State refs
const sql = ref('');
const isCorrect = ref<boolean | null>(null);
const aiErrorDisplay = ref<string | null>(null);
const aiAnswer = ref<string>('');
const isAiLoading = ref(false);

// Current question/answer/db
const currentQuestion = ref('');
const currentAnswer = ref('');
const currentDbNames = ref<string[]>([]);

// DB data
const currentDbs = ref<any[]>([]);
const userAnswerColumns = ref<string[]>([]);

// Results
const result = ref<Record<string, any>[]>([]);
const correctResult = ref<Record<string, any>[]>([]);
const sqlErrorDisplay = ref<string | null>(null);


async function resetDatabases() {
    // ALASQLデータベースが存在しない場合は作成
    if (!$alasql.databases.ALASQL) {
        $alasql('CREATE DATABASE ALASQL; USE ALASQL;');
    }
    // テーブルを初期化
    (databasesJson as Table[]).forEach(tbl => {
        if ($alasql.databases.ALASQL.tables[tbl.name]) {
            $alasql(`DROP TABLE ${tbl.name};`);
        }
        const colsDef = tbl.columns.join(',');
        $alasql(`CREATE TABLE ${tbl.name} (${colsDef});`);
        tbl.rows.forEach(row => {
            const cols = Object.keys(row).join(',');
            const vals = Object.values(row).map(v => typeof v === 'string' ? `'${v}'` : v).join(',');
            $alasql(`INSERT INTO ${tbl.name} (${cols}) VALUES (${vals});`);
        });
    });
}

function setCurrentQA() {
    const idx = index.value;
    if (questions.value.length > 0 && idx >= 0 && idx < questions.value.length) {
        const questionSet = questions.value.find(q => q.id === idx);
        if (questionSet) {
            currentQuestion.value = questionSet.question;
            currentAnswer.value = questionSet.answer;
            currentDbNames.value = questionSet.DbName.split(',');
            currentDbs.value = currentDbNames.value.map(getDatabaseByName);
        } else {
            setNoQuestion();
        }
    } else {
        setNoQuestion();
    }
}

function setNoQuestion() {
    currentQuestion.value = '問題が見つかりません';
    currentAnswer.value = '';
    currentDbNames.value = [];
    currentDbs.value = [];
}

function nextQuestion() {
    if (index.value < questions.value.length - 1) {
        index.value++;
        setCurrentQA();
        isCorrect.value = null;
    }
}
function prevQuestion() {
    if (index.value > 0) {
        index.value--;
        setCurrentQA();
        isCorrect.value = null;
    }
}

function executeUserSQL() {
    sqlErrorDisplay.value = null;
    isCorrect.value = null;
    try {
        if (currentDbs.value) {
            const res = $alasql(sql.value);
            if (Array.isArray(res)) {
                result.value = res;
                userAnswerColumns.value = res.length ? Object.keys(res[0]) : [];
            } else {
                result.value = [];
                userAnswerColumns.value = [];
            }
        } else {
            sqlErrorDisplay.value = 'データベースが見つかりません';
        }
    } catch (error) {
        result.value = [];
        userAnswerColumns.value = [];
        sqlErrorDisplay.value = `SQLの実行中にエラーが発生しました。${error instanceof Error ? error.message : String(error)}`;
    }
}

async function askAI(userPrompt: string) {
    isAiLoading.value = true;
    aiErrorDisplay.value = null;
    aiAnswer.value = '';
    let databasesInfo = currentDbs.value.map(db => {
        const rows = db.rows.map((row: any) => JSON.stringify(row)).join('\n');
        return `テーブル名: ${db.name}\nカラム: ${db.columns.join(', ')}\nデータ:\n${rows}`;
    }).join('\n');
    const prompt = `\nあなたはSQL教師です。\nSQLクエリと問題文が与えられます。\nあなたの役割は、SQLに関するユーザの質問に答えることです。\n-----------------            \n問題文: ${currentQuestion.value}\n正しいSQLクエリ: ${currentAnswer.value}\nデータベースの情報:\n${databasesInfo}\nユーザの質問: ${userPrompt}\nユーザの入力したSQLクエリ: ${sql.value}\n-----------------\n`;
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

function executeAnswerSQL() {
    try {
        if (currentDbs.value) {
            const res = $alasql(currentAnswer.value);
            correctResult.value = Array.isArray(res) ? res : [];
        } else {
            correctResult.value = [];
        }
    } catch (error) {
        correctResult.value = [];
    }
}

function checkAnswer() {
    executeAnswerSQL();
    isCorrect.value = isEqual(toRaw(result.value), toRaw(correctResult.value));
}

watch([questions, index], setCurrentQA);

onMounted(async () => {
    await loadQuestions();
    await loadDatabases();
    await resetDatabases();
    setRouteParams();
    setCurrentQA();
});
</script>

<style scoped>
/**** 追加のカスタムスタイル（必要に応じて） ****/
</style>