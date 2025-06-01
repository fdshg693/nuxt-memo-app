<template>
    <div
        class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 min-h-screen flex flex-col items-center justify-start py-8">
        <NuxtLink to="/" class="
           inline-block
           px-8 py-4
           font-semibold text-white
           bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
           rounded-full
           shadow-lg
           transform transition
           hover:scale-105 hover:brightness-110
           focus:outline-none focus:ring-4 focus:ring-purple-300 mb-8">トップ</NuxtLink>
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
import { useSqlQuiz } from '~/composables/useSqlQuiz';
import { useSqlDb } from '~/composables/useSqlDb';
import { useNuxtApp } from '#app';
import QuestionNavigation from '~/components/QuestionNavigation.vue';
import DatabaseTable from '~/components/DatabaseTable.vue';
import SqlEditor from '~/components/SqlEditor.vue';
import ResultTable from '~/components/ResultTable.vue';
import AnswerCheck from '~/components/AnswerCheck.vue';

// Route params
const route = useRoute()
const index = ref(0)

function setRouteParams() {
    const id = route.params.id;
    if (id == "") {
        index.value = 0;
    } else {
        index.value = Number(id) - 1;
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
const dataBasesJson = ref<any[]>([]); // Make it reactive

// Results
const result = ref<Record<string, any>[]>([]);
const correctResult = ref<Record<string, any>[]>([]);
const sqlErrorDisplay = ref<string | null>(null);


async function resetDatabases() {
    // Fetch the latest DB JSON each time
    dataBasesJson.value = await fetch('/api/sqlDatabases').then(res => res.json());
    // ALASQLデータベースが存在しない場合は作成
    if (!$alasql.databases.ALASQL) {
        $alasql('CREATE DATABASE ALASQL; USE ALASQL;')
    }
    // メモリ上にテーブルを作成
    dataBasesJson.value.forEach((tbl: any) => {
        // 既にテーブルが存在する場合は削除
        if ($alasql.databases.ALASQL.tables[tbl.name]) {
            $alasql(`DROP TABLE ${tbl.name};`)
        }
        // CREATE TABLE 文を組み立て
        const colsDef = tbl.columns.map((c: string) => `${c}`).join(',')
        $alasql(`CREATE TABLE ${tbl.name} (${colsDef});`)
        // データ挿入
        tbl.rows.forEach((row: Record<string, any>) => {
            const cols = Object.keys(row).join(',')
            const vals = Object.values(row).map(v => typeof v === 'string' ? `'${v}'` : v).join(',')
            $alasql(`INSERT INTO ${tbl.name} (${cols}) VALUES (${vals});`)
        })
    })
}

function setCurrentQA() {
    console.log(questions.value, index.value);
    if (questions.value.length > 0 && index.value >= 0 && index.value < questions.value.length) {
        currentQuestion.value = questions.value[index.value].question;
        currentAnswer.value = questions.value[index.value].answer;
        currentDbNames.value = questions.value[index.value].DbName.split(',');

        // Load the current database schema
        currentDbs.value = currentDbNames.value.map(dbName => getDatabaseByName(dbName));
    } else {
        currentQuestion.value = '問題が見つかりません';
        currentAnswer.value = '';
        currentDbNames.value = [];
    }
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
    try {
        if (currentDbs.value) {
            const res = $alasql(sql.value);
            if (Array.isArray(res)) {
                result.value = res
                userAnswerColumns.value = res.length ? Object.keys(res[0]) : []
            } else {
                result.value = []
                userAnswerColumns.value = []
            }
        } else {
            sqlErrorDisplay.value = 'データベースが見つかりません';
        }
    } catch (error) {
        result.value = [];
        userAnswerColumns.value = [];
        sqlErrorDisplay.value = `SQLの実行中にエラーが発生しました。${(error instanceof Error ? error.message : String(error))}`;
    }
    isCorrect.value = null;
    sqlErrorDisplay.value = null;
}

async function askAI(userPrompt: string) {
    isAiLoading.value = true;
    aiErrorDisplay.value = null;
    aiAnswer.value = '';
    let databasesInfo = "";
    for (const db of currentDbs.value) {
        databasesInfo += `テーブル名: ${db.name}\nカラム: ${db.columns.join(', ')}\nデータ:\n`;
        for (const row of db.rows) {
            databasesInfo += `${JSON.stringify(row)}\n`;
        }
    }
    const prompt = `
            あなたはSQL教師です。
            SQLクエリと問題文が与えられます。
            あなたの役割は、SQLに関するユーザの質問に答えることです。
            -----------------            
            問題文: ${currentQuestion.value}
            正しいSQLクエリ: ${currentAnswer.value}
            データベースの情報:
            ${databasesInfo}
            ユーザの質問: ${userPrompt}
            ユーザの入力したSQLクエリ: ${sql.value}
            -----------------
            `;
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
    console.log('AIの応答:', aiResponse.value);
}

function executeAnswerSQL() {
    try {
        if (currentDbs.value) {
            const res = $alasql(currentAnswer.value);
            if (Array.isArray(res)) {
                correctResult.value = res
            } else {
                correctResult.value = []
            }
        } else {
            console.error('Unexpected Correct Database not found');
        }
    } catch (error) {
        console.error('Unexpected Correct SQL execution error:', error);
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
    await resetDatabases(); // Ensure DBs are loaded on mount
    setCurrentQA();
    setRouteParams();
});
</script>

<style scoped>
/**** 追加のカスタムスタイル（必要に応じて） ****/
</style>