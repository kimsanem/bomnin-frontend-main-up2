<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  answeredLabel: { type: String, default: '' },
  theme: { type: String, default: 'green' },
})

const emit = defineEmits<{
  home: []
  continue: []
}>()

const themeClasses = computed(() => {
  if (props.theme === 'amber') {
    return {
      badge: 'bg-amber-400/15 text-amber-600 ring-1 ring-amber-200/60 dark:text-amber-300 dark:ring-amber-300/15',
      eyebrow: 'text-amber-700/90 dark:text-amber-300/85',
      accent: 'from-amber-500/12 via-amber-400/6 to-transparent dark:from-amber-300/10 dark:via-amber-200/5 dark:to-transparent',
      primary: 'bg-[#cda043] shadow-amber-500/20 hover:bg-amber-600',
    }
  }

  return {
    badge: 'bg-emerald-400/15 text-emerald-600 ring-1 ring-emerald-200/60 dark:text-emerald-300 dark:ring-emerald-300/15',
    eyebrow: 'text-emerald-700/90 dark:text-emerald-300/85',
    accent: 'from-emerald-500/12 via-emerald-400/6 to-transparent dark:from-emerald-300/10 dark:via-emerald-200/5 dark:to-transparent',
    primary: 'bg-[#3eb36a] shadow-emerald-500/20 hover:bg-[#329858]',
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="pause-pop">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      >
        <div class="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/40 bg-white/85 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.28)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/90 md:p-7">
          <div class="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b" :class="themeClasses.accent"></div>

          <div class="relative mb-4 flex items-start gap-3">
            <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl" :class="themeClasses.badge">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 10v4M15 10v4" />
              </svg>
            </span>

            <div>
              <p class="font-kantumruy text-[11px] font-black uppercase tracking-[0.24em]" :class="themeClasses.eyebrow">
                អស្ចារ្យណាស់! សូមអបអរសាទរ!
              </p>
              <h3 class="mt-1 font-kantumruy text-xl font-black leading-tight text-slate-900 dark:text-white">
                លោកអ្នកបានបំពេញកម្រងសំណួរចំនួន {{ answeredLabel }} រួចរាល់។
              </h3>
            </div>
          </div>

          <div class="relative mb-6 rounded-2xl border border-slate-200/80 bg-white/65 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-white/10 dark:bg-white/5">
            <p class="font-kantumruy text-sm leading-7 text-slate-600 dark:text-slate-300">
              អ្នកអាចបន្តអនុវត្តនៅទីនេះ ឬត្រឡប់ទៅទំព័រដើមសិនក៏បាន។
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <button
              @click="emit('home')"
              class="flex-1 rounded-2xl border border-slate-300/70 bg-white/75 px-5 py-3 font-kantumruy text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              ត្រឡប់ទៅទំព័រដើម
            </button>

            <button
              @click="emit('continue')"
              class="flex-1 rounded-2xl px-5 py-3 font-kantumruy text-sm font-black text-white shadow-lg transition active:scale-[0.98]"
              :class="themeClasses.primary"
            >
              បន្តអនុវត្ត
            </button>
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

.pause-pop-enter-active,
.pause-pop-leave-active {
  transition: opacity 0.22s ease;
}

.pause-pop-enter-active > div,
.pause-pop-leave-active > div {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
}

.pause-pop-enter-from,
.pause-pop-leave-to {
  opacity: 0;
}

.pause-pop-enter-from > div,
.pause-pop-leave-to > div {
  opacity: 0;
  transform: scale(0.94) translateY(10px);
}
</style>
