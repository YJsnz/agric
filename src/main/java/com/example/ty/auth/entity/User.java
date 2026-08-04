package com.example.ty.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 平台用户。密码仅存 BCrypt 散列。
 * face_photo_path / face_embedding 为后续人脸登录预留，当前可为空。
 */
@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(name = "uk_users_email", columnNames = "email"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 255, unique = true)
    private String email;

    /** BCrypt 散列后的密码，仅内部使用，不对外序列化 */
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(length = 32)
    private String phone;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String role = "USER";

    /** 百度人脸注册成功后返回的 face_token，用于解绑等操作 */
    @Column(name = "face_token", length = 255)
    private String faceToken;

    /** 预留：人脸识别图片路径 */
    @Column(name = "face_photo_path", length = 500)
    private String facePhotoPath;

    /** 预留：人脸特征向量（JSON / base64） */
    @Column(name = "face_embedding", columnDefinition = "TEXT")
    private String faceEmbedding;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
