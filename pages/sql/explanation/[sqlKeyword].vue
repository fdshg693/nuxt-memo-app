<template>
    <NuxtLink to="/" class="btn-gradient">トップ</NuxtLink>
    <NuxtLink to="/sql/explanation" class="btn-gradient">SQL解説</NuxtLink>
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

import { useSqlTableUtils } from '~/composables/useSqlTableUtils';

import databasesJson from '@/data/sqlDatabases.json'

import { useNuxtApp } from '#app';

// explanationMapをimport.meta.globで一括取得
const modules = import.meta.glob('~/data/sqlExplanation/*.json', { eager: true });
const explanationMap: Record<string, any> = {};
for (const path in modules) {
    const key = path.split('/').pop()?.replace('Explanation.json', '').toLowerCase();
    if (key) {
        const mod = modules[path];
        explanationMap[key] = mod && typeof mod === 'object' && 'default' in mod ? mod.default : mod;
    }
}

const route = useRoute()
const keyword = route.params.sqlKeyword as string

const nuxt = useNuxtApp();
const $alasql = nuxt.$alasql as typeof import('alasql');

const { createCopyTables, executeSQLWithTablePostfix } = useSqlTableUtils($alasql);
const { loadDatabases, getDatabaseByName } = useSqlDb();

const resultColumns = ref<string[][]>([]);
const resultRecords = ref<Record<string, any>[][]>([]);

const explanation = Array.isArray(explanationMap[keyword.toLowerCase()]) ? explanationMap[keyword.toLowerCase()] : null

function getDbByName(name: string) {
    return databasesJson.find((db: any) => db.name === name)
}

function executeSql(explanationIndex: number) {
    const currentExample = explanation?.[0]?.examples?.[explanationIndex];
    const currentDb = getDatabaseByName(currentExample?.DbName);
    const postfix = explanationIndex.toString();
    createCopyTables(postfix, [currentDb]);
    if (!explanation || !Array.isArray(explanation) || !explanation[0] || !Array.isArray(explanation[0].examples) || explanationIndex < 0 || explanationIndex >= explanation[0].examples.length) {
        console.error('無効なインデックスまたはデータです。');
        return;
    }
    try {
        let { result: userRes } = executeSQLWithTablePostfix(currentExample?.example, postfix, [currentDb?.name]);
        if (explanation[0].title.toLowerCase().includes("insert")) {
            const selectSql = `SELECT * FROM ${currentDb?.name}`;
            ({ result: userRes } = executeSQLWithTablePostfix(selectSql, postfix, [currentDb?.name]));
        }
        if (Array.isArray(userRes)) {
            resultRecords.value[explanationIndex] = userRes;
            resultColumns.value[explanationIndex] = userRes.length ? Object.keys(userRes[0]) : [];
        } else {
            resultRecords.value[explanationIndex] = [];
            resultColumns.value[explanationIndex] = [];
        }
    } catch (error) {
        console.error('SQL実行中にエラーが発生しました。', error);
    }
}

onMounted(async () => {
    await loadDatabases();
});

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
