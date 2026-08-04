<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { getToken } from '@/api/auth'

type ChatRole = 'user' | 'assistant'
type ChatMessage = { role: ChatRole; content: string }

const props = defineProps<{ open: boolean; context: string }>()
const emit = defineEmits<{ (event: 'update:open', value: boolean): void }>()
const input = ref('')
const loading = ref(false)
const listRef = ref<HTMLElement>()
const inputRef = ref<HTMLTextAreaElement>()
const messages = ref<ChatMessage[]>([
  { role: 'assistant', content: '你好，我是小田。可以问我农场运行、设备状态、环境调控或作物管理问题。' }
])
const quickQuestions = ['总结今日农场状态', '哪些设备需要关注？', '给出当前灌溉建议']
const normalImage = `${import.meta.env.BASE_URL}assets/assistant/normal.png`
const waveImage = `${import.meta.env.BASE_URL}assets/assistant/wave.png`
let controller: AbortController | undefined

function toggle() { emit('update:open', !props.open) }
function close() { emit('update:open', false) }
function clearConversation() {
  messages.value = [{ role: 'assistant', content: '对话已清空。现在想了解农场的哪一部分？' }]
}
async function scrollToBottom() {
  await nextTick()
  if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
}
async function ask(question?: string) {
  const content = (question || input.value).trim()
  if (!content || loading.value) return
  input.value = ''
  messages.value.push({ role: 'user', content })
  loading.value = true
  await scrollToBottom()
  controller = new AbortController()
  try {
    const token = getToken()
    const response = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      signal: controller.signal,
      body: JSON.stringify({ messages: messages.value.slice(-12), context: props.context })
    })
    const payload = await response.json().catch(() => ({})) as { reply?: string; message?: string }
    if (!response.ok) throw new Error(payload.message || `请求失败（${response.status}）`)
    messages.value.push({ role: 'assistant', content: payload.reply || '暂时没有获得有效回答，请稍后重试。' })
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      messages.value.push({ role: 'assistant', content: `连接 DeepSeek 失败：${(error as Error).message}` })
    }
  } finally {
    loading.value = false
    controller = undefined
    await scrollToBottom()
  }
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    void ask()
  }
}

watch(() => props.open, async open => {
  if (open) {
    await scrollToBottom()
    inputRef.value?.focus()
  }
})
onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <div class="farm-ai" :class="{ opened: open }">
    <Transition name="assistant-panel">
      <section v-if="open" class="assistant-panel" aria-label="小田 AI 农业助手">
        <header>
          <div class="assistant-avatar"><span>田</span><i></i></div>
          <div><small>DEEPSEEK · 农业智能体</small><h2>小田助手</h2></div>
          <span class="online"><i></i>在线</span>
          <button class="clear" title="清空对话" aria-label="清空对话" @click="clearConversation">
            <svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"/></svg>
          </button>
          <button class="close" aria-label="关闭助手" @click="close">×</button>
        </header>

        <div ref="listRef" class="messages">
          <div class="context-chip"><i></i>{{ context }}</div>
          <article v-for="(message,index) in messages" :key="index" :class="message.role">
            <span v-if="message.role === 'assistant'" class="message-avatar">田</span>
            <p>{{ message.content }}</p>
          </article>
          <article v-if="loading" class="assistant typing"><span class="message-avatar">田</span><p><i></i><i></i><i></i></p></article>
        </div>

        <div v-if="messages.length < 3" class="quick-questions">
          <button v-for="item in quickQuestions" :key="item" @click="ask(item)">{{ item }}<span>↗</span></button>
        </div>

        <footer>
          <textarea ref="inputRef" v-model="input" rows="1" maxlength="1200" placeholder="问问小田，例如：今天需要灌溉吗？" @keydown="onKeydown"></textarea>
          <button :disabled="!input.trim() || loading" aria-label="发送消息" @click="ask()">
            <svg viewBox="0 0 24 24"><path d="m4 12 16-8-6 16-2.5-6.5L4 12Zm7.5 1.5L20 4"/></svg>
          </button>
          <small>Enter 发送 · Shift + Enter 换行</small>
        </footer>
      </section>
    </Transition>

    <button class="assistant-trigger" :aria-expanded="open" aria-label="打开小田 AI 助手" @click="toggle">
      <span class="character-stage">
        <img class="character normal" :src="normalImage" alt="小田农业助手" />
        <img class="character wave" :src="waveImage" alt="小田挥手问候" />
      </span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.farm-ai{position:absolute;z-index:8;left:0;bottom:150px;width:184px;height:274px;pointer-events:none}.farm-ai.opened{z-index:42}.assistant-trigger{position:absolute;left:0;bottom:0;width:184px;height:274px;padding:0;border:0;background:transparent;cursor:pointer;pointer-events:auto;overflow:hidden;text-align:left;filter:drop-shadow(0 16px 20px rgba(2,21,14,.26))}.character-stage{position:absolute;left:-22px;bottom:-10px;width:206px;height:264px;overflow:hidden}.character{position:absolute;left:0;width:auto;max-width:none;transition:opacity .16s ease,transform .28s cubic-bezier(.2,.8,.2,1)}.character.normal{bottom:0;height:264px;opacity:1;transform:translateX(-2px)}.character.wave{bottom:-32px;height:298px;opacity:0;transform:translateX(-10px)}.assistant-trigger:hover .normal,.opened .assistant-trigger .normal{opacity:0;transform:translateX(-7px) scale(.99)}.assistant-trigger:hover .wave,.opened .assistant-trigger .wave{opacity:1;transform:translateX(-8px)}
