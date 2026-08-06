package com.example.ty.assistant;

import com.example.ty.assistant.dto.AssistantChatRequest;
import com.example.ty.assistant.dto.AssistantChatResponse;
import com.example.ty.auth.exception.BizException;
import com.example.ty.assistant.knowledge.KnowledgeSearchResult;
import com.example.ty.assistant.knowledge.KnowledgeService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class DeepSeekAssistantService {

    private static final int MAX_MESSAGES = 12;
    private static final int MAX_MESSAGE_LENGTH = 1_200;
    private static final int MAX_TOTAL_LENGTH = 8_000;
    private static final Set<String> ALLOWED_ROLES = Set.of("user", "assistant");
    private static final String SYSTEM_PROMPT = """
            你是“田言耕智”智慧农场的数据助手小田。请始终使用简洁、自然的中文回答。
            你的职责是解释农场环境、作物、灌溉、设备和告警数据，并给出稳妥、可执行的管理建议。
            只依据用户提供的工作台上下文和对话作答；缺少实时数据时要明确说明，不得编造传感器读数、设备状态或已经执行了某项操作。
            涉及设备开关、施肥、用药等操作时，只能给出建议并提示人工确认，不得声称已远程控制设备。
            回答优先控制在 3 到 6 句话，必要时可以使用简短列表。
            """;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String endpoint;
    private final String model;
    private final KnowledgeService knowledgeService;

    public DeepSeekAssistantService(@Value("${deepseek.api-key:}") String apiKey,
                                    @Value("${deepseek.base-url:https://api.deepseek.com}") String baseUrl,
                                    @Value("${deepseek.model:deepseek-v4-flash}") String model,
                                    ObjectMapper objectMapper,
                                    KnowledgeService knowledgeService) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        String normalizedBaseUrl = baseUrl == null ? "https://api.deepseek.com" : baseUrl.trim();
        this.endpoint = normalizedBaseUrl.replaceAll("/+$", "") + "/chat/completions";
        this.model = model == null || model.isBlank() ? "deepseek-v4-flash" : model.trim();
        this.objectMapper = objectMapper;
        this.knowledgeService = knowledgeService;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .build();
    }

    public AssistantChatResponse chat(AssistantChatRequest request) {
        if (apiKey.isEmpty()) {
            throw new BizException("AI_NOT_CONFIGURED", "AI 助手尚未配置 DEEPSEEK_API_KEY", 503);
        }
        List<AssistantChatRequest.Message> messages = validate(request);
        String question = messages.get(messages.size() - 1).content();
        List<KnowledgeSearchResult> retrieved = knowledgeService.search(question, 4);

        List<Map<String, String>> upstreamMessages = new ArrayList<>();
        upstreamMessages.add(message("system", buildSystemPrompt(request.context(), retrieved)));
        messages.forEach(item -> upstreamMessages.add(message(item.role(), item.content().trim())));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("messages", upstreamMessages);
        body.put("stream", false);
        body.put("temperature", 0.3);
        body.put("max_tokens", 800);

        try {
            HttpRequest upstreamRequest = HttpRequest.newBuilder(URI.create(endpoint))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(45))
                    .POST(HttpRequest.BodyPublishers.ofString(
                            objectMapper.writeValueAsString(body), StandardCharsets.UTF_8))
                    .build();
            HttpResponse<String> response = httpClient.send(
                    upstreamRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw upstreamFailure(response.statusCode());
            }
            JsonNode root = objectMapper.readTree(response.body());
            String reply = root.path("choices").path(0).path("message").path("content").asString("").trim();
            if (reply.isEmpty()) {
                throw new BizException("AI_EMPTY_RESPONSE", "AI 助手暂时没有返回有效内容，请稍后重试", 502);
            }
            return new AssistantChatResponse(reply, root.path("model").asString(model), retrieved.stream().map(KnowledgeSearchResult::source).distinct().toList());
        } catch (BizException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BizException("AI_INTERRUPTED", "AI 助手请求已中断，请重试", 502);
        } catch (Exception e) {
            throw new BizException("AI_UNAVAILABLE", "暂时无法连接 DeepSeek，请稍后重试", 502);
        }
    }

    private List<AssistantChatRequest.Message> validate(AssistantChatRequest request) {
        if (request == null || request.messages() == null || request.messages().isEmpty()) {
            throw BizException.badRequest("请输入要咨询的问题");
        }
        List<AssistantChatRequest.Message> messages = request.messages();
        if (messages.size() > MAX_MESSAGES) {
            messages = messages.subList(messages.size() - MAX_MESSAGES, messages.size());
        }
        int totalLength = 0;
        for (AssistantChatRequest.Message message : messages) {
            if (message == null || !ALLOWED_ROLES.contains(message.role()) || message.content() == null
                    || message.content().isBlank()) {
                throw BizException.badRequest("对话消息格式不正确");
            }
            if (message.content().length() > MAX_MESSAGE_LENGTH) {
                throw BizException.badRequest("单条消息不能超过 " + MAX_MESSAGE_LENGTH + " 个字符");
            }
            totalLength += message.content().length();
        }
        if (totalLength > MAX_TOTAL_LENGTH) {
            throw BizException.badRequest("对话内容过长，请清空会话后重试");
        }
        return messages;
    }

    private String buildSystemPrompt(String context, List<KnowledgeSearchResult> retrieved) {
        StringBuilder prompt = new StringBuilder(SYSTEM_PROMPT);
        if (context != null && !context.isBlank()) {
            String safeContext = context.strip().substring(0, Math.min(context.strip().length(), 600));
            prompt.append("\n当前工作台上下文：").append(safeContext);
        }
        if (!retrieved.isEmpty()) {
            prompt.append("\n以下是知识库检索到的资料。仅在与问题相关时引用，并在回答末尾用“参考：文档名”注明来源：");
            for (int i = 0; i < retrieved.size(); i++) {
                KnowledgeSearchResult item = retrieved.get(i);
                prompt.append("\n[资料").append(i + 1).append("｜").append(item.source()).append("]\n").append(item.content());
            }
        }
        return prompt.toString();
    }

    private Map<String, String> message(String role, String content) {
        return Map.of("role", role, "content", content);
    }

    private BizException upstreamFailure(int statusCode) {
        if (statusCode == 401 || statusCode == 403) {
            return new BizException("AI_AUTH_FAILED", "DeepSeek 服务鉴权失败，请检查服务端 API Key", 502);
        }
        if (statusCode == 429) {
            return new BizException("AI_RATE_LIMITED", "AI 助手请求较多，请稍后再试", 429);
        }
        return new BizException("AI_UPSTREAM_ERROR", "DeepSeek 服务暂时不可用（" + statusCode + "）", 502);
    }
}
