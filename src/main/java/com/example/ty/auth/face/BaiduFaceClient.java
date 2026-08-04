package com.example.ty.auth.face;

import com.example.ty.auth.exception.BizException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * 百度智能云人脸识别 v3 REST 客户端。
 * 负责 access_token 获取与缓存（约 30 天，提前 10 分钟刷新）、人脸注册、人脸搜索、人脸删除，
 * 并把百度 error_code 翻译成中文提示。
 */
@Component
public class BaiduFaceClient {

    private static final String TOKEN_URL = "https://aip.baidubce.com/oauth/2.0/token";
    private static final String BASE_URL = "https://aip.baidubce.com/rest/2.0/face/v3";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String secretKey;
    private final String groupId;
    private final int matchThreshold;

    private volatile String accessToken;
    private volatile long tokenExpireAt;

    public BaiduFaceClient(@Value("${baidu.face.api-key:}") String apiKey,
                           @Value("${baidu.face.secret-key:}") String secretKey,
                           @Value("${baidu.face.group-id:tianyan_users}") String groupId,
                           @Value("${baidu.face.match-threshold:80}") int matchThreshold,
                           ObjectMapper objectMapper) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.secretKey = secretKey == null ? "" : secretKey.trim();
        this.groupId = groupId;
        this.matchThreshold = matchThreshold;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public int getMatchThreshold() {
        return matchThreshold;
    }

    /** 人脸注册：把 userId 加入人脸库，返回 face_token */
    public String registerFace(String userId, String userInfo, byte[] photo) {
        Map<String, Object> body = new HashMap<>();
        body.put("image", Base64.getEncoder().encodeToString(photo));
        body.put("image_type", "BASE64");
        body.put("group_id", groupId);
        body.put("user_id", userId);
        body.put("user_info", userInfo);
        body.put("quality_control", "NORMAL");
        body.put("liveness_control", "NORMAL");
        JsonNode resp = post("/faceset/user/add", body);
        return resp.path("result").path("face_token").asString(null);
    }

    /** 人脸搜索：返回最高分匹配项（百度端已应用 match_threshold，低于阈值会直接报错） */
    public SearchResult search(byte[] photo) {
        Map<String, Object> body = new HashMap<>();
        body.put("image", Base64.getEncoder().encodeToString(photo));
        body.put("image_type", "BASE64");
        // 百度 v3 /search 的 group_id_list 是逗号分隔的字符串，不是数组
        body.put("group_id_list", groupId);
        body.put("max_face_num", 1);
        body.put("match_threshold", matchThreshold);
        body.put("quality_control", "NORMAL");
        body.put("liveness_control", "NORMAL");
        JsonNode resp = post("/search", body);
        JsonNode list = resp.path("result").path("user_list");
        if (list.isArray() && !list.isEmpty()) {
            JsonNode best = list.get(0);
            return new SearchResult(
                    best.path("user_id").asString(null),
                    best.path("score").asDouble(0),
                    best.path("face_token").asString(null));
        }
        throw BizException.unauthorized("人脸识别未通过，未匹配到用户");
    }

    /** 人脸删除：从人脸库移除该 user 的所有人脸 */
    public void deleteFace(String userId) {
        Map<String, Object> body = new HashMap<>();
        body.put("group_id", groupId);
        body.put("user_id", userId);
        post("/faceset/user/delete", body);
    }

    private synchronized String getAccessToken() {
        if (apiKey.isEmpty() || secretKey.isEmpty()) {
            throw BizException.internalError("人脸服务未配置，请联系管理员");
        }
        if (accessToken != null && System.currentTimeMillis() < tokenExpireAt) {
            return accessToken;
        }
        try {
            String url = TOKEN_URL
                    + "?grant_type=client_credentials"
                    + "&client_id=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8)
                    + "&client_secret=" + URLEncoder.encode(secretKey, StandardCharsets.UTF_8);
            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            JsonNode node = objectMapper.readTree(resp.body());
            String token = node.path("access_token").asString(null);
            long expiresIn = node.path("expires_in").asLong(2592000);
            if (token == null) {
                throw BizException.internalError("获取百度人脸凭证失败：" + node.path("error_description").asString(""));
            }
            this.accessToken = token;
            this.tokenExpireAt = System.currentTimeMillis() + (expiresIn - 600) * 1000L;
            return token;
        } catch (BizException e) {
            throw e;
        } catch (Exception e) {
            throw BizException.internalError("百度人脸服务连接失败");
        }
    }

    private JsonNode post(String path, Map<String, Object> body) {
        try {
            String json = objectMapper.writeValueAsString(body);
            String url = BASE_URL + path + "?access_token=" + getAccessToken();
            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .build();
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            JsonNode node = objectMapper.readTree(resp.body());
            int code = node.path("error_code").asInt(-1);
            if (code != 0) {
                throw mapError(code, node.path("error_msg").asString(""));
            }
            return node;
        } catch (BizException e) {
            throw e;
        } catch (Exception e) {
            throw BizException.internalError("百度人脸服务连接失败");
        }
    }

    private BizException mapError(int code, String msg) {
        return switch (code) {
            case 222202 -> BizException.badRequest("图片中未检测到人脸，请正对摄像头重试");
            case 223110 -> BizException.badRequest("人脸质量过低，请换一张清晰正面的照片");
            case 223101 -> BizException.badRequest("该账号已绑定人脸，请先在个人中心解绑后重新绑定");
            case 223112 -> BizException.badRequest("人脸大小或角度不符合要求，请正对摄像头");
            case 222207 -> BizException.unauthorized("人脸识别未通过，未匹配到用户");
            default -> new BizException("FACE_ERROR_" + code, "人脸服务返回错误（" + code + "）：" + msg, 400);
        };
    }

    public record SearchResult(String userId, double score, String faceToken) {
    }
}
