import { defineNuxtPlugin } from '#app'
import alasql from 'alasql'
import tables from '~/data/sqlDatabases.json'

export default defineNuxtPlugin((nuxtApp) => {
    // メモリ上にテーブルを作成
    tables.forEach((tbl: any) => {
        // CREATE TABLE 文を組み立て
        const colsDef = tbl.columns.map((c: string) => `${c}`).join(',')
        alasql(`CREATE TABLE ${tbl.name} (${colsDef});`)
        // データ挿入
        tbl.rows.forEach((row: Record<string, any>) => {
            const cols = Object.keys(row).join(',')
            const vals = Object.values(row).map(v => typeof v === 'string' ? `'${v}'` : v).join(',')
            alasql(`INSERT INTO ${tbl.name} (${cols}) VALUES (${vals});`)
        })
    })
    // アプリ全体で this.$alasql から呼べるように
    nuxtApp.provide('alasql', alasql)
})
