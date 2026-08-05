<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BrandLogo from '@/components/BrandLogo.vue'
import UserMenu from '@/components/workspace/UserMenu.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import { getUser } from '@/api/auth'
import { sendAssistantMessage, type ChatMessage } from '@/api/assistant'
import { alerts, dashboardSummary, deviceRecords, environmentMetrics, farmZones, irrigationUnits, sceneEntities } from '@/data/farm'
import type { SceneEntity } from '@/types'

interface Conversation {
  id: number
  title: string
  time: string
  messages: ChatMessage[]
  panelMode?: PanelMode | null
  panelEntityId?: string | null
}

type PanelMode = 'entity' | 'overview' | 'environment' | 'devices' | 'irrigation' | 'alerts' | 'crops'

const router = useRouter()
const user = getUser()
const input = ref('')
const loading = ref(false)
const sidebarOpen = ref(false)
const listRef = ref<HTMLElement>()
const inputRef = ref<HTMLTextAreaElement>()
const controller = ref<AbortController>()
const activeId = ref(1)
const panelEntity = ref<SceneEntity | null>(null)
const panelMode = ref<PanelMode | null>(null)
const searchQuery = ref('')
const activeOverlay = ref<'files' | 'projects' | 'filters' | 'apps' | null>(null)
const attachment = ref<{ name: string; content: string } | null>(null)
const demoRunning = ref(false)
const recording = ref(false)
const fileInput = ref<HTMLInputElement>()
const conversations = ref<Conversation[]>([
  { id: 1, title: '新的问农会话', time: '刚刚', messages: [] },
  { id: 2, title: '分析今日农场状态', time: '10:23', messages: [] },
  { id: 3, title: '查看 2 号温室异常原因', time: '09:48', messages: [] },
  { id: 4, title: '生成灌溉建议方案', time: '昨天', messages: [] },
  { id: 5, title: '对比 1 号和 2 号温室', time: '昨天', messages: [] }
])
const quickQuestions = ['分析今日状态', '查看异常地块', '生成灌溉方案', '对比温室数据']
const activeConversation = computed(() => conversations.value.find(item => item.id === activeId.value) || conversations.value[0])
const messages = computed(() => activeConversation.value?.messages || [])
const filteredConversations = computed(() => conversations.value.filter(item => item.title.toLowerCase().includes(searchQuery.value.trim().toLowerCase())))
const panelZone = computed(() => farmZones.find(zone => zone.entityId === panelEntity.value?.id))
const panelMetrics = computed(() => {
  if (panelMode.value === 'overview') return [
    { label: '农场健康度', value: `${dashboardSummary.health} 分`, tone: 'normal' }, { label: '在线设备', value: `${dashboardSummary.onlineDevices}/${dashboardSummary.totalDevices}`, tone: 'normal' },
    { label: '运行设备', value: `${dashboardSummary.runningDevices} 台`, tone: 'normal' }, { label: '待处理告警', value: `${dashboardSummary.openAlerts} 条`, tone: dashboardSummary.openAlerts ? 'warning' : 'normal' }
  ]
  if (panelMode.value === 'environment') return environmentMetrics.slice(0, 4).map(item => ({ label: item.label, value: item.value, tone: item.tone || 'normal' }))
  if (panelMode.value === 'devices') return [
    { label: '设备总数', value: `${deviceRecords.length} 台`, tone: 'normal' }, { label: '在线设备', value: `${deviceRecords.filter(item => item.online).length} 台`, tone: 'normal' },
    { label: '运行设备', value: `${deviceRecords.filter(item => item.enabled).length} 台`, tone: 'normal' }, { label: '离线设备', value: `${deviceRecords.filter(item => !item.online).length} 台`, tone: deviceRecords.some(item => !item.online) ? 'warning' : 'normal' }
  ]
  if (panelMode.value === 'irrigation') return [
    { label: '供水水位', value: `${dashboardSummary.waterLevel}%`, tone: 'normal' }, { label: '今日用水', value: `${dashboardSummary.todayWaterUsage} m³`, tone: 'normal' },
    { label: '灌溉单元', value: `${irrigationUnits.length} 个`, tone: 'normal' }, { label: '运行单元', value: `${irrigationUnits.filter(item => item.enabled).length} 个`, tone: 'normal' }
  ]
  if (panelMode.value === 'alerts') return [
    { label: '全部告警', value: `${alerts.length} 条`, tone: 'normal' }, { label: '待处理', value: `${alerts.filter(item => item.status !== '已处理' && item.status !== '已恢复').length} 条`, tone: 'warning' },
    { label: '预警', value: `${alerts.filter(item => item.level === '预警').length} 条`, tone: 'warning' }, { label: '已恢复', value: `${alerts.filter(item => item.status === '已恢复').length} 条`, tone: 'normal' }
  ]
  if (panelMode.value === 'crops') return farmZones.slice(0, 4).map(zone => ({ label: zone.crop, value: zone.stage, tone: 'normal' }))
  if (!panelEntity.value) return []
  const entity = panelEntity.value
  const zone = panelZone.value
  return [
    { label: '运行状态', value: entity.status === 'normal' ? '正常' : entity.status === 'attention' ? '需关注' : '预警', tone: entity.status },
    { label: '实时指标', value: entity.metric, tone: 'normal' },
    { label: '种植作物', value: zone?.crop || '设施农业', tone: 'normal' },
    { label: '生长阶段', value: zone?.stage || `健康度 ${entity.health || '--'}`, tone: 'normal' }
  ]
})
const panelTitle = computed(() => panelEntity.value?.name || ({ overview:'智慧农场01总览', environment:'农场环境中心', devices:'设备运行中心', irrigation:'智能灌溉中心', alerts:'农场告警中心', crops:'作物生长中心' } as Record<string,string>)[panelMode.value || ''] || 'AI 数据面板')
const panelHealth = computed(() => panelEntity.value?.health ?? (panelMode.value === 'alerts' ? 78 : panelMode.value === 'devices' ? 96 : dashboardSummary.health))
const panelTrend = computed(() => {
  const trends: Record<string, number[]> = {
    environment: [42, 48, 45, 57, 54, 62, 66, 63, 72, 70, 76, 74],
    irrigation: [35, 42, 38, 52, 48, 60, 57, 68, 64, 72, 69, 78],
    devices: [84, 86, 87, 90, 88, 92, 94, 93, 96, 95, 96, 96],
    alerts: [72, 66, 70, 58, 62, 54, 48, 52, 44, 40, 36, 32],
    crops: [51, 54, 58, 61, 65, 68, 72, 76, 79, 83, 86, 90]
  }
  return trends[panelMode.value || ''] || [58, 62, 60, 67, 65, 72, 76, 74, 82, 86, 84, panelHealth.value]
})
const trendPoints = computed(() => panelTrend.value.map((value, index) => `${index * 24},${92 - value * .72}`).join(' '))
const panelBars = computed(() => panelMetrics.value.map((item, index) => ({ label: item.label.slice(0, 4), value: Math.max(28, Math.min(96, [panelHealth.value, 72, 86, 64][index] || 55)) })))
const panelInsight = computed(() => panelMode.value === 'alerts' ? '风险数量持续回落，建议优先检查未处理预警。' : panelMode.value === 'irrigation' ? '供水压力稳定，当前运行单元处于合理区间。' : panelMode.value === 'devices' ? '设备在线率良好，离线节点需要安排现场排查。' : panelEntity.value ? `${panelEntity.value.name}整体状态${panelEntity.value.status === 'normal' ? '良好' : '需要关注'}，趋势保持稳定。` : '综合指标运行平稳，暂无突发性波动。')
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

