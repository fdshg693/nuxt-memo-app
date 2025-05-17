// server/api/sqlQuestions.get.ts
//ビルド時にjsonファイルを読み込む、ビルド後は静的ファイルとして配信される
import data from '../../data/sqlQuestions.json'  // tsconfig.json の設定次第でパスは調整

export default defineEventHandler(() => {
    return data
})
