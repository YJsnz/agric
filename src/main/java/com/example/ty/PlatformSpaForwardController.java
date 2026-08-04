package com.example.ty;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 平台入口转发：/platform 与 /platform/ 转发到平台 index.html。
 * 其余 /platform/** 深链由 {@link PlatformSpaForward} 拦截转发，保证官网深链与平台内刷新可用。
 */
@Controller
public class PlatformSpaForwardController {

    @GetMapping({ "/platform", "/platform/" })
    public String platform() {
        return "forward:/platform/index.html";
    }
}
