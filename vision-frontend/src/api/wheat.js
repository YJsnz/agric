import axios from 'axios'
const client = axios.create({ baseURL: import.meta.env.VITE_WHEAT_API_BASE_URL || '', timeout: 420000 })
export async function diagnoseWheat(files, context, knowledgeEnabled, signal) {
  const body = new FormData()
  for (const [key, file] of Object.entries(files)) if (file) body.append(`${key}_image`, file)
  for (const [key, value] of Object.entries(context)) {
    if (value !== null && value !== undefined && String(value).trim() !== '') body.append(key, String(value).trim())
  }
  body.append('knowledge_enabled', String(knowledgeEnabled))
  return (await client.post('/api/wheat/diagnose', body, { signal })).data
}
