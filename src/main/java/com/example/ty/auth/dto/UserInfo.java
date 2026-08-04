package com.example.ty.auth.dto;

import com.example.ty.auth.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

/** 对外返回的用户信息，不含密码等敏感字段 */
@Data
public class UserInfo {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String avatarUrl;
    private String role;
    private boolean faceBound;
    private LocalDateTime createdAt;

    public static UserInfo from(User u) {
        UserInfo info = new UserInfo();
        info.id = u.getId();
        info.name = u.getName();
        info.email = u.getEmail();
        info.phone = u.getPhone();
        info.avatarUrl = u.getAvatarUrl();
        info.role = u.getRole();
        info.faceBound = u.getFaceToken() != null;
        info.createdAt = u.getCreatedAt();
        return info;
    }
}
