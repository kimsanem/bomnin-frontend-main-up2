<script setup>
useHead({
  title: 'វិញ្ញាសាប្រឡងក្របខណ្ឌ',
});
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
    <section class="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8 lg:py-10">
      <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="font-kantumruy text-xs font-black uppercase tracking-[0.28em] text-amber-500 dark:text-amber-300">
            Exam Center
          </p>
          <h1 class="mt-2 font-kantumruy text-2xl font-black tracking-tight text-slate-950 md:text-4xl dark:text-white">
            វិញ្ញាសាប្រឡងក្របខណ្ឌ
          </h1>
          <p class="mt-3 max-w-2xl font-kantumruy text-sm leading-7 text-slate-500 md:text-base dark:text-slate-400">
            ជ្រើសរើសក្រសួង ឬស្ថាប័ន ដើម្បីចាប់ផ្ដើមអនុវត្តវិញ្ញាសា
          </p>
        </div>

        <NuxtLink
          to="/source?category=g5"
          class="inline-flex items-center justify-center self-start whitespace-nowrap rounded-full border border-amber-400/60 bg-[linear-gradient(135deg,#6f5218,#8f6a21_52%,#b88935)] px-6 py-3 font-kantumruy text-sm font-bold text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_24px_rgba(184,137,53,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.26),0_16px_28px_rgba(184,137,53,0.28)] dark:border-amber-300/35 dark:text-amber-50 md:self-auto"
        >
          វិញ្ញាសាធ្លាប់ប្រឡង
        </NuxtLink>
      </div>

      <div class="overflow-hidden rounded-[2rem] border border-slate-200/80 shadow-[0_24px_80px_rgba(15,23,42,0.12)] dark:border-white/10 dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <ExamMegaMenu />
      </div>
    </section>
  </main>
</template>
