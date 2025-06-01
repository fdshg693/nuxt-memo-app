import { ref } from 'vue';

/**
 * DBテーブル操作用ユーティリティ
 * @param $alasql alasqlインスタンス
 */
export function useSqlTableUtils($alasql: any) {
    async function createCopyTables(postfix: string, dbs: any[]) {
        /**
         * 指定されたデータベースのテーブルをコピーして、テーブル名に`_{postfix}`を付加
         * @param postfix テーブル名に付加する文字列
         * @param dbs データベースの配列
         */
        dbs.forEach((tbl: any) => {
            const copyTableName = `${tbl.name}_${postfix}`;
            if ($alasql.databases.ALASQL.tables[copyTableName]) {
                $alasql(`DROP TABLE ${copyTableName};`);
            }
            const colsDef = tbl.columns.join(',');
            $alasql(`CREATE TABLE ${copyTableName} (${colsDef});`);
            tbl.rows.forEach((row: Record<string, any>) => {
                const cols = Object.keys(row).join(',');
                const vals = Object.values(row).map(v => typeof v === 'string' ? `'${v}'` : v).join(',');
                $alasql(`INSERT INTO ${copyTableName} (${cols}) VALUES (${vals});`);
            });
        });
    }

    /**
     * SQL文中のテーブル名を`_{postfix}`付きに置換して実行
     */
    function executeSQLWithTablePostfix(sqlText: string, postfix: string, dbNames: string[]) {
        /**
         * SQL文中のテーブル名を置換して実行
         * @param sqlText 実行するSQL文
         * @param postfix テーブル名に付加する文字列
         * @param dbNames 置換対象のデータベース名の配列
         * @returns 実行結果とカラム名の配列
         */
        let replacedSql = sqlText;
        dbNames.forEach((name: string) => {
            const re = new RegExp(`\\b${name}\\b`, 'g');
            replacedSql = replacedSql.replace(re, `${name}_${postfix}`);
        });
        const res = $alasql(replacedSql);
        if (Array.isArray(res)) {
            return {
                result: res,
                columns: res.length ? Object.keys(res[0]) : []
            };
        } else {
            return {
                result: [],
                columns: []
            };
        }
    }

    return {
        createCopyTables,
        executeSQLWithTablePostfix
    };
}