function newConversation() {
  controller.value?.abort()
  const id = Date.now()
  conversations.value.unshift({ id, title: '新的问农会话', time: '刚刚', messages: [] })
  activeId.value = id
  input.value = ''
  loading.value = false
  panelEntity.value = null
  panelMode.value = null
  sidebarOpen.value = false
  nextTick(() => inputRef.value?.focus())
}

function selectConversation(id: number) {
  activeId.value = id
  const selected = conversations.value.find(item => item.id === id)
  panelMode.value = selected?.panelMode || null
  panelEntity.value = sceneEntities.find(item => item.id === selected?.panelEntityId) || null
  sidebarOpen.value = false
  nextTick(scrollToBottom)
}

function deleteConversation(id: number) {
  conversations.value = conversations.value.filter(item => item.id !== id)
  if (!conversations.value.length) return newConversation()
  if (activeId.value === id) selectConversation(conversations.value[0].id)
}

async function scrollToBottom() {
  await nextTick()
  if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
}

async function ask(question?: string) {
  const content = (question || input.value).trim()
  if (!content || loading.value || !activeConversation.value) return
  input.value = ''
  const matchedEntity = resolveEntity(content)
  if (matchedEntity) { panelEntity.value = matchedEntity; panelMode.value = 'entity' }
  else {
    const resolvedMode = resolvePanelMode(content)
    if (resolvedMode) { panelMode.value = resolvedMode; panelEntity.value = null }
    else panelMode.value = panelMode.value || 'overview'
  }
  const conversation = activeConversation.value
  conversation.panelMode = panelMode.value
  conversation.panelEntityId = panelEntity.value?.id || null
  conversation.messages.push({ role: 'user', content })
  if (conversation.messages.length === 1) conversation.title = content.slice(0, 18)
  conversation.time = '刚刚'
  loading.value = true
  await scrollToBottom()
  controller.value = new AbortController()
  try {
    const payload = await sendAssistantMessage(
      conversation.messages,
      buildAssistantContext(),
      controller.value.signal
    )
    conversation.messages.push({ role: 'assistant', content: payload.reply })
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      conversation.messages.push({ role: 'assistant', content: `暂时无法完成回答：${(error as Error).message}` })
    }
  } finally {
    loading.value = false
    controller.value = undefined
    await scrollToBottom()
  }
}

function resolveEntity(content: string): SceneEntity | null {
  const normalized = content.replace(/零/g, '0').replace(/一/g, '1').replace(/二/g, '2').replace(/三/g, '3').replace(/四/g, '4').replace(/五/g, '5').replace(/六/g, '6')
  const direct = sceneEntities.find(item => content.includes(item.name) || content.includes(item.id))
  if (direct) return direct
  const greenhouse = normalized.match(/0?([1-6])\s*号?\s*(?:大棚|温室)/)
  if (greenhouse) return sceneEntities.find(item => item.id === `gh-0${greenhouse[1]}`) || null
  const field = normalized.match(/0?([4-5])\s*号?\s*(?:地块|种植区)/)
  if (field) return sceneEntities.find(item => item.id === `field-0${field[1]}`) || null
  // 连续对话允许省略对象类型，例如已查看温室后继续问“那02号呢”。
  const shorthand = normalized.match(/(?:那|再看|看看|切换到|换到|查看)?\s*0?([1-6])\s*号(?:呢|怎么样|如何|的情况|的状况)?/)
  if (shorthand && panelEntity.value) {
    const prefix = panelEntity.value.type === 'greenhouse' ? 'gh' : panelEntity.value.type === 'field' ? 'field' : null
    if (prefix) return sceneEntities.find(item => item.id === `${prefix}-0${shorthand[1]}`) || null
  }
  return null
}

function resolvePanelMode(content: string): PanelMode | null {
  if (/告警|异常|风险|故障/.test(content)) return 'alerts'
  if (/灌溉|用水|水位|阀门/.test(content)) return 'irrigation'
  if (/设备|在线|离线|机器/.test(content)) return 'devices'
  if (/环境|温度|湿度|光照|二氧化碳|CO₂/.test(content)) return 'environment'
  if (/作物|长势|生长|温室数据|对比/.test(content)) return 'crops'
  if (/今日|全场|概览|总览|状态|快照/.test(content)) return 'overview'
  return null
}

function buildAssistantContext() {
  const base = '智慧农场01 · 智能问农数据面板。请依据提供的数据回答，缺少数据时明确说明。'
  const fileContext = attachment.value ? `用户附件“${attachment.value.name}”内容：${attachment.value.content.slice(0, 1200)}。` : ''
  if (panelMode.value !== 'entity' || !panelEntity.value) return `${base} 当前面板：${panelTitle.value}；面板指标：${panelMetrics.value.map(item => `${item.label}${item.value}`).join('、')}；当前全场环境：${environmentMetrics.map(item => `${item.label}${item.value}`).join('、')}。${fileContext}`
  const zone = panelZone.value
  return `${base} 当前面板对象：${panelEntity.value.name}；状态：${panelEntity.value.status}；指标：${panelEntity.value.metric}；健康度：${panelEntity.value.health ?? '暂无'}；作物：${zone?.crop || '暂无'}；面积：${zone?.area || '暂无'}；生长阶段：${zone?.stage || '暂无'}；环境：${zone?.environment || '暂无'}；相关未处理告警：${alerts.filter(item => item.entityId === panelEntity.value?.id && item.status !== '已处理').map(item => item.title).join('、') || '无'}。${fileContext}`
}

async function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 1024 * 1024) { window.alert('文件不能超过 1MB'); return }
  attachment.value = { name: file.name, content: await file.text() }
  activeOverlay.value = null
  input.value = `请分析附件 ${file.name}`
  await nextTick(() => inputRef.value?.focus())
}

