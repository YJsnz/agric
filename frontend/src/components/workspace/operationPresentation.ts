/** Translate saved business data for people; storage keys stay in the API. */
export function operationDescription(detail: string): string {
  const text = detail?.trim() || ''
  if (!text) return '暂无补充说明'
  let data: Record<string, unknown>
  try {
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return '记录已保存'
    data = parsed
  } catch {
    return /^[\[{]/.test(text) ? '记录已保存，暂无补充说明' : text
  }
  const parts: string[] = []
  const units: Record<string,string> = { kg:'千克', g:'克', t:'吨', '%':'%', '件':'件' }
  const value = (key: string) => typeof data[key] === 'string' || typeof data[key] === 'number' ? String(data[key]) : ''
  if (value('batchId')) parts.push(`关联批次：${value('batchId')}`)
  if (value('harvestDate')) parts.push(`采收日期：${value('harvestDate')}`)
  if (value('quantity')) parts.push(`${data.type === 'postharvest_loss' ? '损耗数量' : '数量'}：${value('quantity')} ${units[value('unit')] || value('unit')}`)
  for (const [key,label] of [['reason','损耗原因'],['warehouse','存放位置'],['temperature','温度'],['humidity','湿度'],['note','说明'],['detail','说明'],['limitation','记录提示']] as const) {
    if (value(key)) parts.push(`${label}：${value(key)}${key === 'temperature' ? '℃' : key === 'humidity' ? '%' : ''}`)
  }
  if (Array.isArray(data.actions)) {
    const actions = data.actions.filter((item): item is string => typeof item === 'string')
    if (actions.length) parts.push(`处理措施：${actions.join('、')}`)
  }
  if (data.grades && typeof data.grades === 'object') {
    const grades = data.grades as Record<string,unknown>
    const labels: Record<string,string> = { premium:'特级',first:'一级',second:'二级',processing:'加工级' }
    const values = Object.entries(labels).filter(([key])=>typeof grades[key] === 'number').map(([key,label])=>`${label} ${grades[key]}%`)
    if (values.length) parts.push(`分选结果：${values.join('、')}`)
  }
  return parts.join('\n') || '业务记录已保存'
}
