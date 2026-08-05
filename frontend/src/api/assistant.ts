import { clearAuth, getToken } from './auth'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface AssistantReply {
  reply: string
  model: string
}

export interface AssistantUserState {
  workbenchesJson: string
  conversationsJson: string
  updatedAt?: string | null
}

async function stateRequest(options: RequestInit = {}): Promise<AssistantUserState> {
  const response = await fetch('/api/assistant/state', {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(options.headers || {}) }
  })
  const payload = await response.json().catch(() => ({})) as AssistantUserState & { message?: string }
  if (!response.ok) throw new Error(payload.message || `用户工作台同步失败（${response.status}）`)
  return payload
}

export function fetchAssistantState() { return stateRequest() }

export function saveAssistantState(workbenches: unknown, conversations: unknown) {
  return stateRequest({ method: 'PUT', body: JSON.stringify({ workbenchesJson: JSON.stringify(workbenches), conversationsJson: JSON.stringify(conversations) }) })
}

export async function sendAssistantMessage(
  messages: ChatMessage[],
  context = '',
  signal?: AbortSignal
): Promise<AssistantReply> {
  const token = getToken()
  const response = await fetch('/api/assistant/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    signal,
    body: JSON.stringify({ messages: messages.slice(-12), context })
  })
  const payload = await response.json().catch(() => ({})) as Partial<AssistantReply> & { message?: string }
  if (!response.ok) {
    if (response.status === 401) {
      clearAuth()
      window.location.replace('/#/sign-in')
    }
    throw new Error(payload.message || `请求失败（${response.status}）`)
  }
  return {
    reply: payload.reply || '暂时没有获得有效回答，请稍后重试。',
    model: payload.model || 'DeepSeek'
  }
}