.assistant-panel{position:absolute;left:158px;bottom:8px;width:min(400px,calc(100vw - 190px));height:min(560px,calc(100vh - 120px));display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(213,255,228,.2);border-radius:24px;background:linear-gradient(145deg,rgba(13,48,37,.92),rgba(5,27,21,.94));color:#fff;box-shadow:0 30px 85px rgba(0,0,0,.45),inset 0 1px rgba(255,255,255,.1);backdrop-filter:blur(28px) saturate(1.25);pointer-events:auto}.assistant-panel>header{height:70px;display:flex;align-items:center;gap:10px;padding:0 15px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0}.assistant-avatar{position:relative;width:38px;height:38px;display:grid;place-items:center;border:1px solid rgba(127,236,160,.28);border-radius:12px;background:linear-gradient(145deg,#438b58,#265a3b);font-weight:800}.assistant-avatar i{position:absolute;right:-2px;bottom:-2px;width:9px;height:9px;border:2px solid #164331;border-radius:50%;background:#5ce889}.assistant-panel header>div:nth-child(2){display:flex;flex-direction:column}.assistant-panel header small{font-size:8px;letter-spacing:1.2px;color:#74dd95}.assistant-panel h2{margin:3px 0 0;font-size:15px}.online{display:flex;align-items:center;gap:5px;margin-left:auto;font-size:8px;color:rgba(255,255,255,.48)}.online i{width:5px;height:5px;border-radius:50%;background:#64e68c}.assistant-panel header button{width:31px;height:31px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(255,255,255,.05);color:white;cursor:pointer}.assistant-panel header button:hover{background:rgba(255,255,255,.11)}.assistant-panel header svg{width:15px;fill:none;stroke:currentColor;stroke-width:1.6}.assistant-panel header .close{font-size:20px}.messages{flex:1;min-height:0;overflow:auto;padding:15px;scroll-behavior:smooth}.messages::-webkit-scrollbar{width:4px}.messages::-webkit-scrollbar-thumb{border-radius:9px;background:rgba(255,255,255,.15)}.context-chip{display:flex;align-items:center;justify-content:center;gap:6px;width:max-content;max-width:100%;margin:0 auto 15px;padding:5px 9px;border-radius:99px;background:rgba(105,212,135,.08);color:rgba(198,235,208,.62);font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.context-chip i{width:5px;height:5px;border-radius:50%;background:#63dd87}.messages article{display:flex;align-items:flex-end;gap:7px;margin:0 0 12px}.messages article p{max-width:82%;margin:0;padding:10px 12px;border-radius:14px;font-size:11px;line-height:1.65;white-space:pre-wrap;word-break:break-word}.messages article.assistant p{border:1px solid rgba(255,255,255,.08);border-bottom-left-radius:4px;background:rgba(255,255,255,.065);color:rgba(255,255,255,.86)}.messages article.user{justify-content:flex-end}.messages article.user p{border-bottom-right-radius:4px;background:linear-gradient(135deg,#4e9c65,#32774d);color:white}.message-avatar{width:24px;height:24px;display:grid;place-items:center;flex:0 0 auto;border-radius:8px;background:#397a50;color:#a6efba;font-size:9px;font-weight:800}.typing p{display:flex;gap:4px;padding:12px!important}.typing p i{width:5px;height:5px;border-radius:50%;background:#77dc94;animation:typing 1s infinite ease-in-out}.typing p i:nth-child(2){animation-delay:.15s}.typing p i:nth-child(3){animation-delay:.3s}@keyframes typing{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-4px);opacity:1}}
.quick-questions{display:flex;gap:6px;padding:0 15px 10px;overflow-x:auto;flex-shrink:0}.quick-questions button{display:flex;align-items:center;gap:6px;flex:0 0 auto;padding:7px 9px;border:1px solid rgba(126,224,153,.16);border-radius:9px;background:rgba(92,181,117,.07);color:#a4deb4;font-size:9px;cursor:pointer}.quick-questions button:hover{border-color:rgba(126,224,153,.38);background:rgba(92,181,117,.14)}.assistant-panel footer{position:relative;margin:0 12px 12px;padding:9px 44px 22px 12px;border:1px solid rgba(255,255,255,.1);border-radius:15px;background:rgba(255,255,255,.055);flex-shrink:0}.assistant-panel textarea{width:100%;max-height:82px;resize:none;border:0;outline:0;background:transparent;color:white;font-size:11px;line-height:1.5}.assistant-panel textarea::placeholder{color:rgba(255,255,255,.3)}.assistant-panel footer>button{position:absolute;right:8px;top:8px;width:34px;height:34px;display:grid;place-items:center;border:0;border-radius:11px;background:linear-gradient(145deg,#59ad70,#347e50);color:white;cursor:pointer;box-shadow:0 6px 14px rgba(37,112,65,.25)}.assistant-panel footer>button:disabled{opacity:.35;cursor:not-allowed}.assistant-panel footer svg{width:17px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.7}.assistant-panel footer>small{position:absolute;left:12px;bottom:6px;color:rgba(255,255,255,.25);font-size:7px}.assistant-panel-enter-active,.assistant-panel-leave-active{transition:.28s cubic-bezier(.2,.8,.2,1)}.assistant-panel-enter-from,.assistant-panel-leave-to{opacity:0;transform:translateX(-14px) scale(.97);filter:blur(5px)}
@media(max-width:760px){.farm-ai{bottom:128px;transform:scale(.86);transform-origin:left bottom}.assistant-panel{position:fixed;left:10px;right:10px;bottom:74px;width:auto;height:min(520px,calc(100vh - 150px));transform-origin:left bottom}.assistant-panel-enter-from,.assistant-panel-leave-to{transform:translateY(12px) scale(.97)}}
</style>
