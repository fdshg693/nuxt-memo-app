// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: {
    exposeConfig: true,
    viewer: true,
    // and more...
  },
  runtimeConfig: {
    // サーバサイド専用のキー
    openaiApiKey: process.env.OPENAI_API_KEY,
    // クライアントにも公開するキー（NUXT_PUBLIC_ が自動的に消えます）
    public: {
      apiKey: process.env.NUXT_PUBLIC_API_KEY
    }
  },
  plugins: [
    '~/plugins/global-css.ts',
  ],
})