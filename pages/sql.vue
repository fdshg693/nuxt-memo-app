<template>
    <h1 class="text-2xl font-bold mb-6 text-blue-700">SQLの問題</h1>
    <div id="app" class="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div v-if="currentQuestion" class="mb-4">
            <h2 class="text-lg font-semibold text-gray-800 mb-2">{{ currentQuestion }}</h2>
        </div>

        <div class="flex gap-2 mb-4">
            <button @click="prevQuestion" :disabled="index === 0"
                class="px-4 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-blue-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                前へ
            </button>
            <button @click="nextQuestion" :disabled="index === questions.length - 1"
                class="px-4 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-blue-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                次へ
            </button>
        </div>
        <div class="mb-6">
            <p class="mb-2 text-gray-600">テーブル名: <span class="font-mono text-blue-700">{{ currentDbName }}</span></p>
            <table class="w-full border border-gray-300 rounded mb-2">
                <thead class="bg-gray-100">
                    <tr>
                        <th v-for="col in allColumns" :key="col"
                            class="px-2 py-1 border-b border-gray-200 text-left text-sm text-gray-700">{{ col }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, idx) in allRows" :key="idx" class="hover:bg-blue-50">
                        <td class="px-2 py-1 border-b border-gray-100">{{ row.id }}</td>
                        <td class="px-2 py-1 border-b border-gray-100">{{ row.name }}</td>
                        <td class="px-2 py-1 border-b border-gray-100">{{ row.age }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <h2 class="text-base font-semibold text-blue-700 mb-2">SQLを実行する</h2>
        <textarea v-model="sql" rows="5" cols="60" placeholder="ここにSQLを入力"
            class="w-full border border-gray-300 rounded p-2 mb-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 transition"></textarea>
        <br />
        <button @click="executeSQL"
            class="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition mb-6">実行</button>

        <div v-if="result.length" class="mb-6">
            <h3 class="font-semibold text-gray-700 mb-2">結果</h3>
            <table class="w-full border border-gray-300 rounded">
                <thead class="bg-gray-100">
                    <tr>
                        <th v-for="col in allColumns" :key="col"
                            class="px-2 py-1 border-b border-gray-200 text-left text-sm text-gray-700">{{ col }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, idx) in result" :key="idx" class="hover:bg-blue-50">
                        <td v-for="col in allColumns" :key="col" class="px-2 py-1 border-b border-gray-100">{{ row[col]
                        }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div>
            <p v-if="isCorrect === null" class="text-gray-500">まだ解答していません</p>
            <div v-else>
                <p class="font-semibold text-gray-700">解答例</p>
                <div v-if="currentAnswer">
                    <pre class="bg-gray-100 rounded p-2 text-sm text-gray-800 mb-2">{{ currentAnswer }}</pre>
                </div>
                <p v-if="isCorrect === true" class="text-green-600 font-bold">✅ 正解です！</p>
                <p v-else-if="isCorrect === false" class="text-red-600 font-bold">❌ 不正解です</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useQuiz } from '~/composables/useSqlQuiz';
import { useSqlDb } from '~/composables/useSqlDb';
import { useNuxtApp } from '#app'

const nuxt = useNuxtApp()
const $alasql = nuxt.$alasql as typeof import('alasql')

const { questions, loadQuestions } = useQuiz();
const { databases, loadDatabases, getDatabaseByName } = useSqlDb();
const result = ref<Record<string, any>[]>([])
const index = ref(0);
const sql = ref('');
const isCorrect = ref<boolean | null>(null);
const error = ref<string | null>(null);

const currentQuestion = ref('');
const currentAnswer = ref('');
const currentDbName = ref('');
const allColumns = ref<string[]>([]);
const allRows = ref<any[]>([]);
const columns = ref<string[]>([]);

function setCurrentQA() {
    if (questions.value.length > 0) {
        currentQuestion.value = questions.value[index.value].question;
        currentAnswer.value = questions.value[index.value].answer;
        currentDbName.value = questions.value[index.value].DbName;

        // Load the current database schema
        const db = getDatabaseByName(currentDbName.value);
        if (db) {
            allColumns.value = db.columns;
            allRows.value = db.rows;
        }
    } else {
        currentQuestion.value = '';
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

function executeSQL() {
    try {
        const db = getDatabaseByName(currentDbName.value);
        if (db) {
            const res = $alasql(sql.value);
            if (Array.isArray(res)) {
                result.value = res
                columns.value = res.length ? Object.keys(res[0]) : []
            } else {
                // DDL や更新系の戻り値
                result.value = []
                columns.value = []
            }
        } else {
            console.error('Database not found');
        }
    } catch (error) {
        console.error('SQL execution error:', error);
        result.value = [];
        columns.value = [];
    }
    console.log('Executing SQL:', sql.value);
    console.log('Result:', result.value);
    console.log('Columns:', columns.value);
}

watch([questions, index], setCurrentQA);

onMounted(async () => {
    await loadQuestions();
    await loadDatabases();
    setCurrentQA();
});
</script>

<style scoped>
/* ここにスタイルを追加 */
</style>