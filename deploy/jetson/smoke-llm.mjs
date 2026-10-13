// Run after exporting the protected edge.env; validates tool use, not just a /models response.
import {writeFile} from 'node:fs/promises';
const base=(process.env.AGENT_BASE_URL||'http://127.0.0.1:8083/v1').replace(/\/$/,'');
const headers={'Content-Type':'application/json',Authorization:`Bearer ${process.env.AGENT_API_KEY||''}`};
const model=process.env.AGENT_MODEL||'qwen3-4b-edge';
const started=performance.now();
const tools=[{type:'function',function:{name:'echo_probe',description:'Read the verified value',parameters:{type:'object',properties:{},additionalProperties:false}}}];
const messages=[{role:'system',content:'必须调用 echo_probe 工具取得数值，随后只回答工具返回的数值，不可猜测。 /no_think'},{role:'user',content:'读取核验数值。'}];
async function call() {
  const response=await fetch(base+'/chat/completions',{method:'POST',headers,
    body:JSON.stringify({model,messages,tools,max_tokens:256,temperature:0,stream:false}),
    signal:AbortSignal.timeout(180000)});
  if(!response.ok)throw new Error(`Model HTTP ${response.status}`);
  return (await response.json()).choices?.[0]?.message;
}
const reply=await call();
const tool=reply?.tool_calls?.find(call=>call.function?.name==='echo_probe');
if(!tool?.id)throw new Error('Tool calling failed; validate model template before starting Harness');
messages.push(reply,{role:'tool',tool_call_id:tool.id,content:'{"verified_value":42}'});
const final=await call();
if(!final?.content?.includes('42'))throw new Error('Tool result was not used');
const report={model,toolCalling:true,toolResultUsed:true,totalMs:Math.round(performance.now()-started)};
await writeFile(process.argv[2]||'llm-smoke.json',JSON.stringify(report,null,2));
console.log(report);
