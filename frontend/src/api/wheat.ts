import { getToken } from './auth'

export interface WheatResult {
  status: string; visual_observations: Record<string, any>; environment_context: Record<string, any>
  candidate_risks: any[]; knowledge: any; assessment: string | Record<string, any> | null
  recommendations: any[]; grounding_status: string; citations: any[]; warnings: any[]; limitations: string[]
}
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController()
  const abort = () => controller.abort()
  options.signal?.addEventListener('abort', abort, { once: true })
  const timeout = window.setTimeout(abort, 420000)
  try {
    if (options.signal?.aborted) controller.abort()
    const response = await fetch(path, { ...options, signal: controller.signal, headers: { Authorization: `Bearer ${getToken() || ''}` } })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : `请求失败（${response.status}），请检查图片及输入。`)
    return data
  } finally { clearTimeout(timeout); options.signal?.removeEventListener('abort', abort) }
}
export function diagnoseWheat(body: FormData, signal?: AbortSignal) {
  return request<WheatResult>('/api/wheat/diagnose', { method: 'POST', body, signal })
}
export function getWheatModelStatus() { return request<Record<string, any>>('/api/wheat/models/status') }
export function wheatGraphUrl(entities: any[] = []) {
  const url = new URL(import.meta.env.VITE_GRAPH_URL || 'http://127.0.0.1:8090/', window.location.href)
  url.searchParams.set('crop', 'wheat')
  if (entities[0]?.entity) url.searchParams.set('search', entities[0].entity)
  if (entities[0]?.entity_id) url.searchParams.set('node', entities[0].entity_id)
  return url.toString()
}

