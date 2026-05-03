<script setup>
import { ref, onUnmounted } from 'vue';

const showVisionModal = ref(false);

const openVisionModal = () => {
  showVisionModal.value = true;
  document.body.style.overflow = 'hidden';
};

const closeVisionModal = () => {
  showVisionModal.value = false;
  document.body.style.overflow = '';
};

// Ensure scroll is restored if component is destroyed while modal is open
onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="min-h-screen font-kantumruy rounded-3xl">
    
    <!-- 1. Top Banner (Blue) with Decorative Patterns -->
    <div class="w-full max-w-7xl mx-auto md:pt-10 lg:pt-4 px-4">
        <div class="bg-[#003399] text-white py-12 md:py-20 px-4 relative overflow-hidden rounded-3xl shadow-xl border border-blue-400/30 group">
            
            <!-- Decorative Pattern Left -->
            <div class="absolute left-0 top-0 bottom-0 w-48 md:w-96 overflow-hidden opacity-25 pointer-events-none">
                 <svg class="w-full h-full text-blue-200/40 fill-current" preserveAspectRatio="xMinYMid slice">
                    <defs>
                        <pattern id="kbach-pattern-left" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                             <!-- Authentic Kbach Lattice Pattern -->
                             <g transform="translate(40,40)">
                                <!-- Diamond Outline -->
                                <path d="M0 -40 L40 0 L0 40 L-40 0 Z" fill="none" stroke="currentColor" stroke-width="1.5" />
                                <!-- Inner Flower -->
                                <path d="M0 -25 Q10 -10 25 0 Q10 10 0 25 Q-10 10 -25 0 Q-10 -10 0 -25" fill="currentColor" opacity="0.6" />
                                <!-- Center Dot -->
                                <circle cx="0" cy="0" r="4" fill="currentColor" />
                                <!-- Corner Accents -->
                                <circle cx="0" cy="-40" r="2" fill="currentColor" opacity="0.8" />
                                <circle cx="40" cy="0" r="2" fill="currentColor" opacity="0.8" />
                                <circle cx="0" cy="40" r="2" fill="currentColor" opacity="0.8" />
                                <circle cx="-40" cy="0" r="2" fill="currentColor" opacity="0.8" />
                             </g>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#kbach-pattern-left)" />
                 </svg>
                 <!-- Gradient Overlay: Transparent at edge -> Blue at center -->
                 <div class="absolute inset-0 bg-gradient-to-r from-transparent via-[#003399]/40 to-[#003399]"></div>
            </div>

            <!-- Decorative Pattern Right -->
            <div class="absolute right-0 top-0 bottom-0 w-48 md:w-96 overflow-hidden opacity-25 pointer-events-none transform scale-x-[-1]">
                 <svg class="w-full h-full text-blue-200/40 fill-current" preserveAspectRatio="xMinYMid slice">
                    <defs>
                        <pattern id="kbach-pattern-right" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                             <!-- Authentic Kbach Lattice Pattern (Same as left) -->
                             <g transform="translate(40,40)">
                                <path d="M0 -40 L40 0 L0 40 L-40 0 Z" fill="none" stroke="currentColor" stroke-width="1.5" />
                                <path d="M0 -25 Q10 -10 25 0 Q10 10 0 25 Q-10 10 -25 0 Q-10 -10 0 -25" fill="currentColor" opacity="0.6" />
                                <circle cx="0" cy="0" r="4" fill="currentColor" />
                                <circle cx="0" cy="-40" r="2" fill="currentColor" opacity="0.8" />
                                <circle cx="40" cy="0" r="2" fill="currentColor" opacity="0.8" />
                                <circle cx="0" cy="40" r="2" fill="currentColor" opacity="0.8" />
                                <circle cx="-40" cy="0" r="2" fill="currentColor" opacity="0.8" />
                             </g>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#kbach-pattern-right)" />
                 </svg>
                 <div class="absolute inset-0 bg-gradient-to-r from-transparent via-[#003399]/40 to-[#003399]"></div>
            </div>

            <!-- Subtle Texture in Center -->
            <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            
            <div class="max-w-4xl mx-auto text-center relative z-10 px-4">
                <h1 class="font-kantumruy text-2xl md:text-4xl drop-shadow-md tracking-wide flex flex-col gap-2 md:gap-3">
                    <span>ភាពជោគជ័យដ៏អស្ចារ្យ</span>
                    <span>ផ្ដើមចេញពីការស្គាល់ឫសគល់នៃជាតិ</span>
                    <span>និងស្រុកទេសរបស់ខ្លួនបានច្បាស់ល្អ !</span>
                </h1>
            </div>
        </div>
    </div>

    <div class="max-w-5xl mx-auto p-4 md:p-8 space-y-10  relative z-20">

        <!-- 2. Vision & Special Points -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Vision Card (Updated with See More) -->
            <div class="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100 relative overflow-hidden flex flex-col items-center text-center group hover:shadow-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)] dark:backdrop-blur-xl">
                <div class="inline-flex items-center gap-3 bg-[#1e3a8a] text-white px-6 py-2 rounded-full mb-6 shadow-md">
                    <img class="w-8 h-8 object-contain" :src="'/icons/special/2.png'" alt="">
                    <h2 class="font-kantumruy text-2xl leading-none">ទស្សនវិស័យនៃការបង្កើត</h2>
                </div>
                
                <p class="text-gray-600 leading-relaxed text-md md:text-xl mb-6 line-clamp-4 md:line-clamp-none dark:text-slate-200">
                    ទស្សនវិជ្ជានេះគឺជាគ្រឹះដ៏រឹងមាំនៃប្រព័ន្ធបំណិនមន្ត្រីវិទ្យា។ យើងជឿជាក់ថាបុគ្គលម្នាក់អាចសម្រេចបាននូវសមិទ្ធផលដ៏ឧត្តុង្គឧត្តមទៅបានលុះត្រាតែមានការយល់ដឹងស៊ីជម្រៅអំពីអត្តសញ្ញាណ និងមូលដ្ឋានគ្រឹះនៃមាតុភូមិរបស់ខ្លួនជាមុនសិន។
                </p>
                <p class="text-gray-600 leading-relaxed text-md md:text-xl mb-6 line-clamp-4 md:line-clamp-none dark:text-slate-200">
                    ការដឹងច្បាស់ពីឫសគល់គឺជាការបំពាក់នូវ «អាវុធបញ្ញា» ដើម្បីពង្រឹងសិទ្ធិសេរីភាពនិងស្វ័យភាពរបស់បុគ្គលម្នាក់ៗឱ្យមានភាពម្ចាស់ការលើការគិត និងការសម្រេចចិត្តប្រកបដោយមនសិការ។  វាប្រៀបបានទៅនឹង «ដើមឈើជីវិត» ដែលមានឫសចាក់ចុះយ៉ាងជ្រៅទៅក្នុងដីដើម្បីស្រូបយកជីវជាតិមកចិញ្ចឹមដើមឱ្យរីកលូតលាស់រឹងមាំនិងផ្ដល់ជាម្លប់ដ៏ត្រជាក់ត្រជុំដល់សង្គមជាតិទាំងមូល។
                </p>

                <button 
                    @click="openVisionModal"
                    class="mt-auto text-[#1e3a8a] font-bold text-lg flex items-center gap-1 hover:gap-2 transition-all group-hover:underline decoration-yellow-400 decoration-2 underline-offset-4 dark:text-sky-300"
                >
                    អានបន្ថែម (See More)
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </button>
            </div>

            <!-- Special Points -->
            <div class="flex flex-col h-full">
                <h2 class="font-kantumruy text-2xl text-center mb-4 text-gray-800 md:hidden dark:text-slate-100">ចំណុចពិសេស</h2>
        
                <div class="bg-white/50 md:bg-white md:rounded-3xl md:shadow-lg md:border md:border-gray-100 p-0 md:p-8 h-full flex flex-col justify-center space-y-3 dark:bg-transparent md:dark:border-white/10 md:dark:bg-slate-900/80 md:dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)] md:dark:backdrop-blur-xl">
                    <div class="flex w-fit mx-auto items-center gap-3 bg-[#1e3a8a] text-white px-6 py-2 rounded-full mb-6 shadow-md">
                        <img class="w-8 h-8 object-contain" :src="'/icons/block/block2.png'" alt="">
                        <h2 class="font-kantumruy text-2xl leading-none text-center">ចំណុចពិសេស</h2>
                    </div>
                        
                    <div class="bg-white md:bg-gray-50 rounded-xl p-4 shadow-sm md:shadow-none border border-gray-100 md:border-transparent flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default dark:border-white/10 dark:bg-slate-950/55 md:dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                        <div class="text-blue-600 p-2.5 rounded-lg">
                            <img class="w-7 h-7 object-contain" :src="'/icons/special/1.png'" alt="ងាយយល់">
                        </div>
                        <span class="font-kantumruy text-md font-bold md:text-lg text-gray-700 dark:text-slate-100">ងាយយល់</span>
                    </div>

                    <div class="bg-white md:bg-gray-50 rounded-xl p-4 shadow-sm md:shadow-none border border-gray-100 md:border-transparent flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default dark:border-white/10 dark:bg-slate-950/55 md:dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                        <div class="text-green-600 p-2.5 rounded-lg">
                            <img class="w-7 h-7 object-contain" :src="'/icons/special/2.png'" alt="ងាយចាំ">
                        </div>
                        <span class="font-kantumruy text-md font-bold md:text-lg text-gray-700 dark:text-slate-100">ងាយចាំ (Gamification)</span>
                    </div>

                    <div class="bg-white md:bg-gray-50 rounded-xl p-4 shadow-sm md:shadow-none border border-gray-100 md:border-transparent flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default dark:border-white/10 dark:bg-slate-950/55 md:dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                        <div class="text-blue-600 p-2.5 rounded-lg">
                            <img class="w-7 h-7 object-contain" :src="'/icons/special/3.png'" alt="ច្បាស់លាស់">
                        </div>
                        <span class="font-kantumruy text-md font-bold md:text-lg text-gray-700 dark:text-slate-100">ច្បាស់លាស់</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. 12 Pillars (Icons Only) -->
       <div class="bg-slate-100 rounded-3xl p-6 text-center shadow-inner dark:border dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_70px_rgba(0,0,0,0.28)]">
            <h2 class="font-kantumruy text-2xl text-[#1e3a8a] mb-6 dark:text-sky-200">មុំទាំង ១២ នៃចំណេះដឹង</h2>
            <div class="flex flex-wrap justify-center gap-3 md:gap-5">
                <div v-for="i in 12" :key="i" class="w-12 h-12 md:w-18 md:h-18 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm text-gray-400 hover:text-[#1e3a8a] hover:scale-110 transition-all duration-300 dark:border dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-400 dark:shadow-[0_12px_28px_rgba(0,0,0,0.25)] dark:hover:text-sky-300">
                    <img v-if="i===1" :src="'/icons/categories/1.png'" class="w-12 h-12 md:w-18 md:h-18 object-contain">
                    <img v-else-if="i===2" :src="'/icons/categories/2.png'" class="w-12 h-12 md:w-18 md:h-18 object-contain">
                    <img v-else-if="i===3" :src="'/icons/categories/3.png'" class="w-12 h-12 md:w-18 md:h-18 object-contain">
                    <img v-else-if="i===4" :src="'/icons/categories/4.png'" class="w-12 h-12 md:w-18 md:h-18 object-contain">
                    <img v-else-if="i===5" :src="'/icons/categories/5.png'" class="w-12 h-12 md:w-18 md:h-18 object-contain">
                    <img v-else-if="i===6" :src="'/icons/categories/6.png'" class="w-12 h-12 md:w-18 md:h-18 object-contain">
                    <img v-else-if="i===7" :src="'/icons/categories/7.png'" class="w-12 h-12 md:w-18 md:h-18 object-contain">
                    <img v-else-if="i===8" :src="'/icons/categories/8.png'" class="w-12 h-12 md:w-18 md:h-18 object-contain">
                    <img v-else-if="i===9" :src="'/icons/categories/9.png'" class="w-12 h-12 md:w-18 md:h-18 object-contain">
                    <img v-else-if="i===10" :src="'/icons/categories/10.png'" class="w-12 h-12 md:w-18 md:h-18 object-contain">
                    <img v-else-if="i===11" :src="'/icons/categories/11.png'" class="w-12 h-12 md:w-18 md:h-18 object-contain">
                    <img v-else-if="i===12" :src="'/icons/categories/12.png'" class="w-12 h-12 md:w-18 md:h-18 object-contain">
                </div>
            </div>
        </div>

        <!-- 4. Tree of Life (Visual) -->
        <div class="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 relative overflow-hidden dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)] dark:backdrop-blur-xl">
            <!-- Background Gradient -->
            <div class="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-50 z-0 dark:from-slate-950/70 dark:to-slate-900/30 dark:opacity-100"></div>
            
            <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div class="space-y-6">
                    <h3 class="font-kantumruy text-2xl text-gray-800 text-center dark:text-slate-100">"Tree of Life"</h3>
                    <p class="text-gray-600 italic leading-relaxed text-md md:text-lg dark:text-slate-200">
                        "Tree of Life" ឬ "ដើមឈើជីវិត" តំណាងឱ្យការលូតលាស់នៃចំណេះដឹង។ ការសិក្សាប្រៀបដូចជាការដាំដើមឈើ ចាប់ផ្តើមពីគ្រាប់ពូជ រហូតដល់ក្លាយជាដើមឈើធំដែលផ្ដល់ផ្លែផ្កា។ ប្រព័ន្ធរបស់យើងប្រើប្រាស់វិធីសាស្ត្រ Gamification ដើម្បីធ្វើឱ្យការសិក្សាកាន់តែមានប្រសិទ្ធភាព។
                    </p>
                    <div class="flex justify-center md:justify-start items-center gap-6 md:gap-12 mt-4">
                        <div class="flex flex-col items-center">
                            <img :src="'/icons/tree_evolution/1.png'" :class="'w-7 h-7 object-contain mb-4'" alt="Seedling">
                            <span class="font-kantumruy text-md md:text-lg text-gray-600 dark:text-slate-300">គ្រាប់ពូជ</span>
                        </div>
                        <div class="text-gray-300 dark:text-slate-500">➜</div>
                        <div class="flex flex-col items-center">
                           <img :src="'/icons/tree_evolution/2.png'" :class="'w-7 h-7 object-contain mb-4'" alt="Sapling">
                            <span class="font-kantumruy text-md md:text-lg text-gray-600 dark:text-slate-300">កូនឈើ</span>
                        </div>
                        <div class="text-gray-300 dark:text-slate-500">➜</div>
                        <div class="flex flex-col items-center">
                            <img :src="'/icons/tree_evolution/3.png'" :class="'w-7 h-7 object-contain mb-4'" alt="Mature Tree">
                            <span class="font-kantumruy text-md md:text-lg text-gray-600 dark:text-slate-300">ដើមឈើធំ</span>
                        </div>
                    </div>
                </div>
                <div class="flex justify-center">
                    <div class="w-full max-w-[400px] h-full rounded-2xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-105 transition-transform duration-500 dark:border-white/10 dark:shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
                         <img :src="'/icons/tree_evolution/4.png'" class="w-full h-full object-cover" alt="Tree">
                    </div>
                </div>
            </div>
        </div>

        <!-- 5. Commitment (Restyled) -->
        <div class="px-2">
             <div class="bg-white border-4 double-border-gold rounded-2xl p-8 md:p-12 text-center shadow-md relative max-w-4xl mx-auto dark:bg-slate-900/80 dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)]">
                <h2 class="font-kantumruy text-2xl leading-none text-red-800 mb-6">ការប្តេជ្ញាចិត្តរបស់យើង</h2>
                <p class="text-gray-600 leading-relaxed max-w-3xl mx-auto font-medium text-md md:text-xl dark:text-slate-200">
                    ការប្តេជ្ញាចិត្តដ៏មោះមុតបំផុតរបស់យើង គឺការរក្សានូវ «តម្លាភាព និងភាពត្រឹមត្រូវ» ជាដាច់ខាត ។ រាល់សំណួរ ចម្លើយ និង «ខ្លឹមសារសង្ខេប» ទាំងអស់នៅក្នុងប្រព័ន្ធនេះ មិនមែនជាការប្រឌិតឡើយ ប៉ុន្តែត្រូវបានចម្រាញ់ចេញពីឯកសារគោលនយោបាយ ច្បាប់ និងបទដ្ឋានយោងផ្លូវការដែលត្រូវបានផ្ទៀងផ្ទាត់យ៉ាងហ្មត់ចត់បំផុត។ យើងធានាជូននូវប្រភពឯកសារដែលច្បាស់លាស់ ដើម្បីឱ្យអ្នកសិក្សាទទួលបាននូវចំណេះដឹងដែលជាការពិត និងអាចយកទៅប្រើប្រាស់ជាផ្លូវការបានដោយទំនុកចិត្តខ្ពស់បំផុត។
                </p>
             </div>
        </div>

       
        <!-- <div class="space-y-6">
            <h2 class="font-kantumruy text-4xl text-center text-[#1e3a8a] -mt-4">ស្ថាបនិក និងអ្នកអភិវឌ្ឍន៍</h2>
            <div class="flex w-fit mx-auto items-center justify-center gap-3 bg-[#1e3a8a] text-white p-3 rounded-full mb-6 shadow-md">
                <h2 class="font-kantumruy text-2xl leading-none text-center">ស្ថាបនិក និងអ្នកអភិវឌ្ឍន៍</h2>
            </div>
            
            
            <div class="bg-white rounded-3xl shadow-md p-6 border border-gray-100 flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto hover:shadow-lg transition-shadow dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                <div class="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 relative">
                    <div class="absolute inset-0 bg-blue-100 rounded-full transform rotate-6"></div>
                    <img src="/logo.png" class="w-full h-full rounded-full object-cover border-4 border-white shadow-md relative z-10" alt="Founder">
                </div>
                <div class="text-center md:text-left flex-1">
                    <h3 class="font-kantumruy text-xl text-[#1e3a8a]">លោក ម៉ៅ ឌួង ស៊ូ - Mao Doung SOU</h3>
                    <p class="text-xs  text-gray-400 uppercase tracking-widest mb-3 dark:text-slate-400">ស្ថាបនិក និងចក្ខុវិស័យ (Founder & Visionary)</p>
                    <p class="text-gray-600 text-sm italic leading-relaxed bg-gray-50 p-4 rounded-xl border-l-4 border-blue-500 dark:bg-slate-950/55 dark:text-slate-200 dark:border-sky-400">
                        "ជាស្ថាបនិកនៃមជ្ឈមណ្ឌល PCC និងជាម្ចាស់ទ្រឹស្ដីនៃ ប្រព័ន្ធបំណិនមន្ត្រីវិទ្យា។ លោកមានចក្ខុវិស័យក្នុងការកសាងធនធានមនុស្សតាមរយៈការចម្រាញ់ «អាវុធបញ្ញា» ចេញពីឫសគល់នៃជាតិ និងស្រុកទេសរបស់ខ្លួន ដើម្បីពង្រឹងសិទ្ធិសេរីភាព និងស្វ័យភាពរបស់បុគ្គលម្នាក់ៗក្នុងសង្គមឌីជីថល។"
                    </p>
                </div>
            </div>

            
            <div class="bg-white rounded-3xl shadow-md p-6 border border-gray-100 flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto hover:shadow-lg transition-shadow dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                <div class="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 relative">
                    <div class="absolute inset-0 bg-green-100 rounded-full transform -rotate-6"></div>
                    <img src="/logo.png" class="w-full h-full rounded-full object-cover border-4 border-white shadow-md relative z-10" alt="Tech Lead">
                </div>
                <div class="text-center md:text-left flex-1">
                     <h3 class="font-kantumruy text-xl text-[#1e3a8a]">លោក ឯម គីមសាន - Em Kimsan</h3>
                    <p class="text-xs text-gray-400 uppercase tracking-widest mb-3 dark:text-slate-400">ប្រធានផ្នែកអភិវឌ្ឍន៍បច្ចេកវិទ្យា (Technology Development)</p>
                    <p class="text-gray-600 text-sm italic leading-relaxed bg-gray-50 p-4 rounded-xl border-l-4 border-blue-500 dark:bg-slate-950/55 dark:text-slate-200 dark:border-sky-400">
                        "ជាអ្នកដឹកនាំ PCC Engineering Lab ក្នុងការបង្កើត និងដំឡើងរចនាសម្ព័ន្ធបច្ចេកវិទ្យាឌីជីថល ដោយមានការសហការយ៉ាងជិតស្និទ្ធជាមួយ TREE សម្រាប់ប្រព័ន្ធទាំងមូល។ លោកដើរតួនាទីយ៉ាងសំខាន់ក្នុងការបំប្លែងចក្ខុវិស័យរបស់ស្ថាបនិក ឱ្យក្លាយជាប្រព័ន្ធសិក្សាបែបទំនើប (Gamified Learning) ដែលមានភាពរលូន សុវត្ថិភាព និងផ្តល់នូវបទពិសោធន៍សិក្សាដ៏ជក់ចិត្ត។"
                    </p>
                </div>
            </div>

        </div> -->

    </div>

    <!-- Vision Modal (Full Content) -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
        <div v-if="showVisionModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div @click.self="closeVisionModal" class="absolute inset-0"></div>
            
            <div class="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl border border-gray-200 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
                 <!-- Modal Header Background -->
                 <div class="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center dark:border-white/10 dark:bg-slate-900/95">
                    <h2 class="font-kantumruy text-lg md:text-xl text-[#1e3a8a] pl-2 dark:text-sky-200">ខ្លឹមសារលម្អិត</h2>
                    <button @click="closeVisionModal" class="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors dark:text-slate-300 dark:hover:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                 </div>

                 <!-- Modal Content -->
                 <div class="p-6 md:p-10 space-y-12">
                    
                    <!-- 1. Philosophy -->
                    <section>
                        <div class="flex items-center gap-3 mb-6">
                            <span class="bg-[#b45309] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md ring-2 ring-orange-100 font-bold font-kantumruy dark:ring-amber-300/20">១</span>
                            <h3 class="font-kantumruy text-xl text-[#b45309]">ទស្សនវិស័យនៃការបង្កើត (Our Philosophy)</h3>
                        </div>
                         <blockquote class="text-xl font-kantumruy text-[#1e3a8a] text-center my-6 leading-relaxed md:reading-relaxed relative bg-blue-50 p-6 rounded-2xl border border-blue-100 dark:border-sky-300/20 dark:bg-sky-950/30 dark:text-sky-100">
                            "ភាពជោគជ័យដ៏អស្ចារ្យ ផ្តើមចេញពីការស្គាល់ឫសគល់នៃជាតិ និងស្រុកទេសរបស់ខ្លួនបានច្បាស់លាស់ល្អ"
                        </blockquote>
                        <div class="text-gray-700 leading-relaxed text-justify space-y-4 dark:text-slate-200">
                            <p>ទស្សនវិជ្ជានេះគឺជាគ្រឹះដ៏រឹងមាំនៃប្រព័ន្ធបំណិនមន្ត្រីវិទ្យា។ យើងជឿជាក់ថាបុគ្គលម្នាក់អាចសម្រេចបាននូវសមិទ្ធផលដ៏ឧត្តុង្គឧត្តមទៅបានលុះត្រាតែមានការយល់ដឹងស៊ីជម្រៅអំពីអត្តសញ្ញាណនិងមូលដ្ឋានគ្រឹះនៃមាតុភូមិរបស់ខ្លួនជាមុនសិន។</p>
                            <p>ការដឹងច្បាស់ពីឫសគល់គឺជាការបំពាក់នូវ«អាវុធបញ្ញា»ដើម្បីពង្រឹងសិទ្ធិសេរីភាពនិងស្វ័យភាពរបស់បុគ្គលម្នាក់ៗឱ្យមានភាពម្ចាស់ការលើការគិតនិងការសម្រេចចិត្តប្រកបដោយមនសិការ។វាប្រៀបបានទៅនឹង«ដើមឈើជីវិត»ដែលមានឫសចាក់ចុះយ៉ាងជ្រៅទៅក្នុងដីដើម្បីស្រូបយកជីវជាតិមកចិញ្ចឹមដើមឱ្យរីកលូតលាស់រឹងមាំនិងផ្ដល់ជាម្លប់ដ៏ត្រជាក់ត្រជុំដល់សង្គមជាតិទាំងមូល។</p>
                            <p>ដើម្បីសម្រេចបាននូវចក្ខុវិស័យនេះយើងបានខិតខំចម្រាញ់និងបំប្លែងរាល់ឯកសារគោលនយោបាយច្បាប់និងបទដ្ឋានបច្ចេកទេសសំខាន់ៗរាប់ម៉ឺនទំព័រឱ្យមកត្រឹមជា«ខ្លឹមសារសង្ខេប(Key-Summary)»ដែលមានលក្ខណៈ៖</p>
                        </div>
                        
                        <!-- Key Summary Box -->
                        <div class="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 mt-6 shadow-sm mb-6 dark:border-sky-300/20 dark:from-slate-950/70 dark:to-slate-900/40">
                            <h4 class="font-kantumruy text-[#1e3a8a] mb-4 text-center border-b border-blue-200 pb-2 inline-block px-8 dark:border-sky-300/20 dark:text-sky-200">ខ្លឹមសារសង្ខេប (Key Summary)</h4>
                            <ul class="space-y-4 mt-2">
                                <li class="flex items-start gap-3">
                                    <span class="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 dark:bg-emerald-400/15 dark:text-emerald-300">✓</span>
                                    <div class="text-black dark:text-slate-200"><strong>ងាយយល់៖</strong> បកស្រាយខ្លឹមសារបច្ចេកទេសស្មុគស្មាញ ឱ្យក្លាយជាចំណេះដឹងដែលងាយស្រូបយក។</div>
                                </li>
                                <li class="flex items-start gap-3">
                                    <span class="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 dark:bg-emerald-400/15 dark:text-emerald-300">✓</span>
                                    <div class="text-black dark:text-slate-200"><strong>ងាយចាំ៖</strong> រៀបចំជាប្រព័ន្ធពហុចម្លើយ (MCQ) ដើម្បីពង្រឹងការចងចាំ និងការអនុវត្តជាក់ស្ដែង។</div>
                                </li>
                                <li class="flex items-start gap-3">
                                    <span class="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 dark:bg-emerald-400/15 dark:text-emerald-300">✓</span>
                                    <div class="text-black dark:text-slate-200"><strong>ច្បាស់លាស់៖</strong> រាល់បំណកស្រាយទាំងអស់ សុទ្ធតែមានការបញ្ជាក់ពីប្រភពឯកសារយោងត្រឹមត្រូវ និងច្បាស់លាស់បំផុត។</div>
                                </li>
                            </ul>
                        </div>
                        <div class="text-gray-700 leading-relaxed text-justify space-y-4 dark:text-slate-200">
                            <p>«បំណិនមន្ត្រីវិទ្យា»គឺជាឃ្លាំងបញ្ញាដ៏ទូលំទូលាយដែលរៀបចំឡើងដើម្បីពង្រីកសក្ដានុពលបញ្ញានិងសមត្ថភាពពហុវិស័យសម្រាប់បុគ្គលគ្រប់រូបមិនថាជាអ្នកជំនាញនិស្សិតឬមហាជនទូទៅ។នេះជាមធ្យោបាយពង្រីកចំណេះដឹងពហុវិស័យសម្រាប់អ្នកអាជីពជាជំនួយស្មារតីក្នុងការស្រាវជ្រាវចំគោលដៅសម្រាប់អ្នកសិក្សានិងជាមូលដ្ឋានគ្រឹះសម្រាប់មហាជនទូទៅក្នុងការយល់ដឹងពីយន្តការរដ្ឋបាលសាធារណៈសេដ្ឋកិច្ចនិងវប្បធម៌ជាតិដែលជាប្រយោជន៍ដ៏មហាសាលសម្រាប់ជីវភាពរស់នៅប្រចាំថ្ងៃ។</p>
                        </div>
                    </section>

                    <div class="w-full h-px bg-gray-100 dark:bg-white/10"></div>

                    <!-- 2. 12 Pillars -->
                    <section>
                         <div class="flex items-center gap-3 mb-6">
                            <span class="bg-[#b45309] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md ring-2 ring-orange-100 font-bold font-kantumruy dark:ring-amber-300/20">២</span>
                            <h3 class="font-kantumruy text-xl text-[#b45309]">មុំទាំង ១២ នៃចំណេះដឹង (The 12 Core Pillars)</h3>
                        </div>
                        <div class="text-gray-700 leading-relaxed text-justify space-y-4 dark:text-slate-200">
                            <p>ការជ្រើសរើសយកវិស័យទាំង១២ចាប់ពីភូមិសាស្ត្ររហូតដល់តក្កវិជ្ជាមកធ្វើជាសសរស្តម្ភនៃប្រព័ន្ធនេះគឺដើម្បីបង្កើតឱ្យមានការយល់ដឹងជាលក្ខណៈចក្ខុវិស័យ៣៦០ដឺក្រេអំពីកម្ពុជានិងពិភពលោក។ក្នុងសម័យកាលបច្ចុប្បន្នភាពជោគជ័យនៃបុគ្គលម្នាក់ៗមិនអាចពឹងផ្អែកតែលើជំនាញឯកទេសមួយមុខបានឡើយ។</p>
                            <p>ហេតុនេះការមានចំណេះដឹងពហុវិស័យ(Multidisciplinary)គឺជាតម្រូវការចាំបាច់បំផុតដើម្បីឱ្យមន្ត្រីរាជការនិងអ្នកជំនាញគ្រប់រូបអាចបំពេញការងារបានប្រកបដោយប្រសិទ្ធភាពខ្ពស់មានភាពបត់បែននិងមានសមត្ថភាពខ្ពស់ក្នុងការដោះស្រាយបញ្ហាស្មុគស្មាញក្នុងសង្គម។</p>
                        </div>
                    </section>

                    <div class="w-full h-px bg-gray-100 dark:bg-white/10"></div>

                    <!-- 3. Tree of Life -->
                    <section>
                        <div class="flex items-center gap-3 mb-6">
                            <span class="bg-[#b45309] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md ring-2 ring-orange-100 font-bold font-kantumruy dark:ring-amber-300/20">៣</span>
                            <h3 class="font-kantumruy text-xl text-[#b45309]">និមិត្តរូបនៃដើមឈើជីវិត (The Tree of Life Concept)</h3>
                        </div>
                        <div class="bg-green-50/50 rounded-2xl p-6 border border-green-100 flex flex-col md:flex-row gap-6 items-center dark:border-emerald-300/20 dark:bg-emerald-950/20">
                            <img :src="'/icons/tree_evolution/4.png'" :class="'md:w-1/3 rounded-xl shadow-md object-cover h-48'">
                            <div class="text-gray-700 leading-relaxed text-justify space-y-4 dark:text-slate-200">
                                <p>តាមរយៈប្រព័ន្ធសិក្សាបែបល្បែងកម្សាន្ត(Gamification)យើងចង់ឱ្យរាល់ការលូតលាស់នៃចំណេះដឹងរបស់អ្នកសិក្សាត្រូវបានបង្ហាញជានិមិត្តរូបតាមរយៈការវិវត្តនៃ«ដើមឈើជីវិត»។</p>
                                <p>អ្នកសិក្សានឹងចាប់ផ្តើមដំណើរពី«គ្រាប់ពូជ»នៃសក្តានុពលហើយតាមរយៈការអនុវត្តនិងការសន្សំចំណេះដឹងជារៀងរាល់ថ្ងៃគ្រាប់ពូជនេះនឹងដុះលូតលាស់ជាលំដាប់រហូតក្លាយជាដើមឈើដ៏រឹងមាំ។ដើមឈើជីវិតនេះមិនត្រឹមតែតំណាងឱ្យភាពចាស់ទុំនៃបញ្ញារបស់បុគ្គលម្នាក់ៗប៉ុណ្ណោះទេប៉ុន្តែគឺជាការត្រៀមខ្លួនជាស្រេចដើម្បីផ្តល់ជា«ម្លប់»ដ៏ត្រជាក់ត្រជុំនិងផ្លែផ្កាដ៏ផ្អែមល្ហែមជូនដល់សង្គមជាតិទាំងមូល។</p>
                            </div>
                        </div>
                    </section>

                    <!-- Close Button Bottom -->
                    <div class="pt-4 text-center">
                        <button @click="closeVisionModal" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-full transition-colors dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15">
                            បិទផ្ទាំង (Close)
                        </button>
                    </div>

                 </div>
            </div>
        </div>
    </transition>

  </div>
</template>

<style scoped>
.double-border-gold {
    border: 4px solid #fcd34d; /* Tailwind yellow-300 */
    outline: 2px solid #b45309; /* Tailwind yellow-700/orange-800 */
    outline-offset: -8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.animate-fade-in {
    animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-spin-slow {
    animation: spin 8s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.mask-image-gradient {
    mask-image: linear-gradient(to top, black 20%, transparent 100%);
    -webkit-mask-image: linear-gradient(to top, black 20%, transparent 100%);
}
</style>
