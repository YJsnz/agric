// Presentation categories adapted from the PART graph workspace; no KG remapping.
export const groups = [
  { types:['Disease','Pest','Symptom'], label:'病虫害', icon:'🐞', fill:'#fff0ef', stroke:'#ef7777' },
  { types:['Intervention','PreventionMeasure','AgriculturalPractice'], label:'管理措施', icon:'🌱', fill:'#e9f8ee', stroke:'#38b879' },
  { types:['EnvironmentFactor','Condition','StorageCondition'], label:'环境因素', icon:'💧', fill:'#edf5ff', stroke:'#63aaff' },
  { types:['GrowthStage','Stage'], label:'生长过程', icon:'🍃', fill:'#eaf8ef', stroke:'#45b887' },
  { types:['HarvestProcess','PostharvestRisk','QualityIndicator','PhysiologicalDisorder'], label:'品质与采后', icon:'🧺', fill:'#fff5e6', stroke:'#eba94d' },
  { types:['Requirement','Standard'], label:'标准与要求', icon:'▤', fill:'#f4effb', stroke:'#a887dc' }
]
export function nodeAppearance(node={}, crop='pear') {
  const type=String(node.type||node.category||'')
  if (['Crop','CropVariety','Variety'].includes(type)) return {icon:({pear:'🍐',wheat:'🌾',jujube:'🔴',vegetable:'🥬'})[crop]||'🌱',fill:'#e7f6db',stroke:'#66b68c'}
  const extra={Region:'📍',Pathogen:'🔬',PlantOrgan:'🍃',Metric:'📊',Process:'⚙️',Product:'🧺',State:'◉',Stress:'⚠️',WeatherRisk:'🌦️',ManagementFactor:'🌱'}
  if(extra[type]) return {icon:extra[type],fill:'#eef5f2',stroke:'#85ad9b'}
  return groups.find(g=>g.types.includes(type))||{icon:'◇',fill:'#eef2f8',stroke:'#94a6bc'}
}
