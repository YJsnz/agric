package com.example.ty.auth.face;

import com.example.ty.auth.entity.User;

/**
 * 人脸识别服务（可插拔接口）。
 * 当前实现 {@link BaiduFaceService}；将来可替换为本地 ONNX 引擎等，只需新增实现类。
 */
public interface FaceService {

    /** 为用户注册人脸（photo 为原始图片字节，服务内部负责检测/提取/入库） */
    void register(User user, byte[] photoBytes);

    /** 识别人脸，返回匹配用户；未匹配到则抛出未授权异常 */
    User identify(byte[] photoBytes);

    /** 删除用户已绑定的人脸 */
    void delete(User user);
}
