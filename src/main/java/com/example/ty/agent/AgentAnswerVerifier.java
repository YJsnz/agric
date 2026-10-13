package com.example.ty.agent;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
@Component
public class AgentAnswerVerifier {
 public String verifyBusiness(String answer,JsonNode facts,JsonNode evidence){
  if(facts==null)return answer;
  var batches=facts.path("batches");
  if(!batches.isArray()||batches.isEmpty())return "当前基地尚无已登记的采后批次。农事与生长记录不是批次，可在种植面板登记采收数量与流转记录。当前结论仅针对软件业务记录。";
  boolean missing=false;
  for(var row:batches)if(!answer.contains(row.path("title").asString())||!answer.contains(row.path("stageLabel").asString())||!answer.matches("(?s).*(?:#|编号[：:\\s]*)"+row.path("id").asLong()+"(?:\\D|$).*"))missing=true;
  if(!missing)return answer;
  var result=new StringBuilder("软件记录核验\n\n模型未完整概括批次事实，以下按已保存记录列出：\n");
  for(var row:batches)result.append("- 批次 #").append(row.path("id").asLong()).append("：").append(row.path("title").asString()).append("；").append(row.path("stageLabel").asString()).append("；数量 ").append(row.path("quantity").asDouble()).append(' ').append(row.path("unit").asString()).append("；地块 ").append(row.path("plotId").asString()).append('\n');
  result.append("\n农事与生长观察单独登记，不是采后批次。以上为软件演示记录，完整流转轨迹可在种植面板查看。\n\n本次资料依据：\n");
  var sources=evidence==null?null:evidence.path("evidence");
  if(sources==null||!sources.isArray()||sources.isEmpty())result.append("未检索到匹配资料，不补造来源或生产建议。");
  else for(var source:sources)result.append("- ").append(source.path("source").asString(source.path("title").asString())).append('\n');
  return result.toString();
 }
}
