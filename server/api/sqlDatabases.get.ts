import data from '../../data/sqlDatabases.json'  // tsconfig.json の設定次第でパスは調整

export default defineEventHandler(() => {
    return data
})
