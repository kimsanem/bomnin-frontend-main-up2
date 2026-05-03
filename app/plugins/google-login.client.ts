// plugins/google-login.client.ts

import { GoogleLogin, googleSdkLoaded } from 'vue3-google-login'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const googleClientId = config.public.googleClientId

  if (!googleClientId) {
    console.warn('GOOGLE_CLIENT_ID is not set; Google login is disabled in this environment.')
    return
  }

  nuxtApp.vueApp.component('GoogleLogin', GoogleLogin)

  const isEmbeddedBrowser = () => {
    const ua = window.navigator.userAgent || ''
    return /FBAN|FBAV|Instagram|Messenger|Line\/|MicroMessenger|wv\)|Telegram|TikTok|Snapchat/i.test(ua)
  }

  const warmGoogleSdk = () => {
    googleSdkLoaded(() => {
      window.google?.accounts.id.initialize({
        client_id: googleClientId,
        use_fedcm_for_prompt: !isEmbeddedBrowser(),
        callback: () => {},
      })
    })
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(warmGoogleSdk, { timeout: 2500 })
  } else {
    window.setTimeout(warmGoogleSdk, 1200)
  }
})
