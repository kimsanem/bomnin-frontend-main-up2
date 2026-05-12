// plugins/google-login.client.ts

import { GoogleLogin, googleSdkLoaded } from 'vue3-google-login'
import { isEmbeddedBrowserEnvironment } from '~/utils/browser'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const googleClientId = config.public.googleClientId

  if (!googleClientId) {
    console.warn('GOOGLE_CLIENT_ID is not set; Google login is disabled in this environment.')
    return
  }

  nuxtApp.vueApp.component('GoogleLogin', GoogleLogin)

  const isEmbeddedBrowser = () => {
    return isEmbeddedBrowserEnvironment(
      window.navigator.userAgent || '',
      document.referrer || '',
    )
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
    globalThis.setTimeout(warmGoogleSdk, 1200)
  }
})
