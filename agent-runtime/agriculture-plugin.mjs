import { defineTool } from '@deepseek-ai/dsh-tools';
export const inject = ['tools'];
export function apply(ctx) {
  for (const [name, description, parameters] of [
    ['get_business_records','读取本基地已有农事、生长、采后批次和模拟处置记录，只读',{}],
    ['query_crop_knowledge','查询梨、小麦、小枣与设施蔬菜知识；番茄叶片症状和果实成熟度视觉识别可在作物工作台使用，本工具不执行图像推理',{crop:{type:'string',required:true,enum:['pear','wheat','jujube','vegetable']},question:{type:'string',required:true}}],
    ['get_farm_context', '读取共享演示农场当前环境、设备和告警', {}],
    ['retrieve_evidence', '关键词检索农业资料并返回来源', {query:{type:'string',required:true}}],
    ['get_vision_records','读取本人在当前基地的已有梨叶视觉结果，不能代表确诊',{recordId:{type:'string',description:'可选记录 ID；留空读取最新记录'}}],
    ['analyze_environment', '核验当前环境与配置阈值，返回已保存的农场级演示墒情历史', {}]
  ]) ctx.tools.register(defineTool({name, description, parameters,
    output:{schema:{type:'json'},render:(_args,value)=>[{type:'text',text:JSON.stringify(value)}]},
    async execute(args, exec) {
      const response = await fetch(process.env.AGRIC_TOOL_BRIDGE, {method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.AGRIC_BRIDGE_KEY}`},body:JSON.stringify({name,args}),signal:exec.signal});
      const data = await response.json(); if (!response.ok) throw new Error(data.error || '农业工具执行失败'); return data;
    }
  }));
}

