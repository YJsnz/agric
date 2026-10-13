package com.example.ty.multicrop;

import com.example.ty.auth.exception.BizException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/** Authentication remains at the existing /api interceptor. Model server stays on loopback. */
@RestController @RequiredArgsConstructor
public class MultiCropController {
    private final MultiCropClient client;
    @RequestMapping(value="/api/multicrop/{*path}",method={RequestMethod.GET,RequestMethod.POST})
    public ResponseEntity<byte[]> relay(HttpServletRequest request) throws Exception {
        String path="/api"+request.getRequestURI().substring("/api/multicrop".length());
        if(!MultiCropClient.allowed(request.getMethod(),path))throw BizException.notFound("多作物接口不存在");
        byte[] body;String type=request.getContentType();
        if(type!=null&&type.startsWith("multipart/form-data")) {
            String boundary="agric-"+UUID.randomUUID();
            var output=new ByteArrayOutputStream();
            if(request.getParts().size()>30)throw BizException.badRequest("上传字段过多");
            for(var part:request.getParts()) {
                if(!part.getName().matches("[a-z_]+"))throw BizException.badRequest("上传字段无效");
                String filename=part.getSubmittedFileName();
                String header="--"+boundary+"\r\nContent-Disposition: form-data; name=\""+part.getName()+"\"";
                if(filename!=null)header+="; filename=\"upload"+(filename.toLowerCase().endsWith(".png")?".png":filename.toLowerCase().endsWith(".webp")?".webp":".jpg")+"\"";
                if(part.getContentType()!=null)header+="\r\nContent-Type: "+part.getContentType();
                output.write((header+"\r\n\r\n").getBytes(StandardCharsets.UTF_8));
                try(var stream=part.getInputStream()){output.write(stream.readNBytes(8*1024*1024+1));}
                output.write("\r\n".getBytes(StandardCharsets.UTF_8));
                if(output.size()>8*1024*1024)throw new BizException("UPLOAD_TOO_LARGE","请求总大小不能超过 8 MB",413);
            }
            output.write(("--"+boundary+"--\r\n").getBytes(StandardCharsets.UTF_8));
            body=output.toByteArray();type="multipart/form-data; boundary="+boundary;
        } else {body=request.getInputStream().readNBytes(32*1024+1);if(body.length>32*1024)throw BizException.badRequest("请求过长");}
        var response=client.forward(request.getMethod(),path,request.getQueryString(),type==null?"application/json":type,body);
        return ResponseEntity.status(response.statusCode()).contentType(MediaType.APPLICATION_JSON)
            .header("Cache-Control","no-store").header("X-Content-Type-Options","nosniff").body(response.body());
    }
}
