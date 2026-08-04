package com.example.ty.auth.face;

import com.example.ty.auth.entity.User;
import com.example.ty.auth.exception.BizException;
import com.example.ty.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BaiduFaceService implements FaceService {

    private final BaiduFaceClient client;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void register(User user, byte[] photoBytes) {
        String userInfo = user.getName() + "/" + user.getEmail();
        String faceToken = client.registerFace(String.valueOf(user.getId()), userInfo, photoBytes);
        user.setFaceToken(faceToken);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User identify(byte[] photoBytes) {
        BaiduFaceClient.SearchResult result = client.search(photoBytes);
        if (result.userId() == null) {
            throw BizException.unauthorized("人脸识别未通过，未匹配到用户");
        }
        return userRepository.findById(Long.valueOf(result.userId()))
                .orElseThrow(() -> BizException.unauthorized("人脸识别未通过，未匹配到用户"));
    }

    @Override
    @Transactional
    public void delete(User user) {
        if (user.getFaceToken() != null) {
            client.deleteFace(String.valueOf(user.getId()));
            user.setFaceToken(null);
            userRepository.save(user);
        }
    }
}
