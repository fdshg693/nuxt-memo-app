import { ref } from 'vue';
import sqlDatabases from '@/data/sqlDatabases.json'

export function useSqlDb() {
    const databases = ref<any[]>([]);

    async function loadDatabases() {
        // Load databases from an Internal Json file
        databases.value = sqlDatabases
    }

    function getDatabaseByName(name: string) {
        return databases.value.find((db) => db.name === name);
    }

    return {
        databases,
        loadDatabases,
        getDatabaseByName
    }
}