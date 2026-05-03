<script setup>
const emit = defineEmits(['navigate']);
</script>

<template>
  <footer class="border-t border-white/10 bg-[#0b1221] py-5 font-kantumruy text-sm text-gray-300">
    <div class="container mx-auto px-6 max-w-7xl">
      
      <div class="grid grid-cols-1 gap-y-5 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-6">
        
        <!-- Column 1: PCC Branding (Span 4) -->
        <div class="lg:col-span-3 space-y-4 pr-4">
            <h2 class="text-white font-black text-3xl tracking-wider">PCC</h2>
            
            <div class="border-l-4 border-blue-600 pl-5 py-1">
                <p class="text-sm italic leading-6 text-white/60">
                    "ចម្រាញ់ 'អាវុធបញ្ញា' ដើម្បីពង្រឹងសិទ្ធិ សេរីភាព និងស្វ័យភាពបុគ្គល ក្នុង សង្គមឌីជីថល"
                </p>
            </div>

            <div class="text-xs font-medium text-white/60">
                <p>Powered by PCC | ក្រោមកម្មវិធី HCP Cooperation</p>
            </div>
        </div>

        <!-- Column 2: System Info (Span 3) -->
        <div class="lg:col-span-3 space-y-4">
            <h3 class="text-white text-lg border-b border-gray-800 pb-2 inline-block">ប្រព័ន្ធបំណិនមន្ត្រីវិទ្យា</h3>
            
            <ul class="space-y-3">
                <li class="flex items-start gap-3 group">
                    <div class="mt-0.5 text-blue-500 group-hover:text-blue-400 transition-colors">
                         <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" shape-rendering="crispEdges"><path fill="#5D9CEC" d="M7,1 h6 v2 h2 v2 h2 v2 h-14 v-2 h2 v-2 h2 v-2 z M1,7 h18 v2 h-2 v6 h2 v2 h-18 v-2 h2 v-6 h-2 v-2 z"/><path fill="#4A5A3A" d="M4,9 h2 v6 h-2 z M7,9 h2 v6 h-2 z M10,9 h2 v6 h-2 z M13,9 h2 v6 h-2 z"/><path fill="#3A6EA5" d="M1,7 h1 v2 h-1 z M18,7 h1 v2 h-1 z M3,9 h1 v6 h-1 z M6,9 h1 v6 h-1 z M9,9 h1 v6 h-1 z M12,9 h1 v6 h-1 z M15,9 h1 v6 h-1 z M1,15 h2 v2 h-2 z M17,15 h2 v2 h-2 z M3,17 h14 v1 h-14 z"/></svg>
                    </div>
                    <div class="leading-tight">
                        <span class="text-blue-400 block mb-1">មូលដ្ឋានគ្រឹះ:</span> 
                        <span class="text-white/60">ទ្រឹស្ដីសេរីភាព និងស្វ័យភាព</span>
                    </div>
                </li>
                <li class="flex items-start gap-3 group">
                    <div class="text-blue-500 group-hover:text-blue-400 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 16 10" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="2" y="1" width="12" height="8" fill="#5B9EFF"/><rect x="3" y="2" width="10" height="6" fill="#73B5FF"/><rect x="1" y="3" width="1" height="4" fill="#2E4A85"/><rect x="14" y="3" width="1" height="4" fill="#2E4A85"/><rect x="2" y="1" width="1" height="2" fill="#2E4A85"/><rect x="13" y="1" width="1" height="2" fill="#2E4A85"/><rect x="2" y="7" width="1" height="2" fill="#2E4A85"/><rect x="13" y="7" width="1" height="2" fill="#2E4A85"/><rect x="3" y="0" width="10" height="1" fill="#2E4A85"/><rect x="3" y="9" width="10" height="1" fill="#2E4A85"/><rect x="4" y="4" width="1" height="3" fill="#2E4A85"/><rect x="3" y="5" width="3" height="1" fill="#2E4A85"/><rect x="10" y="4" width="1" height="1" fill="#2E4A85"/><rect x="12" y="4" width="1" height="1" fill="#2E4A85"/><rect x="11" y="5" width="1" height="1" fill="#2E4A85"/><rect x="13" y="5" width="1" height="1" fill="#2E4A85"/><rect x="11" y="3" width="2" height="1" fill="#2E4A85"/><rect x="12" y="6" width="1" height="1" fill="#2E4A85"/><rect x="7" y="6" width="2" height="1" fill="#2E4A85"/></svg>
                    </div>
                    <div class="leading-tight">
                        <span class="text-blue-400 block mb-1">បច្ចេកវិទ្យា:</span> 
                        <span class="text-white/60">ប្រព័ន្ធសិក្សាឌីជីថលបែបកំសាន្ត</span>
                    </div>
                </li>
                <li class="flex items-start gap-3 group">
                    <div class="text-blue-500 group-hover:text-blue-400 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.00001 0.742401L10.1663 5.13163L15.0117 5.83567L11.5059 9.25319L12.3332 14.0792L8.00001 11.8008L3.66687 14.0792L4.49419 9.25319L0.988327 5.83567L5.83372 5.13163L8.00001 0.742401Z" fill="#4A90E2"/></svg>
                    </div>
                    <div class="leading-tight">
                        <span class="text-blue-400 block mb-1">ខ្លឹមសារ:</span> 
                        <span class="text-white/60">បំណិន ១២ មុំ នៃប្រភពបញ្ញា</span>
                    </div>
                </li>
            </ul>


            <NuxtLink
                to="/about"
                class="inline-block px-5 py-2 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 hover:bg-white/5 transition-all text-sm font-medium"
                >
                ស្វែងយល់អំពីយើង
            </NuxtLink>
        </div>

        <!-- Column 3: Partners (Span 2) -->
        <div class="lg:col-span-3 space-y-4">
            <h3 class="text-white text-lg border-b border-gray-800 pb-2 inline-block">ដៃគូយុទ្ធសាស្ត្រ</h3>
            
            <div class="space-y-3">
                <!-- TREE -->
                <div class="bg-[#111827] px-3 py-2.5 rounded-xl flex items-center gap-4 border border-gray-800 hover:border-gray-700 transition-colors group cursor-default">
                    <!-- <div class="text-green-500 p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                           <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                        </svg>
                    </div> -->
                    <div>
                        <h4 class="text-white font-bold tracking-wide">TREE</h4>
                    </div>
                </div>

                <!-- FRUIT -->
                <div class="bg-[#111827] px-3 py-2.5 rounded-xl flex items-center gap-4 border border-gray-800 hover:border-gray-700 transition-colors group cursor-default">
                     <!-- <div class="text-orange-500 p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                           <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                        </svg>
                     </div> -->
                    <div>
                        <h4 class="text-white font-bold tracking-wide">FRUIT</h4>
                    </div>
                </div>
            </div>
        </div>

        <!-- Column 4: Contact (Span 3) -->
        <div class="lg:col-span-3 space-y-4">
            <h3 class="text-white text-lg border-b border-gray-800 pb-2 inline-block">ទំនាក់ទំនង</h3>
            
            <ul class="space-y-3 text-sm">
                <li class="group">
                    <div class="flex items-center gap-3">
                    <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded bg-blue-900/20 text-blue-500 transition-colors group-hover:bg-blue-900/40">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                    </div>
                    <span class="text-white/60 transition-colors group-hover:text-gray-300">scientia.officialis.9@gmail.com</span>
                    </div>
                </li>
                <li class="group">
                    <div class="flex items-center gap-3">
                    <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded bg-blue-900/20 text-blue-500 transition-colors group-hover:bg-blue-900/40">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                    </div>
                    <span class="text-white/60 transition-colors group-hover:text-gray-300">+855 10 299 242</span>
                    </div>
                </li>
                <li class="group">
                    <div class="flex items-start gap-3">
                    <div class="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded bg-blue-900/20 text-blue-500 transition-colors group-hover:bg-blue-900/40"> 
                        <a href="https://maps.app.goo.gl/HwsxEfvUGuJpM5TF9" target="_blank" class="flex h-9 w-9 items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg></a>
                    </div>
                    <a href="https://maps.app.goo.gl/HwsxEfvUGuJpM5TF9" target="_blank" class="text-sm leading-relaxed text-white/60 transition-colors group-hover:text-gray-300">Aquation អគារ D3A, ផ្លូវកោះពេជ្រ, រាជធានីភ្នំពេញ</a>
                    </div>
                </li>
            </ul>

            <!-- Social Media-->
            <div class="flex flex-col items-center">
                <p class="mb-2 text-center text-xs font-bold uppercase tracking-wider text-white/60">បណ្តាញសង្គម</p>
                <div class="flex items-center justify-center gap-3">
                    <a href="https://www.facebook.com/PresentCentre" target="_blank" class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-900/50 transition-all hover:scale-110 hover:bg-blue-500">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                    </a>
                    <a href="https://t.me/ScientiaOfficialis" target="_blank" class="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-900/50 transition-all hover:scale-110 hover:bg-sky-400">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.944z"/></svg>
                    </a>
                    <!-- <a href="#" class="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white hover:bg-blue-600 hover:scale-110 transition-all shadow-lg shadow-blue-900/50">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a> -->
                </div>
            </div>
        </div>

      </div>

      <!-- Divider -->
      <div class="mt-5 w-full border-t border-white/10"></div>

      <!-- Copyright -->
      <div class="mt-4 flex flex-col items-center gap-2 text-center text-xs text-white/60">
        <div>
          © 2026 PCC. រក្សាសិទ្ធិគ្រប់យ៉ាង
        </div>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <NuxtLink to="/privacy" class="hover:text-blue-400 transition-colors">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms" class="hover:text-blue-400 transition-colors">Terms of Service</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
