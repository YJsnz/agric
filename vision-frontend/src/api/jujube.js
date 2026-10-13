import client from './client'
export async function diagnoseJujube(image, task, context, signal) {
  const form = new FormData()
  form.append('image', image); form.append('task', task)
  for (const [key, value] of Object.entries(context)) if (value !== '' && value != null) form.append(key, String(value))
  return (await client.post('/api/jujube/diagnose', form, { signal })).data
}
export const healthJujube = signal => client.get('/api/jujube/health', { signal }).then(r => r.data)
export const failureLabels = { model_unavailable: '视觉模型不可用', invalid_image: '图片非法或无法解码', image_too_large: '图片过大', invalid_request: '请检查图片和输入信息', inference_failed: '视觉推理失败', kg_unavailable: 'KG检索失败', graphrag_unavailable: 'GraphRAG不可用', llm_unavailable: 'DeepSeek不可用', visual_mapping_unavailable: '视觉实体映射不可用', grounding_unavailable_or_failed: '回答未通过核查或核查服务不可用' }
export function jujubeError(e) { if(e.code==='UPLOAD_TOO_LARGE')return e.message; return failureLabels[e.response?.data?.error?.code] || e.response?.data?.message || (e.response ? '服务异常，请稍后重试' : '网络错误：无法连接枣诊断服务') }
