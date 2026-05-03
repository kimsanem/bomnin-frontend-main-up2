import process from 'node:process'
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

  runtimeConfig: {
    
    public: {
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      aiBase: process.env.NUXT_PUBLIC_AI_BASE,
    }
  }
})
