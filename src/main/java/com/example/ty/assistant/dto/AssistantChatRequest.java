package com.example.ty.assistant.dto;

import java.util.List;

/** 浏览器提交的多轮对话。农场实时上下文由工作台单独提供。 */
public record AssistantChatRequest(List<Message> messages, String context) {

    public record Message(String role, String content) {
    }
}
