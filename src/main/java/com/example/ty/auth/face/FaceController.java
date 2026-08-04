package com.example.ty.auth.face;

import com.example.ty.auth.dto.AuthResponse;
import com.example.ty.auth.dto.UserInfo;
import com.example.ty.auth.entity.User;
import com.example.ty.auth.security.AuthInterceptor;
import com.example.ty.auth.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class FaceController {

    private final FaceService faceService;
    private final JwtService jwtService;

    /** 绑定人脸（需登录）：上传一张人脸照，注册到人脸库并保存 face_token */
    @PostMapping(value = "/face-register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserInfo faceRegister(@RequestPart("photo") MultipartFile photo, HttpServletRequest request) throws IOException {
        User user = (User) request.getAttribute(AuthInterceptor.CURRENT_USER_ATTR);
        faceService.register(user, photo.getBytes());
        return UserInfo.from(user);
    }

    /** 解绑人脸（需登录）：从人脸库删除并清空 face_token */
    @PostMapping("/face-delete")
    public UserInfo faceDelete(HttpServletRequest request) {
        User user = (User) request.getAttribute(AuthInterceptor.CURRENT_USER_ATTR);
        faceService.delete(user);
        return UserInfo.from(user);
    }

    /** 刷脸登录（公共）：上传人脸照，匹配通过则签发 JWT */
    @PostMapping(value = "/face-login", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AuthResponse faceLogin(@RequestPart("photo") MultipartFile photo) throws IOException {
        User user = faceService.identify(photo.getBytes());
        return new AuthResponse(jwtService.generateToken(user.getId()), UserInfo.from(user));
    }
}