function startVoice() {
  const SpeechRecognition = (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition
  if (!SpeechRecognition) { window.alert('当前浏览器不支持语音识别，请使用 Chrome 或 Edge'); return }
  const recognition = new SpeechRecognition()
  recognition.lang = 'zh-CN'; recognition.interimResults = false; recording.value = true
  recognition.onresult = (event: any) => { input.value = event.results[0][0].transcript; recording.value = false; inputRef.value?.focus() }
  recognition.onerror = () => { recording.value = false }
  recognition.onend = () => { recording.value = false }
  recognition.start()
}

function exportSnapshot() {
  const report = [`${panelTitle.value}`, new Date().toLocaleString('zh-CN'), ...panelMetrics.value.map(item => `${item.label}：${item.value}`), '', ...messages.value.map(item => `${item.role === 'user' ? '用户' : '小田'}：${item.content}`)].join('\n')
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `田言耕智-${panelTitle.value}.txt`; link.click(); URL.revokeObjectURL(url)
}

async function runDemo() {
  if (demoRunning.value) return
  demoRunning.value = true
  newConversation()
  const steps = ['分析今日农场状态', '我想查看01号大棚的状况']
  for (const step of steps) { input.value = step; await new Promise(resolve => window.setTimeout(resolve, 700)); await ask(step) }
  demoRunning.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    void ask()
  }
}

watch(conversations, value => localStorage.setItem('ty_assistant_conversations', JSON.stringify(value.slice(0, 30))), { deep: true })
onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem('ty_assistant_conversations') || 'null') as Conversation[] | null
    if (saved?.length) { conversations.value = saved; activeId.value = saved[0].id }
  } catch { /* ignore damaged local cache */ }
})
onBeforeUnmount(() => controller.value?.abort())
</script>

<template>
  <main class="ask-farm" :class="{ chatting: messages.length }">
    <button class="mobile-menu" aria-label="打开会话列表" @click="sidebarOpen = true">
      <svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
    <div v-if="sidebarOpen" class="sidebar-mask" @click="sidebarOpen = false"></div>

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-head">
        <BrandLogo />
        <button class="collapse" aria-label="收起侧栏" @click="sidebarOpen = false">
          <svg viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg>
        </button>
      </div>

      <button class="new-chat" @click="newConversation">
        <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>新聊天
      </button>

      <nav class="library-nav" aria-label="智能问农功能">
        <button @click="activeOverlay = 'files'"><svg viewBox="0 0 24 24"><path d="M5 3h10l4 4v14H5zM15 3v5h5M8 13h8M8 17h6"/></svg>文件库<span>{{ attachment ? '1 个文件' : '上传' }}</span></button>
        <button @click="activeOverlay = 'projects'"><svg viewBox="0 0 24 24"><path d="M4 6h6l2 2h8v11H4z"/></svg>项目<span>{{ conversations.length }} 个会话</span></button>
        <button @click="activeOverlay = 'apps'"><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>更多<span>全部应用</span></button>
      </nav>

      <section class="recent">
        <div class="recent-head"><h2>最近聊天</h2><input v-model="searchQuery" placeholder="搜索" aria-label="搜索会话" /></div>
        <button v-for="item in filteredConversations" :key="item.id" :class="{ active: item.id === activeId }" @click="selectConversation(item.id)">
          <svg viewBox="0 0 24 24"><path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-14a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z"/></svg>
          <span>{{ item.title }}</span><small>{{ item.time }}</small><i title="删除会话" @click.stop="deleteConversation(item.id)">×</i>
        </button>
      </section>

      <div class="sidebar-user">
        <span>{{ user?.name?.slice(0, 1) || '田' }}</span>
        <div><strong>{{ user?.name || '农场用户' }}</strong><small>{{ user?.email || '已登录' }}</small></div>
      </div>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <UserMenu />
      </header>

      <div v-if="!messages.length" class="welcome">
        <span class="sprout">✦</span>
        <h1>{{ greeting }}，{{ user?.name || '农场管理者' }} <em>🌱</em></h1>
        <p>我是田言耕智智能助手，随时为您提供农场数据分析和管理建议</p>
        <div class="composer welcome-composer">
          <textarea ref="inputRef" v-model="input" rows="2" maxlength="1200" placeholder="询问农场，获取数据或生成管理建议……" @keydown="onKeydown"></textarea>
          <div class="composer-tools">
            <button class="tool" title="添加文件" @click="fileInput?.click()"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
            <span v-if="attachment" class="attachment-chip">{{ attachment.name }} <button @click="attachment = null">×</button></span><span v-else>DeepSeek 农业智能体</span>
            <button class="voice" :class="{ recording }" title="语音输入" @click="startVoice"><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>
            <button class="send" :disabled="!input.trim() || loading" aria-label="发送" @click="ask()"><svg viewBox="0 0 24 24"><path d="m4 12 16-8-6 16-2.5-6.5L4 12Zm7.5 1.5L20 4"/></svg></button>
          </div>
        </div>
        <div class="quick-buttons">
          <button v-for="item in quickQuestions" :key="item" @click="ask(item)">{{ item }}</button>
        </div>
      </div>

      <section v-else class="conversation">
        <header><small>当前会话</small><h1>{{ activeConversation.title }}</h1></header>
        <Transition name="data-panel">
          <section v-if="panelMode" class="ai-data-panel">
            <header>
              <div><small>AI 已调取实时面板</small><h2>{{ panelTitle }}</h2></div>
              <span><i></i> 数据已同步</span>
            </header>
            <div class="visual-dashboard">
              <section class="health-gauge">
                <svg viewBox="0 0 120 120" aria-label="综合健康度">
                  <circle class="gauge-track" cx="60" cy="60" r="45" />
                  <circle class="gauge-value" cx="60" cy="60" r="45" :style="{ '--gauge': panelHealth }" />
                </svg>
                <div><strong>{{ panelHealth }}</strong><small>综合健康度</small></div>
                <span :class="{ warning: panelHealth < 85 }">{{ panelHealth >= 90 ? '运行优秀' : panelHealth >= 80 ? '状态良好' : '需要关注' }}</span>
              </section>
              <section class="trend-chart">
                <header><div><small>12 小时趋势</small><strong>{{ panelMetrics[1]?.value || '稳定' }}</strong></div><span>实时</span></header>
                <svg viewBox="0 0 264 96" preserveAspectRatio="none" aria-label="指标趋势图">
                  <defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#63a878" stop-opacity=".36"/><stop offset="1" stop-color="#63a878" stop-opacity="0"/></linearGradient></defs>
                  <path class="chart-grid" d="M0 24H264M0 48H264M0 72H264" />
                  <polygon class="trend-area" :points="`0,96 ${trendPoints} 264,96`" />
                  <polyline class="trend-line" :points="trendPoints" />
                  <circle class="trend-pulse" :cx="(panelTrend.length - 1) * 24" :cy="92 - panelTrend[panelTrend.length - 1] * .72" r="4" />
                </svg>
                <footer><span>06:00</span><span>12:00</span><span>现在</span></footer>
              </section>
              <section class="distribution-chart">
                <header><small>指标分布</small><strong>实时构成</strong></header>
                <div class="bar-list">
                  <div v-for="bar in panelBars" :key="bar.label"><span>{{ bar.label }}</span><i><b :style="{ '--bar': `${bar.value}%` }"></b></i><em>{{ bar.value }}</em></div>
                </div>
                <div class="living-visual" aria-hidden="true"><i></i><i></i><i></i><span></span></div>
              </section>
            </div>
            <div class="metric-grid">
              <article v-for="item in panelMetrics" :key="item.label" :class="item.tone">
                <small>{{ item.label }}</small><strong>{{ item.value }}</strong>
              </article>
            </div>
            <footer>
              <span class="insight"><i>AI</i>{{ panelInsight }}</span>
              <span>{{ panelZone?.area || '智慧农场实时数据' }}</span>
              <span>{{ panelZone?.environment || '数据已聚合分析' }}</span>
              <button @click="router.push('/workspaces/farm-01')">在数据工作台查看 →</button>
            </footer>
          </section>
        </Transition>
        <div ref="listRef" class="message-list">
          <article v-for="(message, index) in messages" :key="index" :class="message.role">
            <span v-if="message.role === 'assistant'" class="bot-avatar">田</span>
            <div><small>{{ message.role === 'assistant' ? '小田助手' : (user?.name || '我') }}</small><p>{{ message.content }}</p></div>
          </article>
          <article v-if="loading" class="assistant progress-message"><span class="bot-avatar">田</span><div><ProgressBar :value="null" label="小田正在分析农场数据" pending-label="生成回答" /></div></article>
        </div>
        <div class="composer conversation-composer">
          <textarea ref="inputRef" v-model="input" rows="1" maxlength="1200" placeholder="继续询问农场问题……" @keydown="onKeydown"></textarea>
          <div class="composer-tools"><button class="mini-tool" @click="fileInput?.click()">＋ 文件</button><button class="mini-tool" :class="{ recording }" @click="startVoice">语音</button><span>Enter 发送 · Shift + Enter 换行</span><button class="send" :disabled="!input.trim() || loading" aria-label="发送" @click="ask()"><svg viewBox="0 0 24 24"><path d="m4 12 16-8-6 16-2.5-6.5L4 12Zm7.5 1.5L20 4"/></svg></button></div>
        </div>
      </section>

      <footer class="action-dock" :class="{ compact: messages.length }">
        <button @click="ask('创建今日农场总览面板')"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg><span>新建面板</span></button>
        <button @click="activeOverlay = 'filters'"><svg viewBox="0 0 24 24"><path d="M4 5h16M7 12h10M10 19h4"/></svg><span>筛选条件</span></button>
        <button @click="exportSnapshot"><svg viewBox="0 0 24 24"><path d="M4 8h4l2-3h4l2 3h4v11H4z"/><circle cx="12" cy="13" r="3"/></svg><span>快照</span></button>
        <button :class="{ active: demoRunning }" @click="runDemo"><svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7z"/></svg><span>演示模式</span></button>
        <button @click="activeOverlay = 'apps'"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></svg><span>全部应用</span></button>
      </footer>
      <input ref="fileInput" class="sr-only" type="file" accept=".txt,.md,.csv,.json" @change="onFileSelected" />

      <Transition name="overlay">
        <div v-if="activeOverlay" class="feature-overlay" @click.self="activeOverlay = null">
          <section class="feature-card">
            <button class="feature-close" @click="activeOverlay = null">×</button>
            <template v-if="activeOverlay === 'files'"><small>知识上下文</small><h2>文件库</h2><p>上传文本、Markdown、CSV 或 JSON，内容会作为当前会话的分析依据。</p><div v-if="attachment" class="file-row"><strong>{{ attachment.name }}</strong><button @click="attachment = null">移除</button></div><button class="primary-action" @click="fileInput?.click()">选择文件</button></template>
            <template v-else-if="activeOverlay === 'projects'"><small>会话项目</small><h2>智慧农场01</h2><p>当前项目包含 {{ conversations.length }} 个问农会话，已自动保存在本机浏览器。</p><button class="primary-action" @click="newConversation(); activeOverlay = null">新建项目会话</button></template>
            <template v-else-if="activeOverlay === 'filters'"><small>面板筛选</small><h2>选择数据中心</h2><div class="app-grid"><button v-for="item in [{m:'overview',n:'农场总览'},{m:'environment',n:'环境中心'},{m:'devices',n:'设备中心'},{m:'irrigation',n:'灌溉中心'},{m:'crops',n:'作物中心'},{m:'alerts',n:'告警中心'}]" :key="item.m" @click="ask(`打开${item.n}`); activeOverlay = null">{{ item.n }}</button></div></template>
            <template v-else><small>田言耕智</small><h2>全部应用</h2><div class="app-grid"><button @click="ask('分析今日农场状态'); activeOverlay = null">智能总览</button><button @click="ask('查看农场环境'); activeOverlay = null">环境监测</button><button @click="ask('查看设备状态'); activeOverlay = null">设备管理</button><button @click="ask('生成灌溉方案'); activeOverlay = null">智能灌溉</button><button @click="router.push('/workspaces/farm-01')">数字孪生</button><button @click="ask('查看全部告警'); activeOverlay = null">告警中心</button></div></template>
          </section>
        </div>
      </Transition>
    </section>
  </main>
