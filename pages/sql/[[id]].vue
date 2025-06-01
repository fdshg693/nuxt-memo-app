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
            <div @click="createCopyTables"
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
const index = ref(1)

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

// Current QAまとめて管理
const currentQA = ref({
    question: '',
    answer: '',
    dbNames: [] as string[],
    dbs: [] as any[],
    genre: [] as string[],
});

// DB data
const userAnswerColumns = ref<string[]>([]);

// Results
const result = ref<Record<string, any>[]>([]);
const correctResult = ref<Record<string, any>[]>([]);
const sqlErrorDisplay = ref<string | null>(null);

async function createCopyTables() {
    // テーブルを初期化
    (databasesJson as Table[]).forEach(tbl => {
        // コピー用テーブル削除
        const userTableName = `${tbl.name}_user`;
        if ($alasql.databases.ALASQL.tables[userTableName]) {
            $alasql(`DROP TABLE ${userTableName};`);
        }
        // コピー用テーブル作成
        const colsDef = tbl.columns.join(',');
        $alasql(`CREATE TABLE ${userTableName} (${colsDef});`);
        // データ挿入
        tbl.rows.forEach((row: Record<string, any>) => {
            const cols = Object.keys(row).join(',')
            const vals = Object.values(row).map(v => typeof v === 'string' ? `'${v}'` : v).join(',')
            $alasql(`INSERT INTO ${userTableName} (${cols}) VALUES (${vals});`)
        })
    });
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
                dbs: questionSet.DbName.split(',').map(getDatabaseByName).filter(Boolean), // undefinedを除外
                genre: Array.isArray(questionSet.genre) ? questionSet.genre : (questionSet.genre ? [questionSet.genre] : []),
            };
            console.log('Current QA:', currentQA.value.dbs.map(db => db.name));
        } else {
            setNoQuestion();
        }
    } else {
        setNoQuestion();
    }
}

function setNoQuestion() {
    currentQA.value = {
        question: '問題が見つかりません',
        answer: '',
        dbNames: [],
        dbs: [],
        genre: [],
    };
}

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

function executeUserSQL() {
    sqlErrorDisplay.value = null;
    isCorrect.value = null;
    try {
        if (currentQA.value.dbs) {
            // ユーザーSQL内のテーブル名を *_user に自動変換
            let userSql = sql.value;
            currentQA.value.dbNames.forEach(name => {
                const re = new RegExp(`\\b${name}\\b`, 'g');
                userSql = userSql.replace(re, `${name}_user`);
            });
            const res = $alasql(userSql);
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

function executeAnswerSQL() {
    try {
        if (currentQA.value.dbs) {
            const res = $alasql(currentQA.value.answer);
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
    await createCopyTables();
    setRouteParams();
    setCurrentQA();
});
</script>

<style scoped>
/**** 追加のカスタムスタイル（必要に応じて） ****/
</style>