import { ref } from 'vue';

export function useSqlDb() {
    const databases = ref<any[]>([]);

    async function loadDatabases() {
        // Load databases from an Internal Json file
        const response = await fetch('../api/sqlDatabases')
        databases.value = await response.json()
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