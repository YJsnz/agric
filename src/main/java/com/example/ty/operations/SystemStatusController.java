package com.example.ty.operations;
import com.example.ty.vision.VisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;
@RestController @RequestMapping("/api/system") @RequiredArgsConstructor
public class SystemStatusController {
 private final VisionService vision;
 private final OperationRepository records;
 @Value("${agent.base-url}") private String baseUrl;
 @Value("${agent.model}") private String model;
 @Value("${agent.api-key:}") private String key;
 @Value("${AGENT_ENGINE:harness}") private String engine;
 @GetMapping("/status") public Map<String,Object> status(){
  boolean available=false;String note="模型服务未连接，请检查 Ollama 与 AGENT_BASE_URL";
  try {var builder=HttpRequest.newBuilder(URI.create(baseUrl.replaceAll("/+$","")+"/models")).timeout(Duration.ofSeconds(4)).GET();if(!key.isBlank())builder.header("Authorization","Bearer "+key);
   var response=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build().send(builder.build(),HttpResponse.BodyHandlers.ofString());
   available=response.statusCode()==200&&response.body().contains("\""+model+"\"");note=available?"配置模型已就绪":"模型服务响应，但配置模型尚不可用";
  }catch(Exception ignored){}
  return Map.of("mode","software-demo","database",Map.of("ready",true,"businessRecords",records.count()),"agent",Map.of("ready",available,"engine",engine,"model",model,"message",note),"vision",vision.model(),"workflow",Map.of("records",true,"batches",true,"receipts",true,"reviews",true));
 }
}
