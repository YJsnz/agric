package com.example.ty.multicrop;

import com.example.ty.auth.exception.BizException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;
import java.net.*;
import java.net.http.*;
import java.time.Duration;
import java.util.*;

/** Only fixed crop endpoints; clients cannot provide a target host or arbitrary URL. */
@Component
public class MultiCropClient {
    private final URI base;
    private final ObjectMapper json;
    private final HttpClient http=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    private static final Set<String> GETS=Set.of("/api/integration/health","/api/graph","/api/wheat/models/status","/api/jujube/health");
    private static final Set<String> POSTS=Set.of("/api/vision/pear","/api/pear/diagnose","/api/wheat/diagnose","/api/jujube/diagnose","/api/jujube/vision/analyze",
        "/api/graphrag/ask","/api/wheat/ask","/api/jujube/ask","/api/qingxian/ask");
    public MultiCropClient(@Value("${MULTICROP_BASE_URL:http://127.0.0.1:8090}") String base,ObjectMapper json) {
        this.base=URI.create(base.replaceAll("/+$",""));this.json=json;
        if(!Set.of("http","https").contains(this.base.getScheme())||this.base.getHost()==null||this.base.getRawQuery()!=null)
            throw new IllegalArgumentException("Invalid MULTICROP_BASE_URL");
    }
    public static boolean allowed(String method,String path){return method.equals("GET")?GETS.contains(path):method.equals("POST")&&POSTS.contains(path);}
    public HttpResponse<byte[]> forward(String method,String path,String query,String type,byte[] body) {
        if(!allowed(method,path))throw BizException.notFound("多作物接口不存在");
        if(body.length>8*1024*1024)throw new BizException("UPLOAD_TOO_LARGE","多作物请求总大小不能超过 8 MB",413);
        if(query!=null&&query.length()>2000)throw BizException.badRequest("查询参数过长");
        String route=path.startsWith("/api/jujube/")&&!path.endsWith("/ask")?"/jujube"+path:path;
        var builder=HttpRequest.newBuilder(URI.create(base+route+(query==null?"":"?"+query))).timeout(Duration.ofSeconds(540)).version(HttpClient.Version.HTTP_1_1);
        builder.header("Content-Type",type);
        try {
            return http.send(builder.method(method,body.length==0?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofByteArray(body)).build(),HttpResponse.BodyHandlers.ofByteArray());
        }catch(InterruptedException e){Thread.currentThread().interrupt();throw new BizException("MULTICROP_INTERRUPTED","多作物请求已中断",503);}
        catch(Exception e){throw new BizException("MULTICROP_UNAVAILABLE","多作物服务尚未就绪，请启动 AI 服务并检查依赖",503);}
    }
    public Object ask(String crop,String question) {
        if(question==null||question.isBlank()||question.length()>500)throw BizException.badRequest("多作物问题须为 1–500 字");
        String path=switch(crop){case "pear"->"/api/graphrag/ask";case "wheat"->"/api/wheat/ask";case "jujube"->"/api/jujube/ask";case "vegetable"->"/api/qingxian/ask";default->throw BizException.badRequest("作物不支持");};
        try {
            var response=forward("POST",path,null,"application/json",json.writeValueAsBytes(Map.of("question",question)));
            if(response.statusCode()!=200)throw new BizException("MULTICROP_KNOWLEDGE_UNAVAILABLE","作物知识服务返回 "+response.statusCode()+"，未采用未核验结果",503);
            var result=json.readTree(response.body());
            if("validation_failed".equals(result.path("status").asString()))
                throw new BizException("MULTICROP_UNGROUNDED","作物回答未通过证据核验，未作为 Agent 结论采用",503);
            return result;
        }catch(BizException e){throw e;}catch(Exception e){throw new BizException("MULTICROP_INVALID_RESPONSE","作物知识返回格式无效",502);}
    }
}
