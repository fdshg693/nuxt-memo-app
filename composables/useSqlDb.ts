import { ref } from 'vue';
import sqlDatabases from '@/data/sqlDatabases.json'

export function useSqlDb() {
    const databases = ref<any[]>([]);

    async function loadDatabases() {
        /**
         * データベース情報をJSONから読み込み
         * SQLデータベースの情報をロード
         * @returns データベースの配列
         */
        databases.value = sqlDatabases;
    }

    function getDatabaseByName(name: string) {
        /**
         * データベース名でデータベースを取得
         * @param name データベース名
         * @returns データベースオブジェクト
         */
        return databases.value.find((db) => db.name === name);
    }

    return {
        databases,
        loadDatabases,
        getDatabaseByName
    }
}