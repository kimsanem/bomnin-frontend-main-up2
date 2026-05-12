<script setup>
import { ref, nextTick, onMounted, computed } from 'vue';


// --- CONFIG & AUTH STATE ---
const config = useRuntimeConfig();
const aiBaseUrl = config.public.aiBase;

// --- AUTH STATE ---
const { authToken } = useAuthState();
const isLoggedIn = computed(() => !!authToken.value);


// --- STATE ---
const input = ref('');
const isLoading = ref(false);
const maxLength = 300; 
const chatContainer = ref(null);

const messages = ref([
    { 
        role: 'user', 
        content: 'តើយើងគួរចាប់ផ្ដើមពីចំណេះដឹងអ្វីនៅថ្ងៃនេះ?' 
    }
]);

const characterCount = computed(() => input.value.length);

// --- មុខងារបំបែកអត្ថបទ AI ទៅជាទម្រង់កាត (Parser) ---
const parseAiMessage = (text) => {
    // ឆែកមើលថាតើអត្ថបទនេះមានពាក្យគន្លឹះពី System Instruction ឬអត់
    const isStructured = text.includes('សំណួរដែលបានកែសម្រួល៖');
    
    // បើមិនមែន (ឧទាហរណ៍ ពេលកំពុងចាំទិន្នន័យ ឬ Error) ឱ្យបង្ហាញជាអត្ថបទធម្មតា
    if (!isStructured) {
        return { isStructured: false, raw: text };
    }

    let question = '';
    let answer = '';
    let reference = '';

    // កាត់យកសំណួរ
    const qSplit = text.split('សំណួរដែលបានកែសម្រួល៖');
    let afterQ = qSplit[1] || '';

    // កាត់យកចម្លើយ
    const aSplit = afterQ.split('ចម្លើយផ្លូវការ៖');
    question = aSplit[0].trim();

    if (aSplit.length > 1) {
        let afterA = aSplit[1];
        // កាត់យកឯកសារយោង
        const rSplit = afterA.split('ឯកសារយោងផ្លូវការ៖');
        answer = rSplit[0].trim();

        if (rSplit.length > 1) {
            reference = rSplit[1].trim();
        }
    }

    return { isStructured: true, question, answer, reference };
};

const scrollToBottom = async () => {
    await nextTick();
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
};

