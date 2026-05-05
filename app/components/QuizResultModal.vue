<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  score: { type: [String, Number], default: '' },
  timeSpent: { type: String, default: '' },
  accuracy: { type: [String, Number], default: '' },
  isFastRun: { type: Boolean, default: false },
})

const emit = defineEmits<{
  close: []
  home: []
  continue: []
}>()

const normalizedAccuracy = computed(() => {
  if (props.accuracy === '' || props.accuracy === null || props.accuracy === undefined) {
    return ''
  }

  return String(props.accuracy).includes('%') ? String(props.accuracy) : `${props.accuracy}%`
})

const stats = computed(() => [
  {
    label: 'រយៈពេល',
    value: props.timeSpent || '--:--',
  },
  {
    label: 'ភាពត្រឹមត្រូវ',
    value: normalizedAccuracy.value || '--%',
  },
])
</script>

<template>
  <Teleport to="body">
    <Transition name="result-modal-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-md"
        @click.self="emit('close')"
      >
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
          <div class="absolute left-[-8rem] top-[-5rem] h-64 w-64 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/15"></div>
          <div class="absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-violet-500/20 blur-3xl dark:bg-indigo-500/15"></div>

          <template v-if="isFastRun">
            <span class="particle left-[12%] top-[18%]"></span>
            <span class="particle delay-1 left-[22%] top-[72%]"></span>
            <span class="particle delay-2 left-[78%] top-[22%]"></span>
            <span class="particle delay-3 left-[84%] top-[68%]"></span>
            <span class="particle delay-4 left-[50%] top-[12%]"></span>
            <span class="particle delay-5 left-[58%] top-[82%]"></span>
          </template>
        </div>

        <div
          class="relative w-full max-w-2xl overflow-hidden rounded-[36px] border border-white/40 bg-white/80 p-8 shadow-[0_40px_100px_rgba(15,23,42,0.15)] backdrop-blur-3xl md:p-10 dark:border-white/10 dark:bg-slate-900/90 dark:shadow-[0_40px_100px_rgba(15,23,42,0.35)]"
        >
          <button
            type="button"
            class="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100/80 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Close result modal"
            @click="emit('close')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="grid gap-8">
            <section class="grid justify-items-center text-center">
              <div class="relative inline-flex items-center justify-center">
                <div
                  class="absolute inset-[-18px] rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/20 blur-2xl shadow-[0_0_45px_rgba(249,115,22,0.3)]"
                ></div>

                

                <div class="rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-[3px]">
                  <div
                    class="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-white/95 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:bg-slate-950/95"
                  >
                    <span class="font-kantumruy text-sm font-bold uppercase tracking-[0.26em] text-amber-600 dark:text-amber-300">
                      Score
                    </span>
                    <span class="mt-2 font-kantumruy text-3xl font-black text-slate-950 dark:text-white">
                      {{ score || '-- / --' }}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section class="space-y-3 text-center">
              <h2 class="font-kantumruy text-2xl font-black text-slate-950 dark:text-white">
                អស្ចារ្យណាស់! សូមអបអរសាទរ!
              </h2>
              <p class="mx-auto max-w-xl font-kantumruy text-[15px] leading-7 text-slate-600 dark:text-slate-400">
                សូមអនុវត្តជាប្រចាំ ដើម្បីបង្កើនភាពជោគជ័យ និងប្រាជ្ញា
              </p>
            </section>

            <section class="rounded-[28px] border border-slate-200/70 bg-slate-100/50 p-3 dark:border-white/10 dark:bg-slate-950/40">
              <div class="grid grid-cols-2 divide-x divide-slate-200/80 dark:divide-white/10">
                <div
                  v-for="item in stats"
                  :key="item.label"
                  class="px-4 py-3 text-center"
                >
                  <p class="font-kantumruy text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {{ item.label }}
                  </p>
                  <p class="mt-2 font-kantumruy text-xl font-black text-slate-950 dark:text-white">
                    {{ item.value }}
                  </p>
                </div>
              </div>
            </section>

            <section class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full bg-slate-100 px-5 py-3 font-kantumruy text-sm font-bold text-slate-700 transition hover:bg-slate-200 hover:text-slate-950 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
                @click="emit('home')"
              >
                ទៅទំព័រដើម
              </button>

              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3.5 font-kantumruy text-sm font-black text-white shadow-[0_18px_40px_rgba(79,70,229,0.35)] transition hover:scale-[1.01] hover:shadow-[0_22px_48px_rgba(79,70,229,0.42)] active:scale-95"
                @click="emit('continue')"
              >
                <span>អនុវត្តបន្ត</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m9 5 7 7-7 7" />
                </svg>
              </button>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.font-kantumruy {
  font-family: 'Kantumruy Pro', 'Hanuman', sans-serif;
}

.result-modal-fade-enter-active,
.result-modal-fade-leave-active {
  transition: opacity 0.28s ease;
}

.result-modal-fade-enter-from,
.result-modal-fade-leave-to {
  opacity: 0;
}

.particle {
  position: absolute;
  height: 0.75rem;
  width: 0.75rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(249, 115, 22, 0.85));
  box-shadow: 0 0 18px rgba(249, 115, 22, 0.35);
  animation: drift 3.8s ease-in-out infinite;
}

.delay-1 { animation-delay: 0.4s; }
.delay-2 { animation-delay: 0.8s; }
.delay-3 { animation-delay: 1.2s; }
.delay-4 { animation-delay: 1.6s; }
.delay-5 { animation-delay: 2s; }

@keyframes drift {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(0.9);
    opacity: 0.45;
  }
  50% {
    transform: translate3d(0, -16px, 0) scale(1.08);
    opacity: 1;
  }
}
</style>
