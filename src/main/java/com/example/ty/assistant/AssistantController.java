package com.example.ty.assistant;

import com.example.ty.assistant.dto.AssistantChatRequest;
import com.example.ty.assistant.dto.AssistantChatResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assistant")
@RequiredArgsConstructor
public class AssistantController {

    private final DeepSeekAssistantService assistantService;

    @PostMapping("/chat")
    public AssistantChatResponse chat(@RequestBody AssistantChatRequest request) {
        return assistantService.chat(request);
    }
}
