<template>
    <div v-if="Array.isArray(explanation) && explanation.length > 0">
        <h1>{{ explanation[0].title }}</h1>
        <p>{{ explanation[0].description }}</p>
        <div v-for="(ex, idx) in explanation[0].examples" :key="idx" class="example-block">
            <pre>{{ ex.example }}</pre>
            <p>{{ ex.explanation }}</p>
            <div v-if="ex.DbName">
                <DatabaseTable v-for="dbName in ex.DbName.split(',')" :key="dbName.trim()"
                    :db="getDbByName(dbName.trim())" />
            </div>
            <button @click="executeSql(idx)"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">SQLを実行</button>
            <ResultTable v-if="resultRecords[idx]" :columns="resultColumns[idx]" :result="resultRecords[idx]" />
        </div>
    </div>
    <div v-else>
        <p>データが見つかりません。</p>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

import DatabaseTable from '~/components/DatabaseTable.vue'
import ResultTable from '~/components/ResultTable.vue';

import selectExplanation from '~/data/sqlExplanation/selectExplanation.json'
import whereExplanation from '~/data/sqlExplanation/whereExplanation.json'
import databasesJson from '@/data/sqlDatabases.json'

import { useNuxtApp } from '#app';

const route = useRoute()
const keyword = route.params.sqlKeyword as string

const nuxt = useNuxtApp();
const $alasql = nuxt.$alasql as typeof import('alasql');

const resultColumns = ref<string[][]>([]);
const resultRecords = ref<Record<string, any>[][]>([]);

const explanationMap: Record<string, any> = {
    select: selectExplanation,
    where: whereExplanation,
}

const explanation = Array.isArray(explanationMap[keyword.toLowerCase()]) ? explanationMap[keyword.toLowerCase()] : null

function getDbByName(name: string) {
    return databasesJson.find((db: any) => db.name === name)
}

function executeSql(explanationIndex: number) {
    if (!explanation || !Array.isArray(explanation) || !explanation[0] || !Array.isArray(explanation[0].examples) || explanationIndex < 0 || explanationIndex >= explanation[0].examples.length) {
        console.error('無効なインデックスまたはデータです。');
        return;
    }
    try {
        const res = $alasql(explanation[0].examples[explanationIndex].example);
        if (Array.isArray(res)) {
            resultRecords.value[explanationIndex] = res;
            resultColumns.value[explanationIndex] = res.length ? Object.keys(res[0]) : [];
        } else {
            resultRecords.value[explanationIndex] = [];
            resultColumns.value[explanationIndex] = [];
        }
    } catch (error) {
        console.error('SQL実行中にエラーが発生しました。', error);
    }
}

</script>

<style scoped>
.example-block {
    margin-bottom: 1.5em;
    padding: 1em;
    background: #f8f8fa;
    border-radius: 8px;
}

pre {
    background: #eee;
    padding: 0.5em;
    border-radius: 4px;
}
</style>
