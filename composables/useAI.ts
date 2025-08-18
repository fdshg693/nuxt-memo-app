import OpenAI from "openai";

/**
 * Centralized AI service for OpenAI API calls
 * 
 * このサービスはOpenAI Response APIを使用してSQL学習支援機能を提供します。
 * Response APIはChat Completion APIとは異なる構造化された応答生成に特化したAPIです。
 * 
 * @see https://platform.openai.com/docs/api-reference/responses/create
 * @see DOCS/OPENAI_RESPONSE_API.md - 詳細な使用方法とベストプラクティス
 */
export function useAI() {
    
    /**
     * OpenAI Response APIを使用してAI応答を生成
     * 
     * Response APIの特徴:
     * - instructionsとinputを分離した明確な構造
     * - max_output_tokensによる精密な出力制御
     * - GPT-5などの最新モデルに対応
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
            
            // Response API を呼び出し - Chat Completion APIとは異なる構造
            const response: any = await client.responses.create({
                model: 'gpt-5',                    // 使用するモデル（GPT-5を指定）
                instructions: systemPrompt,        // システム指示（Chat CompletionのSystem message相当）
                input: userPrompt,                 // ユーザー入力（Chat CompletionのUser message相当）
                max_output_tokens: maxTokens       // 最大出力トークン数（Chat Completionのmax_tokensより精密）
            });

            // Response APIでは output_text プロパティから応答を取得
            return response.output_text || 'AIからの応答を取得できませんでした。';
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            throw error;
        }
    }

    /**
     * OpenAI APIを開発環境でのモック応答機能付きで呼び出し
     * 
     * 開発環境では実際のAPIキーが無くてもモック応答で動作確認が可能です。
     * 本番環境では通常のResponse API呼び出しが実行されます。
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

        // APIキーが設定されている場合は実際のResponse APIを呼び出し
        return await callOpenAI(systemPrompt, userPrompt, maxTokens);
    }

    return {
        callOpenAI,
        callOpenAIWithMock
    };
}