import OpenAI from "openai";

/**
 * Centralized AI service for OpenAI API calls
 */
export function useAI() {
    
    /**
     * Make a call to OpenAI API with the correct chat completion format
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
            const client = new OpenAI({
                apiKey: config.openaiApiKey
            });
            
            const response = await client.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: maxTokens,
                temperature: 0.7
            });

            return response.choices[0]?.message?.content || 'AIからの応答を取得できませんでした。';
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