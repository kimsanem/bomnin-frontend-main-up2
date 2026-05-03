<script setup>
import { sectionOneExamGroup } from '~/data/examSectionOne';
import { sectionTwoExamGroup } from '~/data/examSectionTwo';
import { sectionThreeExamGroup } from '~/data/examSectionThree';
import { sectionFourExamGroup } from '~/data/examSectionFour';

const featuredExam = {
  eyebrow: 'Latest Update',
  title: 'វិញ្ញាសាប្រឡងក្របខណ្ឌ',
  description: 'ជ្រើសរើសក្រសួង ឬស្ថាប័ន ដើម្បីចាប់ផ្តើមអនុវត្តិវិញ្ញាសា',
  actionLabel: 'មើលវិញ្ញាសាថ្មីៗ',
  to: '/quiz/no-questions',
};

// Edit this map manually: title, slug, icon, and tint are intentionally local.
const examGroups = [
  sectionOneExamGroup,
  sectionTwoExamGroup,
  sectionThreeExamGroup,
  sectionFourExamGroup,
];

const getMenuLogoSrc = (logo) => {
  if (!logo) return '';

  const normalizedLogo = logo.startsWith('/') ? logo : `/${logo}`;
  return normalizedLogo.replace('/ministry-logos/', '/ministry-logos-optimized/');
};

const optimizedLogoUrls = examGroups.flatMap((group) =>
  group.items
    .filter((item) => item.logo)
    .map((item) => ({
      rel: 'prefetch',
      as: 'image',
      href: getMenuLogoSrc(item.logo),
    }))
);

useHead({
  link: optimizedLogoUrls,
});
</script>

<template>
  <section
    class="w-full border-t-2 border-amber-500 bg-white/95 shadow-[0_28px_90px_rgba(15,23,42,0.16)] backdrop-blur-3xl dark:border-amber-400 dark:bg-slate-950/90 dark:shadow-[0_28px_90px_rgba(0,0,0,0.55)]"
  >
    <div class="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-6 md:px-6 lg:px-8">
      <!-- <aside class="rounded-3xl border border-violet-100/80 bg-gradient-to-br from-violet-50 to-white p-5 shadow-inner dark:border-white/10 dark:from-violet-500/10 dark:to-slate-900/70">
        <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div class="min-w-0">
            <p class="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
              {{ featuredExam.eyebrow }}
            </p>
            <h3 class="font-kantumruy text-xl font-black leading-snug text-slate-950 md:text-2xl dark:text-white">
              {{ featuredExam.title }}
            </h3>
            <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {{ featuredExam.description }}
            </p>
          </div>
          <NuxtLink
            :to="featuredExam.to"
            class="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700 dark:bg-violet-400 dark:text-slate-950 dark:hover:bg-violet-300"
          >
            {{ featuredExam.actionLabel }}
          </NuxtLink>
        </div>
      </aside> -->

      <div class="grid gap-y-8 md:grid-cols-2 md:gap-x-12 xl:grid-cols-4">
        <div v-for="group in examGroups" :key="group.title" class="min-w-0">
          <h4 class="group/section relative mb-4 overflow-hidden rounded-2xl border border-amber-300/70 bg-slate-50/90 px-4 py-3 font-kantumruy text-sm font-black leading-6 text-slate-700 shadow-sm shadow-slate-950/5 dark:border-amber-300/35 dark:bg-white/5 dark:text-slate-100">
            <span class="pointer-events-none absolute inset-y-0 left-0 w-16 bg-[linear-gradient(90deg,rgba(251,191,36,0),rgba(251,191,36,0.18),rgba(251,191,36,0))] animate-exam-feature-sheen"></span>
            <span class="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-amber-300/35 dark:ring-amber-300/20"></span>
            <span class="relative block">{{ group.title }}</span>
          </h4>

          <div class="space-y-2.5">
            <NuxtLink
              v-for="item in group.items"
              :key="item.slug"
              :to="item.slug ? `/quiz/${item.slug}` : '/quiz/no-questions'"
              class="group flex min-h-[5.5rem] items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm shadow-slate-950/5 transition-all hover:-translate-y-0.5 hover:border-slate-100 hover:bg-white hover:shadow-lg hover:shadow-amber-500/5 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/10 dark:hover:border-white/15 dark:hover:bg-white/5"
            >
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-black"
                :class="item.tint"
              >
                <img
                  v-if="item.logo"
                  :src="getMenuLogoSrc(item.logo)"
                  :alt="item.title"
                  width="32"
                  height="32"
                  loading="eager"
                  decoding="async"
                  class="h-8 w-8 object-contain"
                />
                <span v-else>{{ item.icon }}</span>
              </span>
              <span class="line-clamp-2 whitespace-normal text-sm font-bold leading-snug text-slate-700 transition group-hover:text-slate-950 dark:text-slate-200 dark:group-hover:text-white">
                {{ item.title }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes exam-feature-sheen {
  0% {
    transform: translateX(-140%);
    opacity: 0;
  }
  18% {
    opacity: 1;
  }
  42% {
    transform: translateX(320%);
    opacity: 0.9;
  }
  100% {
    transform: translateX(320%);
    opacity: 0;
  }
}

.animate-exam-feature-sheen {
  animation: exam-feature-sheen 3.6s ease-in-out infinite;
}
</style>
