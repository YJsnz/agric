package com.example.ty.assistant.state;

import com.example.ty.auth.entity.User;
import com.example.ty.auth.security.AuthInterceptor;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assistant/state")
@RequiredArgsConstructor
public class UserAssistantStateController {
    private final UserAssistantStateService service;

    @GetMapping
    public AssistantStateDto get(@RequestAttribute(AuthInterceptor.CURRENT_USER_ATTR) User user) {
        return service.get(user);
    }

    @PutMapping
    public AssistantStateDto save(@RequestAttribute(AuthInterceptor.CURRENT_USER_ATTR) User user,
                                  @Valid @RequestBody AssistantStateDto request) {
        return service.save(user, request);
    }
}
