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

            <DatabaseTable :db-name="currentDbName" :columns="allColumns" :rows="allRows" />

            <SqlEditor v-model="sql" @execute="executeUserSQL" @ask-ai="askAI" />

            <div v-if="aiAnswer || aiErrorDisplay" class="mb-4">
                <div v-if="aiAnswer"
                    class="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-400 text-indigo-800 p-3 rounded mb-2">
                    <span class="font-semibold">AIの回答:</span> {{ aiAnswer }}
                </div>
                <div v-if="aiErrorDisplay" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 rounded">
                    {{ aiErrorDisplay }}
                </div>
            </div>

            <ResultTable :columns="allColumns" :result="result" />
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
import { useQuiz } from '~/composables/useSqlQuiz';
import { useSqlDb } from '~/composables/useSqlDb';
import { useNuxtApp } from '#app';
import QuestionNavigation from '~/components/QuestionNavigation.vue';
import DatabaseTable from '~/components/DatabaseTable.vue';
import SqlEditor from '~/components/SqlEditor.vue';
import ResultTable from '~/components/ResultTable.vue';
import AnswerCheck from '~/components/AnswerCheck.vue';

const nuxt = useNuxtApp();
const $alasql = nuxt.$alasql as typeof import('alasql');

// Quiz and DB composables
const { questions, loadQuestions } = useQuiz();
const { databases, loadDatabases, getDatabaseByName } = useSqlDb();

// State refs
const sql = ref('');
const isCorrect = ref<boolean | null>(null);
const aiErrorDisplay = ref<string | null>(null);
const aiAnswer = ref<string>('');

// Current question/answer/db
const currentQuestion = ref('');
const currentAnswer = ref('');
const currentDbName = ref('');

// DB data
const currentDb = ref<any>(null);
const allColumns = ref<string[]>([]);
const allRows = ref<any[]>([]);
const columns = ref<string[]>([]);

// Results
const result = ref<Record<string, any>[]>([]);
const correctResult = ref<Record<string, any>[]>([]);
const sqlErrorDisplay = ref<string | null>(null);

// Route params
const route = useRoute()
const raw = route.params.id as string[] | undefined
const index = ref(Number(route.params.id ?? 0))

function setCurrentQA() {
    if (questions.value.length > 0 && index.value >= 0 && index.value < questions.value.length) {
        currentQuestion.value = questions.value[index.value].question;
        currentAnswer.value = questions.value[index.value].answer;
        currentDbName.value = questions.value[index.value].DbName;

        // Load the current database schema
        currentDb.value = getDatabaseByName(currentDbName.value);
        if (currentDb.value) {
            allColumns.value = currentDb.value.columns;
            allRows.value = currentDb.value.rows;
        }
    } else {
        currentQuestion.value = '問題が見つかりません';
        currentAnswer.value = '';
        currentDbName.value = '';
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
        if (currentDb.value) {
            const res = $alasql(sql.value);
            if (Array.isArray(res)) {
                result.value = res
                columns.value = res.length ? Object.keys(res[0]) : []
            } else {
                result.value = []
                columns.value = []
            }
        } else {
            sqlErrorDisplay.value = 'データベースが見つかりません';
        }
    } catch (error) {
        result.value = [];
        columns.value = [];
        sqlErrorDisplay.value = `SQLの実行中にエラーが発生しました。${(error instanceof Error ? error.message : String(error))}`;
    }
    isCorrect.value = null;
}

async function askAI(userPrompt: string) {
    const prompt = `
            あなたはSQL教師です。
            SQLクエリと問題文が与えられます。
            あなたの役割は、SQLに関するユーザの質問に答えることです。
            ユーザの質問: ${userPrompt}
            問題文: ${currentQuestion.value}
            データベース名: ${currentDbName.value}
            カラム名: ${allColumns.value.join(', ')}
            データベースの内容: ${JSON.stringify(allRows.value)}
            ユーザの入力したSQLクエリ: ${sql.value}
            `;
    const { data: aiResponse, error } = await useFetch('/api/openai', {
        method: 'POST',
        body: { prompt },
    });
    if (error.value) {
        aiErrorDisplay.value = 'AIからの応答に失敗しました。';
    } else {
        aiAnswer.value = aiResponse.value;
    }
}

function executeAnswerSQL() {
    try {
        if (currentDb.value) {
            const res = $alasql(currentAnswer.value);
            if (Array.isArray(res)) {
                correctResult.value = res
            } else {
                result.value = []
                correctResult.value = []
            }
        } else {
            console.error('Unexpected Correct Database not found');
        }
    } catch (error) {
        console.error('Unexpected Correct SQL execution error:', error);
        result.value = [];
        columns.value = [];
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
    setCurrentQA();
});
</script>

<style scoped>
/**** 追加のカスタムスタイル（必要に応じて） ****/
</style>