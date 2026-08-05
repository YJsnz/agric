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