const handleSend = async () => {
    if (!input.value.trim() || isLoading.value || !isLoggedIn.value) return;

    const userMsg = input.value.trim();
    messages.value.push({ role: 'user', content: userMsg });
    input.value = '';
    scrollToBottom();

    isLoading.value = true;
    let aiMessageIndex = -1;

    try {
        // 🔥 ប្រើ aiBaseUrl ជំនួសការវាយ URL ផ្ទាល់ ហើយប្រើប្រាស់ Native Fetch សម្រាប់ Streaming
        const response = await fetch(`${aiBaseUrl}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: userMsg })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ប្រព័ន្ធ។');
        }

        isLoading.value = false;
        messages.value.push({ role: 'assistant', content: '' }); 
        aiMessageIndex = messages.value.length - 1;

        // ការអានទិន្នន័យជាលក្ខណៈ Streaming (អក្សរលោតម្ដងមួយៗ)
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            
            if (value) {
                const chunk = decoder.decode(value, { stream: true });
                messages.value[aiMessageIndex].content += chunk;
                scrollToBottom();
            }
        }
        
    } catch (error) {
        console.error("Chat API Error:", error);
        isLoading.value = false;
        
        if (aiMessageIndex === -1) {
            messages.value.push({ role: 'assistant', content: "⚠️ " + error.message });
        } else {
            messages.value[aiMessageIndex].content += "\n\n⚠️ " + error.message;
        }
        scrollToBottom();
    }
};

onMounted(() => {
    scrollToBottom();
});

const resizeTextarea = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    if (el.scrollHeight <= 120) {
        el.style.height = el.scrollHeight + 'px';
    } else {
        el.style.height = '120px';
    }
};
</script>

<template>
    <div class="flex w-full min-h-[calc(100vh-14rem)] bg-transparent px-4 py-6 font-kantumruy sm:min-h-[calc(100vh-13rem)] md:min-h-[calc(100vh-10rem)] md:px-8 md:py-8 lg:min-h-[calc(100vh-9rem)]">
        <div class="mx-auto flex h-fit w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/85 dark:shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
            <div class="bg-[#1e3a8a] text-white text-center font-bold tracking-wide z-10 shadow-md flex items-center justify-center dark:bg-[linear-gradient(135deg,#0f172a,#1e3a8a)]">
                <span class="text-md md:text-xl">វិទូ សូមជម្រាបសួរ</span>
                <img :src="'/icons/robot/robot.png'" alt="robot" class="w-20 h-20 md:w-30 md:h-30 object-contain mb-2 drop-shadow-lg">
            </div>

            <div ref="chatContainer" class="w-full max-h-[52vh] overflow-y-auto p-6 scroll-smooth hide-scrollbar space-y-6 bg-slate-50 dark:bg-slate-950/70 md:max-h-[calc(100vh-24rem)] lg:max-h-[calc(100vh-22rem)]">
                
                <div v-for="(msg, i) in messages" :key="i" class="w-full flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                    
                    <div v-if="msg.role === 'user'" class="max-w-[85%] md:max-w-[75%] bg-blue-600 text-white rounded-2xl rounded-tr-sm p-4 shadow-sm dark:bg-blue-500 dark:shadow-[0_18px_36px_rgba(59,130,246,0.24)]">
                        <p class="text-[15px] md:text-base leading-relaxed font-kantumruy whitespace-pre-wrap">{{ msg.content }}</p>
                    </div>

                    <div v-if="msg.role === 'assistant'" class="w-full flex justify-start">
                        
                        <template v-for="parsed in [parseAiMessage(msg.content)]" :key="parsed.question">
                            
                            <div v-if="!parsed.isStructured" class="max-w-[90%] md:max-w-[85%] bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-5 shadow-sm flex flex-col gap-3 dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
                                <div class="flex items-center gap-2 mb-1">
                                    <img src="/logo.png" alt="AI" class="w-6 h-6 object-contain">
                                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Assistant</span>
                                </div>
                                <p class="text-gray-800 text-[15px] md:text-base leading-relaxed whitespace-pre-wrap dark:text-slate-100">{{ msg.content }}</p>
                            </div>

                            <div v-else class="w-full max-w-[95%] md:max-w-[85%] bg-white border border-gray-200 rounded-[1rem] shadow-sm overflow-hidden flex flex-col dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
                                
                                <div class="bg-[#cef6e4] px-5 py-4 dark:border-b dark:border-white/10 dark:bg-emerald-400/12">
                                    <h3 class="font-bold text-gray-900 text-[15px] md:text-[17px] tracking-wide leading-relaxed dark:text-emerald-100">
                                        {{ parsed.question }}
                                    </h3>
                                </div>
                                
                                <div class="px-5 py-5 bg-white dark:bg-slate-900">
                                    <p class="text-gray-800 text-[15px] md:text-[16px] leading-[1.8] whitespace-pre-wrap dark:text-slate-100">{{ parsed.answer }}</p>
                                </div>
                                
                                <div v-if="parsed.reference" class="bg-[#f8f9fa] px-5 py-4 border-t border-gray-100 dark:border-white/10 dark:bg-slate-950/80">
                                    <p class="text-[13px] md:text-sm text-gray-500 font-medium dark:text-slate-400">
                                        ឯកសារយោង៖ <span class="text-gray-600">{{ parsed.reference }}</span>
                                    </p>
                                </div>

                            </div>

                        </template>

                    </div>

                </div>

                <div v-if="isLoading" class="w-full flex justify-start">
                    <div class="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2 dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
                        <span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce dark:bg-sky-400"></span>
                        <span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce dark:bg-sky-400" style="animation-delay: 0.1s"></span>
                        <span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce dark:bg-sky-400" style="animation-delay: 0.2s"></span>
                    </div>
                </div>

            </div>

            <div class="w-full bg-white border-t border-gray-100 p-4 relative z-10 dark:border-white/10 dark:bg-slate-900/95">
                
                <div v-if="!isLoggedIn" class="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-b-3xl dark:bg-slate-950/65">
                    <div class="bg-white px-6 py-3 rounded-full shadow-md border border-yellow-200 flex items-center gap-3 dark:border-amber-300/20 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
                        <span class="text-2xl">🔒</span>
                        <p class="text-gray-700 font-bold text-sm md:text-base tracking-wide">សូម Login ជាមុនសិន ដើម្បីប្រើប្រាស់មុខងារ AI</p>
                    </div>
                </div>

                <div class="bg-[#f8fafc] border border-gray-200 rounded-3xl p-2 pl-4 pr-2 shadow-inner flex items-end gap-2 transition-all duration-300 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:focus-within:border-sky-400 dark:focus-within:ring-sky-400/20">
                    
                    <textarea 
                        v-model="input"
                        @input="resizeTextarea"
                        @keydown.enter.prevent="handleSend"
                        :maxlength="maxLength"
                        rows="1"
                        :disabled="!isLoggedIn"
                        :placeholder="isLoggedIn ? 'សូមសួរសំណួរទីនេះ...' : '🔒 សូម Login ជាមុនសិន...'"
                        class="flex-1 bg-transparent text-gray-800 text-[15px] md:text-base font-kantumruy py-3 focus:outline-none resize-none placeholder-gray-400 min-h-[48px] max-h-[120px] dark:text-slate-100 dark:placeholder:text-slate-500"
                        :class="{ 'cursor-not-allowed': !isLoggedIn }"
                    ></textarea>

                    <div class="flex flex-col items-center justify-between pb-1 shrink-0">
                        <div class="text-[10px] font-bold text-gray-400 mb-1 dark:text-slate-500">
                            <span :class="{'text-red-500': characterCount >= maxLength}">{{ characterCount }}</span>/{{ maxLength }}
                        </div>
                        <button 
                            @click="handleSend"
                            :disabled="!input.trim() || isLoading || !isLoggedIn"
                            class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 hover:shadow-md transform active:scale-95 dark:bg-sky-500 dark:hover:bg-sky-400"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
                            </svg>
                        </button>
                    </div>

                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}
.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
