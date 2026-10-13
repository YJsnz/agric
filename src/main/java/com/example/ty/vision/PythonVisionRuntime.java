package com.example.ty.vision;

import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

/** Single resident process with a deadline and restart on timeout or EOF. */
@Component
public class PythonVisionRuntime {
    private final ObjectMapper json;
    private final String python;
    private final int timeout;
    private final ExecutorService reads = Executors.newSingleThreadExecutor();
    private volatile Process process;
    private BufferedWriter writer;
    private BufferedReader reader;
    private volatile Map<String,Object> runtime = Map.of("state","not-started");

    public PythonVisionRuntime(ObjectMapper json,
            @Value("${VISION_PYTHON:}") String python,
            @Value("${VISION_TIMEOUT_SECONDS:120}") int timeout) {
        this.json = json;
        this.python = python.isBlank() ? Path.of("vision-runtime/.venv",
            System.getProperty("os.name").toLowerCase().contains("win") ? "Scripts/python.exe" : "bin/python").toAbsolutePath().toString() : python;
        if (timeout < 10 || timeout > 600) throw new IllegalArgumentException("VISION_TIMEOUT_SECONDS must be 10..600");
        this.timeout = timeout;
    }

    public boolean installed() { return Files.isRegularFile(Path.of(python)); }
    public Map<String,Object> status() {
        var current=process;
        return Map.of("workerAlive",current!=null && current.isAlive(),"runtime",runtime);
    }

    public synchronized JsonNode infer(Path image) throws Exception {
        try {
            if (process==null || !process.isAlive()) start();
            String id = UUID.randomUUID().toString();
            writer.write(json.writeValueAsString(Map.of("id",id,"path",image.toAbsolutePath().toString())));
            writer.newLine(); writer.flush();
            var reply = json.readTree(read());
            if (!id.equals(reply.path("id").asString())) throw new IOException("Worker response ID mismatch");
            if (reply.has("error")) throw new IllegalStateException(reply.path("error").asString());
            return reply.path("result");
        } catch (Exception e) {
            stop();
            throw e;
        }
    }

    private void start() throws Exception {
        stop();
        Path logs = Path.of(System.getenv().getOrDefault("VISION_LOG_DIRECTORY","var/logs"));
        Files.createDirectories(logs);
        process = new ProcessBuilder(python,"-u","vision-runtime/infer.py","--worker")
            .redirectError(logs.resolve("vision-worker.log").toFile()).start();
        writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream(),StandardCharsets.UTF_8));
        reader = new BufferedReader(new InputStreamReader(process.getInputStream(),StandardCharsets.UTF_8));
        var ready = json.readTree(read());
        if (!"ready".equals(ready.path("type").asString())) throw new IOException("Worker failed to initialize");
        runtime = json.convertValue(ready.path("runtime"),Map.class);
    }

    private String read() throws Exception {
        var stream = reader;
        var future = reads.submit(() -> stream.readLine());
        try {
            String line = future.get(timeout,TimeUnit.SECONDS);
            if (line==null) throw new EOFException("Vision worker exited; see vision-worker.log");
            return line;
        } catch (TimeoutException e) {
            if (process!=null) process.destroyForcibly();
            future.cancel(true);
            throw new IllegalStateException("视觉推理超时，工作进程将在下一次请求重建");
        }
    }

    private void stop() {
        if (process!=null) { process.destroyForcibly(); process=null; }
        try { if (writer!=null) writer.close(); } catch (IOException ignored) {}
        try { if (reader!=null) reader.close(); } catch (IOException ignored) {}
        writer=null; reader=null; runtime=Map.of("state","not-started");
    }

    @PreDestroy public synchronized void close() { stop(); reads.shutdownNow(); }
}
