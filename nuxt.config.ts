import process from 'node:process'

const apiBase = process.env.NUXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000/api'
const chatbotBase = process.env.NUXT_PUBLIC_CHATBOT_BASE ?? 'https://bomnin-chatbot.onrender.com'
const themeScriptHash = "'sha256-6BXjL9qg/64MowqTiN0HXfzNQBfizFToZsIDs2U6iKM='"

const toOrigin = (value: string) => {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

const connectOrigins = [
  apiBase,
  chatbotBase,
  'https://accounts.google.com',
  'https://oauth2.googleapis.com',
]
  .map(toOrigin)
  .filter((value): value is string => Boolean(value))

const mediaOrigins = [
  'https://pub-527694ac75464b31baaf7bf68a76d622.r2.dev',
]

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' ${themeScriptHash} https://accounts.google.com https://apis.google.com https://ssl.gstatic.com https://accounts.gstatic.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' ${connectOrigins.join(' ')}`,
  "frame-src 'self' https://accounts.google.com",
  "frame-ancestors 'self'",
  `media-src 'self' blob: ${mediaOrigins.join(' ')}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
]
  .join('; ')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  css: [
    '@/assets/css/font.css'
  ],

  app: {
    head: {
      title: 'ប្រព័ន្ធបំណិនមន្ត្រីវិទ្យា',
      htmlAttrs: {
        lang: 'kh' 
      },
      meta: [
        { name: 'google', content: 'notranslate' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://accounts.google.com' },
        { rel: 'preconnect', href: 'https://ssl.gstatic.com', crossorigin: '' }
      ],
      script: [
        {
          innerHTML: "(function(){try{var theme=localStorage.getItem('theme')==='dark'?'dark':'light';document.documentElement.classList.toggle('dark',theme==='dark');document.documentElement.setAttribute('data-theme',theme);}catch(e){}})();"
        }
      ]
    },
  },

  routeRules: {
    '/**': {
      headers: {
        'Content-Security-Policy': contentSecurityPolicy,
        'Permissions-Policy': 'accelerometer=(), autoplay=(self), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    },
  },

  runtimeConfig: {
    
    public: {
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      chatbotBase: process.env.NUXT_PUBLIC_CHATBOT_BASE || 'https://bomnin-chatbot.onrender.com',
    }
  }
})
