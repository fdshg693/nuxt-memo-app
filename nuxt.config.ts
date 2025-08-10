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
  // Security headers configuration - relaxed for development
  routeRules: process.env.NODE_ENV === 'production' ? {
    // Apply strict security headers in production only
    '/**': {
      headers: {
        // Content Security Policy - strict policy for main app
        'Content-Security-Policy': "default-src 'self'; script-src 'self' blob: 'unsafe-inline'; object-src 'none'; base-uri 'none'; worker-src blob:; child-src 'self'; frame-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; media-src 'self'",
        // Permissions Policy - disable all unnecessary features
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), clipboard-read=(), clipboard-write=(), usb=(), serial=(), payment=(), accelerometer=(), gyroscope=(), magnetometer=(), fullscreen=(self), screen-wake-lock=()',
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
  } : {
    // Development mode - more permissive CSP for Vite HMR
    '/**': {
      headers: {
        'Content-Security-Policy': "default-src 'self'; script-src 'self' blob: 'unsafe-inline' 'unsafe-eval'; object-src 'none'; worker-src blob:; child-src 'self'; frame-src 'self'; connect-src 'self' ws: wss:; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'",
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), clipboard-read=(), clipboard-write=(), usb=(), serial=(), payment=()',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff'
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