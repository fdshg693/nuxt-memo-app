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
  // Security headers configuration
  routeRules: {
    // Apply security headers to all routes
    '/**': {
      headers: {
        // Content Security Policy - strict policy for main app
        'Content-Security-Policy': "default-src 'self'; script-src 'self' blob:; object-src 'none'; base-uri 'none'; worker-src blob:; child-src 'self'; frame-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; media-src 'self'",
        // Permissions Policy - disable all unnecessary features
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), clipboard-read=(), clipboard-write=(), usb=(), serial=(), bluetooth=(), payment=(), accelerometer=(), gyroscope=(), magnetometer=(), fullscreen=(self), screen-wake-lock=()',
        // Other security headers
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
      }
    },
    // Sandbox page has its own stricter CSP (defined in the HTML file)
    '/sandbox.html': {
      headers: {
        'X-Frame-Options': 'DENY',
        'Cross-Origin-Resource-Policy': 'same-origin'
      }
    }
  },
  // Ensure proper static file serving for sandbox
  nitro: {
    publicAssets: [
      {
        baseURL: '/',
        dir: 'public'
      }
    ]
  }
})