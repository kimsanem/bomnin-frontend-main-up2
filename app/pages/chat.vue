<script setup>
import { ref, nextTick, onMounted, computed, watch, onBeforeUnmount } from 'vue';

const config = useRuntimeConfig();
const chatbotBaseUrl = (config.public.chatbotBase || 'https://bomnin-chatbot.onrender.com').replace(/\/$/, '');

const { authToken } = useAuthState();
const isLoggedIn = computed(() => !!authToken.value);
const emptyAssistantMessage = 'វិទូ សូមអភ័យទោស។ វិទូមិនទាន់ទទួលបានចម្លើយពីប្រព័ន្ធនៅពេលនេះទេ។ សូមសាកល្បងម្ដងទៀត។';

const input = ref('');
const isLoading = ref(false);
const maxLength = 300;
const chatContainer = ref(null);
const isExpanded = ref(false);

const messages = ref([
  {
    role: 'assistant',
    content: 'សួស្តី។ វិទូរីករាយក្នុងការជួយលោកអ្នកលើសំណួរពាក់ព័ន្ធនឹងច្បាប់កម្ពុជា រដ្ឋបាលសាធារណៈ និងការប្រឡងមន្ត្រីសាធារណៈ។ សូមសរសេរសំណួររបស់លោកអ្នកជាភាសាខ្មែរ ឬអង់គ្លេស។ វិទូនឹងឆ្លើយជាភាសាខ្មែរតែប៉ុណ្ណោះ។',
  },
]);

const characterCount = computed(() => input.value.length);
const cardClass = 'mx-auto flex w-full flex-col overflow-hidden border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/85 dark:shadow-[0_24px_80px_rgba(0,0,0,0.42)]';
const headerClass = 'bg-[#1e3a8a] text-white font-bold tracking-wide z-10 shadow-md flex items-center justify-between gap-3 px-5 py-3 dark:bg-[linear-gradient(135deg,#0f172a,#1e3a8a)] md:px-7';
const messagesClass = 'w-full overflow-y-auto p-6 scroll-smooth hide-scrollbar space-y-6 bg-slate-50 dark:bg-slate-950/70';

const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const renderAssistantMessage = (text) => {
  const normalized = (text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, '\n\n')
    .trim();

  if (!normalized) {
    return '';
  }

  const lines = normalized.split('\n');
  const htmlLines = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      htmlLines.push('</ul>');
      inList = false;
    }
  };

  for (const line of lines) {
    const compactLine = line.trim();

    if (!compactLine) {
      closeList();
      if (htmlLines.at(-1) !== '<div class="assistant-gap"></div>') {
        htmlLines.push('<div class="assistant-gap"></div>');
      }
      continue;
    }

    const bulletMatch = compactLine.match(/^([*•-]|\d+\.)\s+(.+)$/);
    const lineText = bulletMatch ? bulletMatch[2] : compactLine;
    const formattedLine = escapeHtml(lineText).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    if (bulletMatch) {
      if (!inList) {
        htmlLines.push('<ul class="assistant-list">');
        inList = true;
      }
      htmlLines.push(`<li class="assistant-list-item">${formattedLine}</li>`);
      continue;
    }

    closeList();
    htmlLines.push(`<p class="assistant-line">${formattedLine}</p>`);
  }

  closeList();
  return htmlLines.join('');
};

const splitAssistantFooter = (text) => {
  const normalized = (text || '').replace(/\r\n/g, '\n').trim();

  if (!normalized) {
    return { body: '', footer: '' };
  }

  const footerMarkers = [
    'សេចក្ដីបំភ្លឺបញ្ជាក់',
    'សេចក្តីបំភ្លឺបញ្ជាក់',
    'ឯកសារយោង៖',
    'ឯកសារយោង:',
  ];

  let footerIndex = -1;

  for (const marker of footerMarkers) {
    const index = normalized.lastIndexOf(marker);
    if (index > 0 && (footerIndex === -1 || index < footerIndex)) {
      footerIndex = index;
    }
  }

  if (footerIndex === -1) {
    return { body: normalized, footer: '' };
  }

  return {
    body: normalized.slice(0, footerIndex).trim(),
    footer: normalized.slice(footerIndex).trim(),
  };
};

