// server/api/openai.post.ts
import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const { prompt } = await readBody(event)
    const config = useRuntimeConfig()
    console.log("prompt:", prompt)
    try {
        const response: any = await $fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.openaiApiKey}`,
            },
            body: {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'user', content: prompt },
                ],
                max_tokens: 300,
                temperature: 0.7,
            }
        })
        return response.choices[0].message.content
    }
    catch (error) {
        console.error('Error fetching from OpenAI API:', error)
        return { error: 'Failed to fetch data from OpenAI API' }
    }
})
