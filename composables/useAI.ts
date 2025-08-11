import OpenAI from "openai";

/**
 * Centralized AI service for OpenAI API calls
 */
export function useAI() {
    
    /**
     * Make a call to OpenAI API with the original gpt-5 format
     * @param systemPrompt - System instructions for AI
     * @param userPrompt - User input prompt
     * @param maxTokens - Maximum tokens for response
     * @returns AI response text
     */
    async function callOpenAI(systemPrompt: string, userPrompt: string, maxTokens: number = 2000): Promise<string> {
        const config = useRuntimeConfig();
        
        if (!config.openaiApiKey) {
            throw new Error('OpenAI API key not available');
        }

        try {
            const client = new OpenAI();
            const response: any = await client.responses.create({
                model: 'gpt-5',
                instructions: systemPrompt,
                input: userPrompt,
                max_output_tokens: maxTokens
            });

            return response.output_text || 'AIからの応答を取得できませんでした。';
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            throw error;
        }
    }

    /**
     * Call OpenAI API with mock response fallback for development
     * @param systemPrompt - System instructions for AI
     * @param userPrompt - User input prompt
     * @param mockResponse - Fallback response when API key is not available
     * @param maxTokens - Maximum tokens for response
     * @returns AI response text or mock response
     */
    async function callOpenAIWithMock(
        systemPrompt: string, 
        userPrompt: string, 
        mockResponse: string, 
        maxTokens: number = 2000
    ): Promise<string> {
        const config = useRuntimeConfig();
        
        if (!config.openaiApiKey) {
            return mockResponse;
        }

        return await callOpenAI(systemPrompt, userPrompt, maxTokens);
    }

    return {
        callOpenAI,
        callOpenAIWithMock
    };
}