const parseAiMessage = (text) => {
  const markerQuestion = 'សំណួរដែលបានកែសម្រួល៖';
  const markerAnswer = 'ចម្លើយផ្លូវការ៖';
  const markerReference = 'ឯកសារយោងផ្លូវការ៖';

  const isStructured = text.includes(markerQuestion);
  if (!isStructured) {
    return { isStructured: false, raw: text };
  }

  let question = '';
  let answer = '';
  let reference = '';

  const qSplit = text.split(markerQuestion);
  const afterQ = qSplit[1] || '';
  const aSplit = afterQ.split(markerAnswer);
  question = aSplit[0].trim();

  if (aSplit.length > 1) {
    const afterA = aSplit[1];
    const rSplit = afterA.split(markerReference);
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

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
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
    const response = await fetch(`${chatbotBaseUrl}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
      },
      body: JSON.stringify({ question: userMsg }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'មានបញ្ហាក្នុងការតភ្ជាប់ទៅកាន់ប្រព័ន្ធ។');
    }

    isLoading.value = false;
    messages.value.push({ role: 'assistant', content: '' });
    aiMessageIndex = messages.value.length - 1;

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

    if (aiMessageIndex !== -1 && !messages.value[aiMessageIndex].content.trim()) {
      messages.value[aiMessageIndex].content = emptyAssistantMessage;
      scrollToBottom();
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    isLoading.value = false;

    if (aiMessageIndex === -1) {
      messages.value.push({ role: 'assistant', content: `⚠️ ${error.message}` });
    } else {
      messages.value[aiMessageIndex].content += `\n\n⚠️ ${error.message}`;
    }
    scrollToBottom();
  }
};

onMounted(() => {
  scrollToBottom();
});

watch(isExpanded, (expanded) => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = expanded ? 'hidden' : '';
  scrollToBottom();
});

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = '';
});

const resizeTextarea = (e) => {
  const el = e.target;
  el.style.height = 'auto';
  if (el.scrollHeight <= 120) {
    el.style.height = `${el.scrollHeight}px`;
  } else {
    el.style.height = '120px';
  }
};
</script>

<template>
  <div v-if="!isExpanded" class="flex w-full min-h-[calc(100vh-14rem)] bg-transparent px-4 py-6 font-kantumruy sm:min-h-[calc(100vh-13rem)] md:min-h-[calc(100vh-10rem)] md:px-8 md:py-8 lg:min-h-[calc(100vh-9rem)]">
    <div :class="`${cardClass} h-fit max-w-4xl rounded-3xl`">
      <div :class="headerClass">
        <span class="text-md md:text-xl">វិទូ សូមជម្រាបសួរ</span>
        <img :src="'/icons/robot/robot.png'" alt="robot" class="h-16 w-16 object-contain drop-shadow-lg md:h-20 md:w-20">
        <button
          type="button"
          @click="toggleExpanded"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Open full screen"
          title="Expand chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3.75H4.5v3.75m0 9V20.25h3.75m11.25-12.75V3.75H15.75m3.75 12.75v3.75h-3.75" />
          </svg>
        </button>
      </div>

      <div ref="chatContainer" :class="`${messagesClass} max-h-[52vh] md:max-h-[calc(100vh-24rem)] lg:max-h-[calc(100vh-22rem)]`">
        <template v-for="(msg, i) in messages" :key="i">
          <div class="w-full flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
            <div v-if="msg.role === 'user'" class="max-w-[85%] md:max-w-[75%] bg-blue-600 text-white rounded-2xl rounded-tr-sm p-4 shadow-sm dark:bg-blue-500 dark:shadow-[0_18px_36px_rgba(59,130,246,0.24)]">
              <p class="text-[15px] md:text-base leading-relaxed font-kantumruy whitespace-pre-wrap">{{ msg.content }}</p>
            </div>

            <div v-else class="w-full flex justify-start">
              <template v-for="parsed in [parseAiMessage(msg.content)]" :key="parsed.question || i">
                <div v-if="!parsed.isStructured" class="max-w-[90%] md:max-w-[85%] overflow-hidden rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
                  <template v-for="contentParts in [splitAssistantFooter(msg.content)]" :key="`compact-${i}`">
                    <div class="flex flex-col gap-3 p-5">
                      <div class="flex items-center gap-2 mb-1">
                        <img src="/logo.png" alt="AI" class="w-6 h-6 object-contain">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Assistant</span>
                      </div>
                      <div class="assistant-copy text-[15px] leading-relaxed text-gray-800 dark:text-slate-100 md:text-base" v-html="renderAssistantMessage(contentParts.body)"></div>
                    </div>
                    <div v-if="contentParts.footer" class="border-t border-sky-100 bg-[#eef6ff] px-5 py-4 dark:border-sky-900/40 dark:bg-slate-950/90">
                      <div class="assistant-copy text-[13px] font-medium text-sky-800 dark:text-sky-200 md:text-sm" v-html="renderAssistantMessage(contentParts.footer)"></div>
                    </div>
                  </template>
                </div>

                <div v-else class="w-full max-w-[95%] overflow-hidden rounded-[1rem] border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.32)] md:max-w-[85%]">
                  <div class="bg-[#cef6e4] px-5 py-4 dark:border-b dark:border-white/10 dark:bg-emerald-400/12">
                    <h3 class="text-[15px] font-bold tracking-wide leading-relaxed text-gray-900 dark:text-emerald-100 md:text-[17px]">
                      {{ parsed.question }}
                    </h3>
                  </div>

                  <template v-for="answerParts in [splitAssistantFooter(parsed.answer)]" :key="`answer-${i}`">
                    <div class="bg-white px-5 py-5 dark:bg-slate-900">
                      <div class="assistant-copy text-[15px] leading-relaxed text-gray-800 dark:text-slate-100 md:text-[16px]" v-html="renderAssistantMessage(answerParts.body)"></div>
                    </div>

                    <div v-if="parsed.reference || answerParts.footer" class="border-t border-sky-100 bg-[#eef6ff] px-5 py-4 dark:border-sky-900/40 dark:bg-slate-950/90">
                      <div v-if="parsed.reference" class="assistant-copy text-[13px] font-medium text-sky-800 dark:text-sky-200 md:text-sm" v-html="renderAssistantMessage(parsed.reference)"></div>
                      <div v-if="answerParts.footer" class="assistant-copy text-[13px] font-medium text-sky-800 dark:text-sky-200 md:text-sm" :class="{ 'mt-2': parsed.reference }" v-html="renderAssistantMessage(answerParts.footer)"></div>
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </div>
        </template>

        <div v-if="isLoading" class="w-full flex justify-start">
          <div class="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
            <span class="h-2 w-2 animate-bounce rounded-full bg-blue-500 dark:bg-sky-400"></span>
            <span class="h-2 w-2 animate-bounce rounded-full bg-blue-500 dark:bg-sky-400" style="animation-delay: 0.1s"></span>
            <span class="h-2 w-2 animate-bounce rounded-full bg-blue-500 dark:bg-sky-400" style="animation-delay: 0.2s"></span>
          </div>
        </div>
      </div>

      <div class="relative z-10 w-full border-t border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-slate-900/95">
        <div v-if="!isLoggedIn" class="absolute inset-0 z-20 flex items-center justify-center rounded-b-3xl bg-white/60 backdrop-blur-[2px] dark:bg-slate-950/65">
          <div class="flex items-center gap-3 rounded-full border border-yellow-200 bg-white px-6 py-3 shadow-md dark:border-amber-300/20 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
            <span class="text-2xl">🔒</span>
            <p class="text-sm font-bold tracking-wide text-gray-700 dark:text-slate-100 md:text-base">សូម Login ជាមុនសិន ដើម្បីប្រើប្រាស់មុខងារ AI</p>
          </div>
        </div>

        <div class="flex items-end gap-2 rounded-3xl border border-gray-200 bg-[#f8fafc] p-2 pl-4 pr-2 shadow-inner transition-all duration-300 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:focus-within:border-sky-400 dark:focus-within:ring-sky-400/20">
          <textarea
            v-model="input"
            @input="resizeTextarea"
            @keydown.enter.prevent="handleSend"
            :maxlength="maxLength"
            rows="1"
            :disabled="!isLoggedIn"
            :placeholder="isLoggedIn ? 'សូមសួរសំណួរនៅទីនេះ...' : '🔒 សូម Login ជាមុនសិន...'"
            class="min-h-[48px] max-h-[120px] flex-1 resize-none bg-transparent py-3 font-kantumruy text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500 md:text-base"
            :class="{ 'cursor-not-allowed': !isLoggedIn }"
          ></textarea>

          <div class="flex shrink-0 flex-col items-center justify-between pb-1">
            <div class="mb-1 text-[10px] font-bold text-gray-400 dark:text-slate-500">
              <span :class="{ 'text-red-500': characterCount >= maxLength }">{{ characterCount }}</span>/{{ maxLength }}
            </div>
            <button
              @click="handleSend"
              :disabled="!input.trim() || isLoading || !isLoggedIn"
              class="h-10 w-10 rounded-full bg-blue-600 text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="mx-auto h-5 w-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="isExpanded" class="fixed inset-0 z-[2000] bg-slate-950/85 p-0 font-kantumruy md:p-6">
      <div :class="`${cardClass} h-full max-w-6xl rounded-none md:rounded-3xl dark:bg-slate-900/95`">
        <div :class="headerClass">
          <span class="text-md md:text-xl">វិទូ សូមជម្រាបសួរ</span>
          <img :src="'/icons/robot/robot.png'" alt="robot" class="h-16 w-16 object-contain drop-shadow-lg md:h-20 md:w-20">
          <button
            type="button"
            @click="toggleExpanded"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Exit full screen"
            title="Minimize chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="h-5 w-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 8.25h3.75V4.5m-15 3.75V4.5h3.75m11.25 11.25v3.75h-3.75M8.25 15.75H4.5v3.75" />
            </svg>
          </button>
        </div>

        <div ref="chatContainer" :class="`${messagesClass} flex-1 md:p-8`">
          <template v-for="(msg, i) in messages" :key="`expanded-${i}`">
            <div class="w-full flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
              <div v-if="msg.role === 'user'" class="max-w-[85%] md:max-w-[75%] bg-blue-600 text-white rounded-2xl rounded-tr-sm p-4 shadow-sm dark:bg-blue-500 dark:shadow-[0_18px_36px_rgba(59,130,246,0.24)]">
                <p class="text-[15px] md:text-base leading-relaxed font-kantumruy whitespace-pre-wrap">{{ msg.content }}</p>
              </div>

              <div v-else class="w-full flex justify-start">
                <template v-for="parsed in [parseAiMessage(msg.content)]" :key="parsed.question || i">
                  <div v-if="!parsed.isStructured" class="max-w-[90%] md:max-w-[85%] overflow-hidden rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
                    <template v-for="contentParts in [splitAssistantFooter(msg.content)]" :key="`expanded-compact-${i}`">
                      <div class="flex flex-col gap-3 p-5">
                        <div class="flex items-center gap-2 mb-1">
                          <img src="/logo.png" alt="AI" class="w-6 h-6 object-contain">
                          <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Assistant</span>
                        </div>
                        <div class="assistant-copy text-[15px] leading-relaxed text-gray-800 dark:text-slate-100 md:text-base" v-html="renderAssistantMessage(contentParts.body)"></div>
                      </div>
                      <div v-if="contentParts.footer" class="border-t border-sky-100 bg-[#eef6ff] px-5 py-4 dark:border-sky-900/40 dark:bg-slate-950/90">
                        <div class="assistant-copy text-[13px] font-medium text-sky-800 dark:text-sky-200 md:text-sm" v-html="renderAssistantMessage(contentParts.footer)"></div>
                      </div>
                    </template>
                  </div>

                  <div v-else class="w-full max-w-[95%] overflow-hidden rounded-[1rem] border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.32)] md:max-w-[85%]">
                    <div class="bg-[#cef6e4] px-5 py-4 dark:border-b dark:border-white/10 dark:bg-emerald-400/12">
                      <h3 class="text-[15px] font-bold tracking-wide leading-relaxed text-gray-900 dark:text-emerald-100 md:text-[17px]">
                        {{ parsed.question }}
                      </h3>
                    </div>

                    <template v-for="answerParts in [splitAssistantFooter(parsed.answer)]" :key="`expanded-answer-${i}`">
                      <div class="bg-white px-5 py-5 dark:bg-slate-900">
                        <div class="assistant-copy text-[15px] leading-relaxed text-gray-800 dark:text-slate-100 md:text-[16px]" v-html="renderAssistantMessage(answerParts.body)"></div>
                      </div>

                      <div v-if="parsed.reference || answerParts.footer" class="border-t border-sky-100 bg-[#eef6ff] px-5 py-4 dark:border-sky-900/40 dark:bg-slate-950/90">
                        <div v-if="parsed.reference" class="assistant-copy text-[13px] font-medium text-sky-800 dark:text-sky-200 md:text-sm" v-html="renderAssistantMessage(parsed.reference)"></div>
                        <div v-if="answerParts.footer" class="assistant-copy text-[13px] font-medium text-sky-800 dark:text-sky-200 md:text-sm" :class="{ 'mt-2': parsed.reference }" v-html="renderAssistantMessage(answerParts.footer)"></div>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </div>
          </template>

          <div v-if="isLoading" class="w-full flex justify-start">
            <div class="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
              <span class="h-2 w-2 animate-bounce rounded-full bg-blue-500 dark:bg-sky-400"></span>
              <span class="h-2 w-2 animate-bounce rounded-full bg-blue-500 dark:bg-sky-400" style="animation-delay: 0.1s"></span>
              <span class="h-2 w-2 animate-bounce rounded-full bg-blue-500 dark:bg-sky-400" style="animation-delay: 0.2s"></span>
            </div>
          </div>
        </div>

        <div class="relative z-10 w-full border-t border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-slate-900/95">
          <div v-if="!isLoggedIn" class="absolute inset-0 z-20 flex items-center justify-center md:rounded-b-3xl bg-white/60 backdrop-blur-[2px] dark:bg-slate-950/65">
            <div class="flex items-center gap-3 rounded-full border border-yellow-200 bg-white px-6 py-3 shadow-md dark:border-amber-300/20 dark:bg-slate-900 dark:shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
              <span class="text-2xl">🔒</span>
              <p class="text-sm font-bold tracking-wide text-gray-700 dark:text-slate-100 md:text-base">សូម Login ជាមុនសិន ដើម្បីប្រើប្រាស់មុខងារ AI</p>
            </div>
          </div>

          <div class="flex items-end gap-2 rounded-3xl border border-gray-200 bg-[#f8fafc] p-2 pl-4 pr-2 shadow-inner transition-all duration-300 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:focus-within:border-sky-400 dark:focus-within:ring-sky-400/20">
            <textarea
              v-model="input"
              @input="resizeTextarea"
              @keydown.enter.prevent="handleSend"
              :maxlength="maxLength"
              rows="1"
              :disabled="!isLoggedIn"
              :placeholder="isLoggedIn ? 'សូមសួរសំណួរនៅទីនេះ...' : '🔒 សូម Login ជាមុនសិន...'"
              class="min-h-[48px] max-h-[120px] flex-1 resize-none bg-transparent py-3 font-kantumruy text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500 md:text-base"
              :class="{ 'cursor-not-allowed': !isLoggedIn }"
            ></textarea>

            <div class="flex shrink-0 flex-col items-center justify-between pb-1">
              <div class="mb-1 text-[10px] font-bold text-gray-400 dark:text-slate-500">
                <span :class="{ 'text-red-500': characterCount >= maxLength }">{{ characterCount }}</span>/{{ maxLength }}
              </div>
              <button
                @click="handleSend"
                :disabled="!input.trim() || isLoading || !isLoggedIn"
                class="h-10 w-10 rounded-full bg-blue-600 text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 dark:bg-sky-500 dark:hover:bg-sky-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="mx-auto h-5 w-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.assistant-copy :deep(strong) {
  font-weight: 700;
}

.assistant-copy :deep(.assistant-line) {
  margin: 0;
  line-height: 1.65;
}

.assistant-copy :deep(.assistant-line + .assistant-line) {
  margin-top: 0.35rem;
}

.assistant-copy :deep(.assistant-gap) {
  height: 0.45rem;
}

.assistant-copy :deep(.assistant-list) {
  margin: 0.2rem 0;
  padding-left: 1.15rem;
  list-style-type: disc;
}

.assistant-copy :deep(.assistant-list-item) {
  margin: 0.18rem 0;
  line-height: 1.65;
}
</style>