</template>

<style scoped lang="scss">
svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.ask-farm{height:100vh;display:flex;overflow:hidden;background:#edf0e9}.sidebar{position:relative;z-index:20;width:292px;flex:0 0 292px;display:flex;flex-direction:column;padding:24px 18px 18px;border-right:1px solid rgba(45,68,45,.1);background:rgba(246,248,242,.94)}.sidebar-head{display:flex;align-items:center;justify-content:space-between}.collapse{display:none;width:34px;height:34px;border:0;border-radius:10px;background:#e8ece4;cursor:pointer}.new-chat{height:46px;margin:28px 0 18px;display:flex;align-items:center;justify-content:center;gap:9px;border:0;border-radius:13px;background:linear-gradient(135deg,#527d54,#2f6744);color:white;font-weight:700;cursor:pointer;box-shadow:0 10px 22px rgba(48,103,67,.18)}.library-nav{display:flex;flex-direction:column;border-bottom:1px solid var(--border-soft);padding-bottom:15px}.library-nav button{height:42px;display:flex;align-items:center;gap:11px;padding:0 10px;border:0;border-radius:10px;background:transparent;color:#394637;cursor:default;text-align:left}.library-nav button span{margin-left:auto;font-size:9px;color:#9aa295}.recent{min-height:0;flex:1;padding-top:20px;overflow:auto}.recent h2{margin:0 8px 10px;font-size:13px;color:#7c8677;font-weight:600}.recent button{width:100%;height:43px;display:flex;align-items:center;gap:9px;padding:0 9px;border:0;border-radius:10px;background:transparent;color:#485145;cursor:pointer}.recent button:hover,.recent button.active{background:#e5ebe2;color:#315b3c}.recent button svg{width:16px}.recent button span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.recent button small{margin-left:auto;flex:0 0 auto;color:#9ba398;font-size:9px}.sidebar-user{display:flex;align-items:center;gap:10px;padding:11px;border-radius:13px;background:#e6ebe2}.sidebar-user>span{width:36px;height:36px;display:grid;place-items:center;border-radius:11px;background:#467952;color:white;font-weight:800}.sidebar-user div{min-width:0;display:flex;flex-direction:column}.sidebar-user strong{font-size:12px}.sidebar-user small{max-width:170px;overflow:hidden;text-overflow:ellipsis;color:#848d80;font-size:9px}.workspace{position:relative;min-width:0;flex:1;display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(248,250,245,.88),rgba(236,241,232,.78)),url('/platform/assets/farm-aerial.png') center/cover}.workspace::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 43%,rgba(255,255,255,.08),rgba(239,244,235,.72) 72%);backdrop-filter:blur(5px)}.workspace>*{position:relative;z-index:1}.topbar{height:86px;display:flex;align-items:center;justify-content:center;padding:0 30px}.topbar>.user-menu{position:absolute;right:28px}.mode-switch{display:flex;padding:5px;border:1px solid rgba(255,255,255,.55);border-radius:999px;background:rgba(232,236,227,.7);backdrop-filter:blur(18px)}.mode-switch button{height:39px;display:flex;align-items:center;gap:7px;padding:0 18px;border:0;border-radius:999px;background:transparent;color:#687263;font-size:12px;font-weight:700;cursor:pointer}.mode-switch button.active{background:white;color:#315e40;box-shadow:0 6px 15px rgba(43,67,40,.09)}.mode-switch button:first-child svg{fill:currentColor;stroke:none}.welcome{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 28px 130px;text-align:center}.sprout{width:42px;height:42px;display:grid;place-items:center;border-radius:15px;background:rgba(255,255,255,.6);color:#538356;font-size:23px;box-shadow:var(--shadow-sm)}.welcome h1{margin:17px 0 7px;color:#23462e;font-size:38px;letter-spacing:-1px}.welcome h1 em{font-style:normal;font-size:30px}.welcome>p{margin:0;color:#6d7969;font-size:14px}.composer{border:1px solid rgba(62,89,57,.12);border-radius:19px;background:rgba(255,255,255,.88);box-shadow:0 18px 48px rgba(38,65,39,.13);backdrop-filter:blur(22px);text-align:left}.welcome-composer{width:min(680px,100%);margin-top:31px;padding:15px}.composer textarea{width:100%;resize:none;border:0;outline:0;background:transparent;color:#263226;font-size:14px;line-height:1.6}.composer textarea::placeholder{color:#9aa297}.composer-tools{display:flex;align-items:center;gap:10px;margin-top:9px;color:#91998e;font-size:9px}.composer-tools>span{margin-left:auto}.tool,.send{display:grid;place-items:center;border:0;border-radius:50%;cursor:pointer}.tool{width:34px;height:34px;background:#eef1eb;color:#71806d}.send{width:38px;height:38px;background:linear-gradient(145deg,#559263,#34754b);color:white;box-shadow:0 7px 16px rgba(49,115,72,.22)}.send:disabled,.tool:disabled{opacity:.38;cursor:not-allowed}.send svg{width:18px}.quick-buttons{display:flex;flex-wrap:wrap;justify-content:center;gap:9px;margin-top:17px}.quick-buttons button{padding:9px 14px;border:1px solid rgba(64,93,61,.14);border-radius:999px;background:rgba(255,255,255,.58);color:#50604d;font-size:11px;cursor:pointer;backdrop-filter:blur(10px)}.quick-buttons button:hover{border-color:#769374;background:white;color:#345c3e}.conversation{width:min(860px,calc(100% - 40px));min-height:0;flex:1;align-self:center;display:flex;flex-direction:column;padding:4px 0 112px}.conversation>header{padding:12px 24px 14px;border-bottom:1px solid rgba(52,75,49,.1)}.conversation>header small{color:#849080;font-size:9px;letter-spacing:1px}.conversation>header h1{margin:4px 0 0;color:#284b33;font-size:20px}.message-list{min-height:0;flex:1;overflow:auto;padding:22px 24px;scroll-behavior:smooth}.message-list article{display:flex;align-items:flex-start;gap:10px;margin-bottom:19px}.message-list article.user{justify-content:flex-end}.message-list article>div{max-width:76%;display:flex;flex-direction:column;gap:5px}.message-list article.user>div{align-items:flex-end}.message-list small{color:#7f897c;font-size:9px}.message-list p{margin:0;padding:11px 14px;border:1px solid rgba(55,79,52,.1);border-radius:4px 16px 16px 16px;background:rgba(255,255,255,.76);color:#344033;font-size:12px;line-height:1.7;white-space:pre-wrap;box-shadow:0 7px 20px rgba(41,63,38,.06)}.message-list .user p{border:0;border-radius:16px 4px 16px 16px;background:linear-gradient(135deg,#4e845b,#326b47);color:white}.bot-avatar{width:30px;height:30px;display:grid;place-items:center;flex:0 0 auto;border-radius:10px;background:#3f7950;color:#d7f1dc;font-size:10px;font-weight:800}.typing p{display:flex;gap:4px;padding:14px!important}.typing i{width:5px;height:5px;border-radius:50%;background:#5d8e68;animation:typing 1s infinite}.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}@keyframes typing{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}}.conversation-composer{padding:11px 12px 8px;margin:0 24px}.conversation-composer textarea{padding:0 3px}.action-dock{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);display:flex;gap:12px;padding:10px 18px;border:1px solid rgba(255,255,255,.7);border-radius:999px;background:rgba(255,255,255,.7);box-shadow:0 17px 40px rgba(39,61,37,.13);backdrop-filter:blur(22px)}.action-dock button{min-width:72px;display:flex;flex-direction:column;align-items:center;gap:4px;border:0;background:transparent;color:#5e6a5a;font-size:9px;cursor:pointer}.action-dock button:hover{color:#326442}.action-dock svg{width:19px}.mobile-menu,.sidebar-mask{display:none}
@media(max-width:900px){.sidebar{position:fixed;inset:0 auto 0 0;transform:translateX(-102%);transition:transform .25s;width:290px;box-shadow:20px 0 60px rgba(23,43,26,.18)}.sidebar.open{transform:none}.collapse{display:grid;place-items:center}.sidebar-mask{display:block;position:fixed;z-index:15;inset:0;background:rgba(14,30,19,.28);backdrop-filter:blur(3px)}.mobile-menu{display:grid;place-items:center;position:fixed;z-index:12;left:17px;top:22px;width:40px;height:40px;border:1px solid rgba(51,76,49,.12);border-radius:12px;background:rgba(255,255,255,.72);color:#3c6044}.topbar{justify-content:flex-start;padding-left:70px}.mode-switch{margin:auto}.topbar>.user-menu{right:17px}}
@media(max-width:650px){.topbar{height:74px;padding-left:58px}.topbar>.user-menu{display:none}.mode-switch button{padding:0 11px;font-size:10px}.welcome{justify-content:flex-start;padding:18vh 16px 115px}.welcome h1{font-size:27px}.welcome>p{max-width:330px;font-size:12px;line-height:1.6}.welcome-composer{margin-top:23px}.conversation{width:100%;padding-bottom:97px}.conversation>header{padding-left:18px}.message-list{padding:16px}.message-list article>div{max-width:84%}.conversation-composer{margin:0 12px}.action-dock{bottom:15px;gap:3px;padding:9px 10px}.action-dock button{min-width:65px}.action-dock button span{font-size:8px}}
.ask-farm{font-family:var(--font-sans);font-feature-settings:"kern" 1}
.new-chat{font-size:14px;letter-spacing:.2px}
.library-nav button{font-size:14px;font-weight:500}.library-nav button span{font-size:11px}
.recent h2{font-size:14px;font-weight:650;letter-spacing:.2px}.recent button span{font-size:13px;font-weight:500}.recent button small{font-size:11px}
.sidebar-user strong{font-size:14px;font-weight:650}.sidebar-user small{font-size:11px;line-height:1.5}
.welcome h1{font-family:var(--font-display);font-size:40px;font-weight:700;line-height:1.28;letter-spacing:-.6px}.welcome>p{font-size:15px;line-height:1.8;font-weight:400}
.composer textarea{font-size:15px;line-height:1.75}.composer-tools{font-size:11px}
.quick-buttons button{font-size:13px;font-weight:500;line-height:1.4}
.conversation>header small{font-size:11px;letter-spacing:.8px}.conversation>header h1{font-family:var(--font-display);font-size:23px;font-weight:700;line-height:1.4}
.message-list small{font-size:11px;font-weight:500}.message-list p{font-size:14px;line-height:1.85;font-weight:400;letter-spacing:.05px}.bot-avatar{font-size:12px}
.action-dock button{font-size:11px;font-weight:500;line-height:1.35}
@media(max-width:650px){.welcome h1{font-size:30px}.welcome>p{max-width:350px;font-size:14px;line-height:1.75}.action-dock button span{font-size:10px}}
.workspace{background:linear-gradient(180deg,rgba(255,255,255,.94) 0%,rgba(255,255,255,.78) 38%,rgba(239,245,235,.42) 100%),url('/platform/assets/farm-aerial.png') center/cover}
.workspace::before{background:linear-gradient(180deg,rgba(255,255,255,.2),rgba(242,247,239,.06));backdrop-filter:blur(2px)}
.ai-data-panel{margin:0 24px 4px;padding:16px;border:1px solid rgba(52,91,58,.12);border-radius:20px;background:rgba(255,255,255,.84);box-shadow:0 18px 42px rgba(42,72,44,.1);backdrop-filter:blur(24px)}
.ai-data-panel>header{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px}.ai-data-panel>header div{display:flex;flex-direction:column;gap:2px}.ai-data-panel>header small{color:#788578;font-size:10px;letter-spacing:.6px}.ai-data-panel h2{margin:0;color:#234b31;font-size:20px}.ai-data-panel>header>span{display:flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:#edf6ed;color:#4d7654;font-size:10px}.ai-data-panel>header i{width:6px;height:6px;border-radius:50%;background:#51a564;box-shadow:0 0 0 4px rgba(81,165,100,.12)}
.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.metric-grid article{min-width:0;padding:12px;border:1px solid rgba(50,77,49,.08);border-radius:14px;background:#f6f8f4}.metric-grid article.attention,.metric-grid article.warning{background:#fff8e9}.metric-grid small{display:block;margin-bottom:5px;color:#839080;font-size:10px}.metric-grid strong{display:block;overflow:hidden;text-overflow:ellipsis;color:#263c2a;font-size:14px;white-space:nowrap}.ai-data-panel>footer{display:flex;align-items:center;gap:16px;margin-top:12px;color:#6d786b;font-size:10px}.ai-data-panel>footer button{margin-left:auto;border:0;background:transparent;color:#397349;font-size:11px;font-weight:650;cursor:pointer}
.data-panel-enter-active,.data-panel-leave-active{transition:opacity .45s ease,transform .55s cubic-bezier(.2,.8,.2,1),filter .45s ease}.data-panel-enter-from,.data-panel-leave-to{opacity:0;transform:translateY(-22px) scale(.97);filter:blur(8px)}
.action-dock{transition:left .55s cubic-bezier(.2,.8,.2,1),right .55s cubic-bezier(.2,.8,.2,1),bottom .55s cubic-bezier(.2,.8,.2,1),transform .55s cubic-bezier(.2,.8,.2,1),border-radius .4s ease,padding .4s ease}
.action-dock.compact{left:auto;right:18px;bottom:50%;transform:translateY(50%);flex-direction:column;gap:5px;padding:12px 8px;border-radius:24px}.action-dock.compact button{min-width:54px;padding:6px 2px}.action-dock.compact button span{font-size:9px}
.chatting .conversation{width:min(900px,calc(100% - 130px));padding-right:70px}.chatting .message-list{padding-top:14px}
@media(max-width:900px){.chatting .conversation{width:100%;padding-right:70px}.metric-grid{grid-template-columns:repeat(2,1fr)}.action-dock.compact{right:8px}}
@media(max-width:650px){.ai-data-panel{margin:0 12px;padding:12px}.ai-data-panel>header>span{display:none}.metric-grid{grid-template-columns:repeat(2,1fr)}.ai-data-panel>footer span{display:none}.chatting .conversation{padding-right:0}.action-dock.compact{right:8px;bottom:12px;transform:none;flex-direction:row;padding:8px;border-radius:20px}.action-dock.compact button{min-width:50px}.conversation{padding-bottom:86px}}
.topbar{height:92px;padding:14px 30px 14px}.topbar :deep(.mode-switch){min-height:50px;padding:5px 7px;background:rgba(239,241,236,.92);box-shadow:0 12px 30px rgba(38,58,38,.1)}
.recent-head{display:flex;align-items:center;gap:8px;margin:0 8px 8px}.recent-head h2{margin:0;flex:1}.recent-head input{width:70px;padding:5px 7px;border:1px solid transparent;border-radius:8px;background:#edf1ea;color:#455242;font-size:11px;outline:0;transition:.2s}.recent-head input:focus{width:112px;border-color:#aac0aa;background:white}
.recent button i{display:none;margin-left:2px;font-style:normal;font-size:16px;color:#879285}.recent button:hover i{display:block}.recent button i:hover{color:#b34f46}
.voice,.mini-tool{border:0;background:transparent;color:#748071;cursor:pointer}.voice{width:34px;height:34px;display:grid;place-items:center;border-radius:50%}.voice:hover,.mini-tool:hover{background:#edf2eb;color:#39714a}.voice.recording,.mini-tool.recording{color:#d34b42;animation:voice-pulse 1s infinite}@keyframes voice-pulse{50%{background:#fee9e7;box-shadow:0 0 0 6px rgba(211,75,66,.08)}}.attachment-chip{display:flex!important;align-items:center;gap:5px;padding:4px 8px;border-radius:999px;background:#eaf2e8;color:#47704f!important}.attachment-chip button{border:0;background:transparent;cursor:pointer}.mini-tool{padding:4px 7px;border-radius:7px;font-size:10px}.composer-tools>.mini-tool+span{margin-left:auto}
.feature-overlay{position:fixed;z-index:100;inset:0;display:grid;place-items:center;padding:20px;background:rgba(22,42,27,.28);backdrop-filter:blur(8px)}.feature-card{position:relative;width:min(520px,100%);padding:28px;border:1px solid rgba(255,255,255,.8);border-radius:24px;background:rgba(250,252,248,.96);box-shadow:0 30px 90px rgba(20,44,27,.25)}.feature-card>small{color:#64816a;font-size:10px;letter-spacing:1px}.feature-card h2{margin:5px 0 9px;color:#254a31;font-size:25px}.feature-card p{margin:0 0 20px;color:#6c7869;line-height:1.7}.feature-close{position:absolute;right:16px;top:14px;width:34px;height:34px;border:0;border-radius:10px;background:#edf1ea;font-size:21px;cursor:pointer}.primary-action{padding:11px 17px;border:0;border-radius:11px;background:#3f774e;color:white;font-weight:650;cursor:pointer}.file-row{display:flex;align-items:center;justify-content:space-between;margin:12px 0;padding:12px;border-radius:12px;background:#edf2eb}.file-row button{border:0;background:transparent;color:#ad4e47;cursor:pointer}.app-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.app-grid button{min-height:72px;padding:12px;border:1px solid rgba(49,78,52,.1);border-radius:14px;background:#f1f5ef;color:#35583c;font-weight:600;cursor:pointer;transition:.2s}.app-grid button:hover{transform:translateY(-3px);background:white;box-shadow:0 10px 24px rgba(39,70,43,.1)}.overlay-enter-active,.overlay-leave-active{transition:.3s}.overlay-enter-from,.overlay-leave-to{opacity:0}.overlay-enter-from .feature-card,.overlay-leave-to .feature-card{transform:translateY(18px) scale(.96)}.feature-card{transition:.4s cubic-bezier(.2,.8,.2,1)}
.action-dock button.active{color:#2e7043}.action-dock button.active svg{animation:demo-spin 1.5s linear infinite}@keyframes demo-spin{to{transform:rotate(360deg)}}
@media(max-width:650px){.topbar{height:92px;padding-top:14px}.app-grid{grid-template-columns:repeat(2,1fr)}.feature-card{padding:23px}.recent-head input{width:105px}}
.chatting .conversation{width:min(1120px,calc(100% - 120px));padding-right:68px}.ai-data-panel{padding:17px 18px 14px;background:linear-gradient(145deg,rgba(255,255,255,.94),rgba(244,249,243,.88))}
.visual-dashboard{display:grid;grid-template-columns:150px minmax(240px,1.55fr) minmax(190px,1fr);gap:10px;margin-bottom:10px}.visual-dashboard>section{position:relative;min-width:0;height:146px;padding:12px;border:1px solid rgba(49,81,52,.08);border-radius:15px;background:rgba(246,249,245,.82);overflow:hidden}
.health-gauge{display:flex;flex-direction:column;align-items:center;justify-content:center}.health-gauge svg{width:104px;height:104px;transform:rotate(-90deg)}.health-gauge circle{fill:none;stroke-width:9}.gauge-track{stroke:#e3eae1}.gauge-value{stroke:#4b9962;stroke-linecap:round;stroke-dasharray:283;stroke-dashoffset:calc(283 - 2.83 * var(--gauge));animation:gauge-in 1.1s cubic-bezier(.2,.8,.2,1)}@keyframes gauge-in{from{stroke-dashoffset:283}}.health-gauge>div{position:absolute;top:43px;display:flex;flex-direction:column;align-items:center}.health-gauge>div strong{color:#245232;font-size:27px;line-height:1}.health-gauge>div small{margin-top:4px;color:#849083;font-size:9px}.health-gauge>span{margin-top:-5px;padding:3px 8px;border-radius:999px;background:#e3f2e5;color:#3d784c;font-size:9px}.health-gauge>span.warning{background:#fff0d7;color:#a76a18}
.trend-chart{display:flex;flex-direction:column}.trend-chart>header,.distribution-chart>header{display:flex;align-items:flex-start;justify-content:space-between}.trend-chart header div,.distribution-chart header{display:flex;flex-direction:column}.trend-chart header small,.distribution-chart header small{color:#839080;font-size:9px}.trend-chart header strong,.distribution-chart header strong{margin-top:2px;color:#294931;font-size:13px}.trend-chart>header>span{padding:3px 7px;border-radius:999px;background:#e5f2e7;color:#4d7b57;font-size:8px}.trend-chart>svg{width:100%;height:83px;margin-top:2px;overflow:visible}.chart-grid{fill:none;stroke:rgba(66,91,65,.09);stroke-width:1}.trend-area{fill:url(#trendFill);animation:chart-fade .8s ease}.trend-line{fill:none;stroke:#4e9864;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:420;animation:draw-line 1.35s cubic-bezier(.2,.8,.2,1)}.trend-pulse{fill:#fff;stroke:#45905b;stroke-width:3;animation:pulse-dot 1.6s infinite}@keyframes draw-line{from{stroke-dashoffset:420}to{stroke-dashoffset:0}}@keyframes chart-fade{from{opacity:0}}@keyframes pulse-dot{50%{r:6;opacity:.55}}.trend-chart>footer{display:flex;justify-content:space-between;color:#98a197;font-size:8px}
.distribution-chart{display:flex;flex-direction:column}.bar-list{display:flex;flex-direction:column;gap:7px;margin-top:10px}.bar-list>div{display:grid;grid-template-columns:37px 1fr 22px;align-items:center;gap:5px;color:#788475;font-size:8px}.bar-list i{height:5px;border-radius:999px;background:#e1e8df;overflow:hidden}.bar-list b{display:block;width:var(--bar);height:100%;border-radius:inherit;background:linear-gradient(90deg,#79b484,#3e8a57);animation:bar-grow 1s cubic-bezier(.2,.8,.2,1)}.bar-list em{font-style:normal;text-align:right;color:#4e6652}@keyframes bar-grow{from{width:0}}
.living-visual{position:absolute;right:9px;bottom:5px;width:36px;height:33px;opacity:.18}.living-visual span{position:absolute;left:17px;bottom:0;width:2px;height:28px;border-radius:2px;background:#287443;animation:stem-sway 3s ease-in-out infinite}.living-visual i{position:absolute;width:15px;height:9px;border-radius:100% 0 100% 0;background:#3c9a57;transform-origin:right bottom}.living-visual i:nth-child(1){left:3px;bottom:15px;transform:rotate(22deg)}.living-visual i:nth-child(2){right:1px;bottom:21px;transform:scaleX(-1) rotate(15deg)}.living-visual i:nth-child(3){right:1px;bottom:8px;transform:scaleX(-1) rotate(-5deg)}@keyframes stem-sway{50%{transform:rotate(4deg)}}
.metric-grid article{position:relative;padding:10px 12px;overflow:hidden}.metric-grid article::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:2px;background:linear-gradient(90deg,#5ca66f,transparent);transform:scaleX(0);transform-origin:left;animation:metric-in .8s .25s forwards}@keyframes metric-in{to{transform:scaleX(1)}}.ai-data-panel>footer{gap:12px}.ai-data-panel>footer .insight{display:flex;align-items:center;min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#526456}.insight>i{margin-right:6px;padding:2px 5px;border-radius:5px;background:#3d7d50;color:white;font-style:normal;font-size:7px}
@media(max-width:1050px){.visual-dashboard{grid-template-columns:130px 1fr}.distribution-chart{display:none}.chatting .conversation{width:calc(100% - 80px)}}
@media(max-width:700px){.visual-dashboard{grid-template-columns:1fr}.health-gauge{display:none}.visual-dashboard>section{height:132px}.chatting .conversation{width:100%;padding-right:0}.ai-data-panel>footer .insight{display:none}}
/* 与数据工作台统一：真实场景 + 农业绿液态玻璃 */
.ask-farm{background:#173a2b}.sidebar{border-right:1px solid rgba(255,255,255,.68);background:linear-gradient(145deg,rgba(244,249,242,.94),rgba(224,235,224,.86));box-shadow:12px 0 44px rgba(7,32,19,.18);backdrop-filter:blur(32px) saturate(155%)}
.sidebar::before{content:"";position:absolute;inset:0 0 auto;height:110px;background:linear-gradient(180deg,rgba(255,255,255,.48),transparent);pointer-events:none}.sidebar>*{position:relative}.new-chat{background:linear-gradient(145deg,#43845a,#236540);box-shadow:0 11px 28px rgba(18,77,42,.28),inset 0 1px rgba(255,255,255,.34)}.library-nav button:hover,.recent button:hover,.recent button.active{background:rgba(255,255,255,.48);box-shadow:inset 0 1px rgba(255,255,255,.7)}.sidebar-user{border:1px solid rgba(255,255,255,.7);background:rgba(255,255,255,.48);box-shadow:0 10px 24px rgba(33,66,40,.1);backdrop-filter:blur(18px)}
.workspace{background:linear-gradient(180deg,rgba(7,31,22,.14),rgba(7,31,22,.04) 42%,rgba(8,35,23,.2)),url('/platform/assets/farm-aerial.png') center/cover}.workspace::before{background:radial-gradient(circle at 52% 38%,rgba(255,255,255,.1),rgba(11,42,28,.18));backdrop-filter:none}
.topbar :deep(.mode-switch){border:1px solid rgba(255,255,255,.72);background:linear-gradient(135deg,rgba(238,247,239,.72),rgba(194,218,201,.54));box-shadow:0 18px 48px rgba(6,29,16,.3),inset 0 1px rgba(255,255,255,.95);backdrop-filter:blur(34px) saturate(180%)}
.welcome{text-shadow:0 1px rgba(255,255,255,.35)}.welcome h1{color:#173f28}.welcome>p{color:#405a45;font-weight:500}.sprout{border:1px solid rgba(255,255,255,.75);background:rgba(239,247,238,.72);box-shadow:0 15px 38px rgba(7,35,20,.22);backdrop-filter:blur(22px)}
.composer{border:1px solid rgba(255,255,255,.78);background:linear-gradient(145deg,rgba(249,252,247,.91),rgba(226,238,226,.78));box-shadow:0 22px 60px rgba(6,29,16,.28),inset 0 1px rgba(255,255,255,.96);backdrop-filter:blur(30px) saturate(155%)}.quick-buttons button{border-color:rgba(255,255,255,.7);background:rgba(239,247,238,.72);box-shadow:0 8px 20px rgba(8,42,23,.12);color:#294d35}.quick-buttons button:hover{background:#fff;transform:translateY(-2px)}
.conversation>header{border-bottom-color:rgba(255,255,255,.32);text-shadow:0 1px rgba(255,255,255,.3)}.conversation>header small{color:#49654f}.conversation>header h1{color:#173f28}.ai-data-panel{border:1px solid rgba(255,255,255,.76);background:linear-gradient(145deg,rgba(248,252,247,.92),rgba(220,235,222,.84));box-shadow:0 24px 64px rgba(5,31,16,.3),inset 0 1px rgba(255,255,255,.95);backdrop-filter:blur(32px) saturate(155%)}.visual-dashboard>section,.metric-grid article{border-color:rgba(255,255,255,.66);background:rgba(248,251,246,.58);box-shadow:inset 0 1px rgba(255,255,255,.65)}
.message-list article.assistant p{border-color:rgba(255,255,255,.68);background:rgba(245,250,243,.9);box-shadow:0 12px 32px rgba(6,30,17,.2);backdrop-filter:blur(20px)}.message-list .user p{background:linear-gradient(145deg,#43845a,#236540);box-shadow:0 10px 25px rgba(20,75,41,.28)}.message-list small{color:#365941}.bot-avatar{background:linear-gradient(145deg,#4e9864,#276d45);box-shadow:0 7px 18px rgba(20,75,41,.3)}
.action-dock{border:1px solid rgba(255,255,255,.68);background:linear-gradient(135deg,rgba(238,247,239,.68),rgba(194,218,201,.48));box-shadow:0 22px 65px rgba(6,29,16,.35),inset 0 1px rgba(255,255,255,.95),inset 0 -12px 28px rgba(53,93,64,.08);backdrop-filter:blur(34px) saturate(190%)}.action-dock button{color:#294c36}.action-dock button:hover{border-radius:16px;background:rgba(255,255,255,.34);transform:translateY(-2px)}.action-dock.compact button:hover{transform:translateX(-2px)}
.feature-overlay{background:rgba(5,28,17,.45)}.feature-card{border-color:rgba(255,255,255,.72);background:linear-gradient(145deg,rgba(245,250,243,.96),rgba(218,233,220,.94));box-shadow:0 34px 100px rgba(4,27,14,.42);backdrop-filter:blur(34px)}
.progress-message>div{width:min(360px,72%);padding:12px 14px;border:1px solid rgba(255,255,255,.68);border-radius:4px 16px 16px 16px;background:rgba(245,250,243,.9);box-shadow:0 12px 32px rgba(6,30,17,.16);backdrop-filter:blur(20px)}
/* 问农保留原始明亮航拍背景，组件材质继续与数据工作台一致。 */
.ask-farm{background:#edf0e9}.workspace{background:linear-gradient(180deg,rgba(255,255,255,.94) 0%,rgba(255,255,255,.78) 38%,rgba(239,245,235,.42) 100%),url('/platform/assets/farm-aerial.png') center/cover}.workspace::before{background:linear-gradient(180deg,rgba(255,255,255,.2),rgba(242,247,239,.06));backdrop-filter:blur(2px)}
</style>
