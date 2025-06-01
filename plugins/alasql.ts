import { defineNuxtPlugin } from '#app'
import alasql from 'alasql'
import tables from '~/data/sqlDatabases.json'

export default defineNuxtPlugin((nuxtApp) => {
    // ALASQLデータベースが存在しない場合は作成
    if (!alasql.databases.ALASQL) {
        alasql('CREATE DATABASE ALASQL; USE ALASQL;')
    }
    // メモリ上にテーブルを作成
    tables.forEach((tbl: any) => {
        // 既にテーブルが存在する場合はスキップ
        if (!alasql.databases.ALASQL.tables[tbl.name]) {
            // CREATE TABLE 文を組み立て
            const colsDef = tbl.columns.map((c: string) => `${c}`).join(',')
            alasql(`CREATE TABLE ${tbl.name} (${colsDef});`)
            // データ挿入
            tbl.rows.forEach((row: Record<string, any>) => {
                const cols = Object.keys(row).join(',')
                const vals = Object.values(row).map(v => typeof v === 'string' ? `'${v}'` : v).join(',')
                alasql(`INSERT INTO ${tbl.name} (${cols}) VALUES (${vals});`)
            })
        }
    })
    // アプリ全体で this.$alasql から呼べるように
    nuxtApp.provide('alasql', alasql)
})

