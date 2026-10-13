export function fastOverview(question){return /^(分析|查看|查询)农场当前环境与异常[，,]?\s*(列出依据和缺少的数据)?[。？?]?$/.test(question.trim())}
export function renderOverview(farm,environment,retrieval){
 const lines=['【快速核验】已读取当前快照、核验配置阈值并检索资料。','当前观测（农场级）'];
 for(const m of farm.environmentMetrics||[])lines.push(`- ${m.label}：${m.numericValue} ${m.unit}（${m.measuredAt}）`);
 lines.push('\n异常与阈值核验');
 const checks=environment.checks||[];
 for(const c of checks)lines.push(`- ${c.metric}：${c.value}${c.unit}；配置下限 ${c.minimum}${c.unit}，${c.below_minimum?'低于下限，需核查':'未低于下限'}。`);
 if(!checks.length)lines.push('- 当前没有启用的可核验阈值，不能判断是否超限。');
 const alerts=(farm.alerts||[]).filter(a=>!['已处理','已恢复'].includes(a.status));
 for(const a of alerts.slice(0,5))lines.push(`- 待处理记录：${a.title}（${a.status}）。`);
 if(!alerts.length)lines.push('- 当前快照没有待处理告警；这不代表无病害。');
 lines.push('\n检索依据');
 for(const e of retrieval.evidence||[])lines.push(`- ${typeof e.source==='string'?e.source:JSON.stringify(e.source)}：${String(e.content||'').slice(0,220)}`);
 if(!retrieval.evidence?.length)lines.push('- 未检索到相关资料，不生成资料结论。');
 lines.push('\n缺少的数据与限制','- 需要地块级连续观测、土壤采样条件及叶片近照才能进一步核验；当前为软件演示，未进行病害诊断或设备控制。');
 return lines.join('\n');
}
