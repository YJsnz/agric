package com.example.ty.assistant.state;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAssistantStateRepository extends JpaRepository<UserAssistantState, Long> {
    Optional<UserAssistantState> findByUserId(Long userId);
}
