import { getToken } from './auth'

export interface AgentRun { id: string; farmId:string; parentRunId?:string; question: string; status: string; model: string; answer?: string; error?: string; createdAt: string }
export interface AgentEvent { id: number; runId: string; seq: number; type: string; timestamp: string; payload: string }
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/agent${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` } })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.message || '任务请求失败，请重试')
  return payload
}
export const listRuns = () => request<AgentRun[]>('/runs')
export const getRun = (id: string) => request<AgentRun>(`/runs/${encodeURIComponent(id)}`)
export const getEvents = (id: string, seq = 0) => request<AgentEvent[]>(`/runs/${encodeURIComponent(id)}/events?after_seq=${seq}`)
export const createRun = (question: string, farmId = 'yantian-01') => request<AgentRun>('/runs', { method: 'POST', body: JSON.stringify({ question, farmId }) })
export const cancelRun = (id: string) => request<AgentRun>(`/runs/${encodeURIComponent(id)}/cancel`, { method: 'POST' })

export const retryRun = (id:string) => request<AgentRun>(`/runs/${encodeURIComponent(id)}/retry`,{method:'POST'})

export const followupRun = (id:string,question:string) => request<AgentRun>(`/runs/${encodeURIComponent(id)}/followup`,{method:'POST',body:JSON.stringify({question})})
