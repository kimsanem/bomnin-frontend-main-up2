<script setup>
import { computed } from 'vue';

const { isOpen } = useSubscribeModal();

const authToken = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 30, path: '/' });
const user = useCookie('user_data', { maxAge: 60 * 60 * 24 * 30, path: '/' });
const showTermsModal = computed(() => !!authToken.value && !!user.value && !user.value.terms_accepted_at);
</script>

<template>
  <div class="relative isolate min-h-screen flex flex-col bg-slate-50 text-slate-900 w-full select-none overflow-hidden transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">

    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div class="absolute left-[-8rem] top-[-6rem] h-[20rem] w-[20rem] rounded-full bg-[#3b82f6]/5 blur-[100px] md:h-[28rem] md:w-[28rem] dark:bg-sky-400/10"></div>
      <div class="absolute right-[-10rem] top-[18%] h-[18rem] w-[18rem] rounded-full bg-[#d9665e]/5 blur-[100px] md:h-[24rem] md:w-[24rem] dark:bg-amber-400/10"></div>
      <div class="absolute bottom-[-8rem] right-[-6rem] h-[20rem] w-[20rem] rounded-full bg-[#7dd3fc]/5 blur-[100px] md:h-[26rem] md:w-[26rem] dark:bg-emerald-400/10"></div>
      <div class="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:28px_28px] dark:opacity-[0.11] dark:bg-[linear-gradient(to_right,rgba(248,250,252,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(248,250,252,0.18)_1px,transparent_1px)]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),rgba(248,250,252,0.92)_40%,rgba(241,245,249,0.98)_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.72),rgba(15,23,42,0.96)_42%,rgba(2,6,23,1)_100%)]"></div>
    </div>

    <header class="relative z-[160] w-full">
      <Navbar />
    </header>

    <main class="relative z-10 flex flex-1 flex-col w-full pb-8 pt-6 md:pb-10 md:pt-6 bg-transparent dark:bg-slate-950/35">
        <slot />
    </main>

    <SubscribeModal v-model:isOpen="isOpen" />

    <TermsModal :is-open="showTermsModal" />

    <footer class="relative z-10 w-full bg-[#0f172a]">
      <Footer />
    </footer>

  </div>
</template>
