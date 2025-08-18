import OpenAI from "openai";

/**
 * Centralized AI service for OpenAI API calls
 * 
 * このサービスはOpenAI Chat Completion APIを使用してSQL学習支援機能を提供します。
 * Chat Completion APIは会話形式のインタラクションに最適化されたAPIです。
 * 
 * @see https://platform.openai.com/docs/api-reference/chat/create
 * @see DOCS/OPENAI_CHAT_API.md - 詳細な使用方法とベストプラクティス
 */
export function useAI() {
    
    /**
     * OpenAI Chat Completion APIを使用してAI応答を生成
     * 
     * Chat Completion APIの特徴:
     * - システムメッセージとユーザーメッセージを分離した明確な構造
     * - max_tokensによる精密な出力制御
     * - GPT-4oなどの最新モデルに対応
     * - 教育支援や一問一答形式に最適
     * 
     * @param systemPrompt - システム指示（SQL教師としての役割定義）
     * @param userPrompt - ユーザー入力（SQLに関する質問）
     * @param maxTokens - 最大出力トークン数（デフォルト: 2000）
     * @returns AI応答テキスト
     * 
     * @example
     * ```typescript
     * const response = await callOpenAI(
     *   "あなたはSQL専門の教師です。SQLに関する質問にのみ回答してください。",
     *   "SELECT文の基本的な書き方を教えてください",
     *   1500
     * );
     * ```
     */
    async function callOpenAI(systemPrompt: string, userPrompt: string, maxTokens: number = 2000): Promise<string> {
        const config = useRuntimeConfig();
        
        if (!config.openaiApiKey) {
            throw new Error('OpenAI API key not available');
        }

        try {
            // OpenAI クライアントを初期化
            const client = new OpenAI({
                apiKey: config.openaiApiKey
            });
            
            // Chat Completion API を呼び出し
            const response = await client.chat.completions.create({
                model: 'gpt-4o',                   // 使用するモデル（GPT-4o）
                messages: [
                    { role: 'system', content: systemPrompt },  // システム指示
                    { role: 'user', content: userPrompt }       // ユーザー入力
                ],
                max_tokens: maxTokens,             // 最大出力トークン数
                temperature: 0.7                   // 応答の創造性を制御
            });

            // Chat Completion APIでは choices[0].message.content から応答を取得
            return response.choices[0]?.message?.content || 'AIからの応答を取得できませんでした。';
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            throw error;
        }
    }

    /**
     * OpenAI APIを開発環境でのモック応答機能付きで呼び出し
     * 
     * 開発環境では実際のAPIキーが無くてもモック応答で動作確認が可能です。
     * 本番環境では通常のChat Completion API呼び出しが実行されます。
     * 
     * @param systemPrompt - システム指示（SQL教師としての役割定義）
     * @param userPrompt - ユーザー入力（SQLに関する質問）
     * @param mockResponse - APIキーが無い場合のフォールバック応答
     * @param maxTokens - 最大出力トークン数（デフォルト: 2000）
     * @returns AI応答テキストまたはモック応答
     * 
     * @example
     * ```typescript
     * const response = await callOpenAIWithMock(
     *   "SQLの専門家として回答してください",
     *   "JOINの使い方を教えて",
     *   "JOINは複数のテーブルを結合するSQL文です...", // モック応答
     *   1500
     * );
     * ```
     */
    async function callOpenAIWithMock(
        systemPrompt: string, 
        userPrompt: string, 
        mockResponse: string, 
        maxTokens: number = 2000
    ): Promise<string> {
        const config = useRuntimeConfig();
        
        // APIキーが設定されていない場合はモック応答を返す
        if (!config.openaiApiKey) {
            return mockResponse;
        }

        // APIキーが設定されている場合は実際のChat Completion APIを呼び出し
        return await callOpenAI(systemPrompt, userPrompt, maxTokens);
    }

    return {
        callOpenAI,
        callOpenAIWithMock
    };
}