import axios from 'axios'
const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8091', timeout: 300000 })
export function diagnosePear(file, context = {}, signal) {
  const form = new FormData()
  form.append('file', file)
  form.append('organ', 'leaf')
  for (const key of ['region', 'scene', 'growth_stage', 'temperature', 'humidity', 'rainfall']) {
    const value = context[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') form.append(key, String(value).trim())
  }
  return client.post('/api/pear/diagnose', form, { signal }).then(r => r.data)
}
export function errorMessage(error) {
  if (error.code === 'ECONNABORTED') return '请求超时。后端可能仍在处理，请稍后重试。'
  if (!error.response) return '无法连接诊断服务，请确认后端已启动并检查网络连接。'
  const detail = error.response.data?.detail
  if (Array.isArray(detail)) return '输入信息不符合要求，请检查图片和气象数值。'
  return `HTTP ${error.response.status}：${typeof detail === 'string' ? detail : '服务执行异常，请稍后重试。'}`
}
