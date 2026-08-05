package com.example.ty.assistant.state;

import com.example.ty.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_assistant_states", uniqueConstraints = @UniqueConstraint(name = "uk_assistant_state_user", columnNames = "user_id"))
@Getter
@Setter
@NoArgsConstructor
public class UserAssistantState {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User user;

    @Lob
    @Column(name = "workbenches_json", nullable = false, columnDefinition = "LONGTEXT")
    private String workbenchesJson = "[]";

    @Lob
    @Column(name = "conversations_json", nullable = false, columnDefinition = "LONGTEXT")
    private String conversationsJson = "[]";

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void touch() { updatedAt = LocalDateTime.now(); }
}
