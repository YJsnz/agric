package com.example.ty.vision;

import com.example.ty.auth.exception.BizException;
import com.example.ty.dashboard.repository.FarmAssetRepository;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import java.security.MessageDigest;

@Service @RequiredArgsConstructor
public class VisionService {
    private final VisionRepository records;
    private final VisionReviewRepository reviews;
    private final FarmAssetRepository assets;
    private final ObjectMapper json;
    private final PythonVisionRuntime inference;
    @Value("${VISION_STORAGE:var/vision}") private String storage;
    private final ThreadPoolExecutor executor=new ThreadPoolExecutor(1,1,0,TimeUnit.SECONDS,new ArrayBlockingQueue<>(8));
    public record View(String id,String farmId,String plotId,String status,String sha256,String filename,int width,int height,
                       LocalDateTime createdAt,LocalDateTime completedAt,String error,Object result) {}
    private Path root(){return Path.of(storage).toAbsolutePath().normalize();}
    public Map<String,Object> model() {
        try {var manifest=json.readTree(Files.readString(Path.of("vision-runtime/models/manifest.json")));
            return Map.of("ready",Files.isRegularFile(Path.of("vision-runtime/models/pear-leaf.onnx"))&&inference.installed(),"manifest",manifest,"worker",inference.status(),"backend",System.getenv().getOrDefault("VISION_BACKEND","onnx-cpu"));
        } catch(Exception e){return Map.of("ready",false,"message","视觉模型尚未安装，请运行 setup-vision.ps1");}
    }
    public View create(Long owner,String farmId,String plotId,MultipartFile upload) {
        if(!Boolean.TRUE.equals(model().get("ready")))throw new BizException("VISION_UNAVAILABLE","本地视觉模型未就绪",503);
        var plot=assets.findByFarmIdAndId(farmId,plotId).orElseThrow(()->BizException.notFound("地块不存在"));
        if(!"field".equals(plot.getType())||!"泊头鸭梨".equals(plot.getCrop()))throw BizException.badRequest("请选择鸭梨地块；当前模型只检测梨叶近照");
        if(upload.isEmpty()||upload.getSize()>8*1024*1024)throw BizException.badRequest("请上传不超过 8 MB 的 PNG 或 JPEG 图像");
        Path folder=null;
        try {
            byte[] bytes=upload.getBytes();int width,height;
            try(var stream=ImageIO.createImageInputStream(new java.io.ByteArrayInputStream(bytes))){
                var readers=ImageIO.getImageReaders(stream);if(!readers.hasNext())throw BizException.badRequest("无法解码图像");
                ImageReader reader=readers.next();try {
                    String format=reader.getFormatName();if(!List.of("JPEG","JPG","PNG").contains(format.toUpperCase()))throw BizException.badRequest("仅支持 PNG 或 JPEG 图像");
                    reader.setInput(stream);width=reader.getWidth(0);height=reader.getHeight(0);
                    if((long)width*height>20_000_000)throw BizException.badRequest("图像超过 2000 万像素，请先缩小");
                }finally{reader.dispose();}
            }
            String id=UUID.randomUUID().toString();folder=root().resolve(id);Files.createDirectories(folder);Files.write(folder.resolve("original"),bytes);
            String filename=upload.getOriginalFilename()==null?"梨叶图像":upload.getOriginalFilename().replaceAll("[\\\\/:\\p{Cntrl}]","_");
            var record=VisionRecord.builder().id(id).ownerId(owner).farmId(farmId).plotId(plotId).status("QUEUED")
                .filename(filename.substring(0,Math.min(180,filename.length()))).width(width).height(height)
                .sha256(HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes))).createdAt(LocalDateTime.now()).build();
            records.save(record);
            try{executor.execute(()->run(id));}catch(RejectedExecutionException e){records.deleteById(id);Files.deleteIfExists(folder.resolve("original"));Files.deleteIfExists(folder);throw new BizException("VISION_BUSY","视觉任务较多，请稍后重试",429);}
            return view(record);
        }catch(BizException e){throw e;}catch(Exception e){
            if(folder==null)throw BizException.badRequest("无法读取图像，请上传有效的 PNG 或 JPEG");
            try{Files.deleteIfExists(folder.resolve("original"));Files.deleteIfExists(folder);}catch(Exception ignored){}
            throw BizException.internalError("图像保存失败");
        }
    }
    private void run(String id) {
        var row=records.findById(id).orElseThrow();row.setStatus("RUNNING");records.save(row);
        Path folder=root().resolve(id);
        try {
            var result=inference.infer(folder.resolve("original"));
            if(!List.of("COMPLETED","NEEDS_REVIEW").contains(result.path("status").asString()))throw new IllegalStateException("视觉结果格式不正确");
            row.setResultJson(result.toString());row.setStatus(result.path("status").asString());
        }catch(Exception e){row.setStatus("FAILED");row.setError(e.getMessage());}
        finally{row.setCompletedAt(LocalDateTime.now());records.save(row);}
    }
    public VisionRecord owned(String id,Long owner){return records.findById(id).filter(r->r.getOwnerId().equals(owner)).orElseThrow(()->BizException.notFound("视觉记录不存在"));}
    public View get(String id,Long owner){return view(owned(id,owner));}
    public List<View> list(Long owner,String farmId){return records.findTop50ByOwnerIdAndFarmIdOrderByCreatedAtDesc(owner,farmId).stream().map(this::view).toList();}
    public byte[] image(String id,Long owner){owned(id,owner);try{return Files.readAllBytes(root().resolve(id).resolve("original"));}catch(Exception e){throw BizException.notFound("原图不存在");}}
    public record ReviewInput(@jakarta.validation.constraints.NotBlank String decision,@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=2000) String note) {}
    public List<VisionReview> reviews(String id,Long owner){owned(id,owner);return reviews.findByRecordIdOrderByCreatedAtAscIdAsc(id);}
    public VisionReview review(String id,Long owner,ReviewInput input){
        var row=owned(id,owner);if(!List.of("COMPLETED","NEEDS_REVIEW").contains(row.getStatus()))throw BizException.badRequest("完成检测后才能复核");
        if(!List.of("CONFIRMED","RESAMPLE").contains(input.decision()))throw BizException.badRequest("不支持的复核状态");
        return reviews.save(VisionReview.builder().recordId(id).decision(input.decision()).note(input.note().trim()).createdAt(LocalDateTime.now()).build());
    }
    private View view(VisionRecord r){Object result=null;try{if(r.getResultJson()!=null)result=json.readTree(r.getResultJson());}catch(Exception ignored){}
        return new View(r.getId(),r.getFarmId(),r.getPlotId(),r.getStatus(),r.getSha256(),r.getFilename(),r.getWidth(),r.getHeight(),r.getCreatedAt(),r.getCompletedAt(),r.getError(),result);}
    @EventListener(ApplicationReadyEvent.class) public void recover(){for(var r:records.findByStatusIn(List.of("QUEUED","RUNNING"))){r.setStatus("FAILED");r.setError("服务重启中断任务，请重新上传");r.setCompletedAt(LocalDateTime.now());records.save(r);}}
    @PreDestroy public void close(){executor.shutdownNow();}
}
