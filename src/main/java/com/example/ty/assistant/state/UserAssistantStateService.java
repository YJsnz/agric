package com.example.ty.assistant.state;

import com.example.ty.auth.entity.User;
import com.example.ty.auth.exception.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserAssistantStateService {
    private static final int MAX_JSON_LENGTH = 2_000_000;
    private final UserAssistantStateRepository repository;

    @Transactional(readOnly = true)
    public AssistantStateDto get(User user) {
        return repository.findByUserId(user.getId())
                .map(item -> new AssistantStateDto(item.getWorkbenchesJson(), item.getConversationsJson(), item.getUpdatedAt()))
                .orElseGet(() -> new AssistantStateDto("[]", "[]", null));
    }

    @Transactional
    public AssistantStateDto save(User user, AssistantStateDto request) {
        validate(request.workbenchesJson(), "工作台");
        validate(request.conversationsJson(), "聊天记录");
        UserAssistantState state = repository.findByUserId(user.getId()).orElseGet(() -> {
            UserAssistantState created = new UserAssistantState();
            created.setUser(user);
            return created;
        });
        state.setWorkbenchesJson(request.workbenchesJson());
        state.setConversationsJson(request.conversationsJson());
        UserAssistantState saved = repository.save(state);
        return new AssistantStateDto(saved.getWorkbenchesJson(), saved.getConversationsJson(), saved.getUpdatedAt());
    }

    private void validate(String json, String label) {
        if (json == null || json.length() > MAX_JSON_LENGTH) throw BizException.badRequest(label + "数据过大或格式无效");
    }
}
