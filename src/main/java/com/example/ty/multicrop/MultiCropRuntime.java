package com.example.ty.multicrop;

import com.example.ty.auth.exception.BizException;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;
import java.net.*;
import java.net.http.*;
import java.nio.file.*;
import java.time.Duration;
import java.util.Set;
import java.util.concurrent.*;

/** Own only a local worker started by this application. Existing/remote services are reused. */
@Component
public class MultiCropRuntime {
    private final URI base;
    private final String python;
    private final boolean enabled;
    private final ObjectMapper json;
    private final HttpClient http=HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).connectTimeout(Duration.ofSeconds(1)).build();
    private final ScheduledExecutorService supervisor=Executors.newSingleThreadScheduledExecutor(r->{Thread t=new Thread(r,"multicrop-supervisor");t.setDaemon(true);return t;});
    private volatile Process process;
    private volatile boolean closing;
    private long retryAfter;
    public MultiCropRuntime(ObjectMapper json,@Value("${MULTICROP_BASE_URL:http://127.0.0.1:8090}") String url,
            @Value("${MULTICROP_PYTHON:}") String python,@Value("${MULTICROP_AUTO_START:true}") boolean enabled){
        this.json=json;this.base=URI.create(url.replaceAll("/+$",""));this.enabled=enabled;
        this.python=python.isBlank()?Path.of("vision-runtime/.venv",System.getProperty("os.name").toLowerCase().contains("win")?"Scripts/python.exe":"bin/python").toAbsolutePath().toString():python;
    }
    public static boolean local(URI base){return "http".equals(base.getScheme())&&Set.of("127.0.0.1","localhost").contains(base.getHost())&&(base.getPath()==null||base.getPath().isEmpty());}
    private boolean responds(URI uri){try{return http.send(HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(2)).GET().build(),HttpResponse.BodyHandlers.discarding()).statusCode()==200;}catch(Exception e){return false;}}
    @EventListener(ApplicationReadyEvent.class) public void start(){
        if(enabled&&local(base))supervisor.scheduleWithFixedDelay(()->{try{ensureReady();}catch(Exception ignored){/* Detailed worker diagnostics stay in the runtime log. */}},0,15,TimeUnit.SECONDS);
    }
    public synchronized void ensureReady(){
        if(closing||!enabled||!local(base))return;
        try{
            Path logs=Path.of("var/logs");Files.createDirectories(logs);
            String graphUrl=System.getenv().getOrDefault("NEO4J_HTTP_URL","http://127.0.0.1:7474").replaceAll("/+$","");
            if((graphUrl.equals("http://127.0.0.1:7474")||graphUrl.equals("http://localhost:7474"))&&!responds(URI.create(graphUrl))){
                var docker=new ProcessBuilder("docker","start","agric-multicrop-neo4j").redirectErrorStream(true).redirectOutput(ProcessBuilder.Redirect.appendTo(logs.resolve("multicrop-runtime.log").toFile())).start();
                if(!docker.waitFor(15,TimeUnit.SECONDS)){docker.destroyForcibly();throw new IllegalStateException("Neo4j startup timed out");}
            }
            if(responds(base.resolve("/api/integration/health")))return;
            if(process==null||!process.isAlive()){
                if(System.currentTimeMillis()<retryAfter)throw new IllegalStateException("Worker restart cooldown");
                retryAfter=System.currentTimeMillis()+10000;
                if(!Files.isRegularFile(Path.of("ai-service/integration_app.py")))throw new IllegalStateException("Multi-crop runtime missing");
                var builder=new ProcessBuilder(python,"-u","ai-service/integration_app.py");var env=builder.environment();
                var settings=Path.of("ai-service/.integration-runtime/runtime.json");
                if(env.getOrDefault("NEO4J_PASSWORD","").isBlank()&&Files.isRegularFile(settings))env.put("NEO4J_PASSWORD",json.readTree(Files.readString(settings).replace("\uFEFF","")).path("password").asString());
                env.putIfAbsent("NEO4J_HTTP_URL",graphUrl);env.put("MULTICROP_PORT",String.valueOf(base.getPort()==-1?80:base.getPort()));
                env.putIfAbsent("MULTICROP_LLM_BASE_URL",env.getOrDefault("AGENT_BASE_URL","http://127.0.0.1:11434/v1"));
                env.putIfAbsent("MULTICROP_LLM_MODEL",env.getOrDefault("AGENT_MODEL","agric-qwen2.5:7b-cpu"));env.putIfAbsent("MULTICROP_LLM_API_KEY",env.getOrDefault("AGENT_API_KEY","ollama"));
                process=builder.redirectErrorStream(true).redirectOutput(ProcessBuilder.Redirect.appendTo(logs.resolve("multicrop-runtime.log").toFile())).start();
            }
            long deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(45);
            while(!closing&&System.nanoTime()<deadline){if(responds(base.resolve("/api/integration/health")))return;if(!process.isAlive())break;Thread.sleep(400);}
        }catch(InterruptedException e){Thread.currentThread().interrupt();}catch(Exception failure){org.slf4j.LoggerFactory.getLogger(MultiCropRuntime.class).warn("Multi-crop startup failed ({}); check Python setup and var/logs/multicrop-runtime.log",failure.getClass().getSimpleName());}
        throw new BizException("MULTICROP_STARTING","知识服务正在启动或恢复，请稍候；持续失败请检查 var/logs/multicrop-runtime.log",503);
    }
    @PreDestroy public void close(){closing=true;supervisor.shutdownNow();var owned=process;if(owned!=null){owned.descendants().forEach(ProcessHandle::destroy);owned.destroy();}}
}
