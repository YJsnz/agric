package com.example.ty.operations;
import com.example.ty.assistant.knowledge.*;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
@Component @RequiredArgsConstructor
public class SoftwareKnowledgeInitializer implements ApplicationRunner {
 private final KnowledgeDocumentRepository documents;
 public void run(ApplicationArguments args){
  String key="software-demo-workflows-v1";if(documents.findByDocumentKey(key).isPresent())return;
  documents.save(KnowledgeDocument.builder().documentKey(key).title("盐田丰语软件演示操作参考")
   .content("本资料是软件操作说明，不是农业生产规范。鸭梨采后批次在种植面板登记，填写所属地块、标题、数量、单位和说明。批次依次采收、分选、入库、出库，每步填写操作说明，保存时间与操作人，不能越级。农事和生长观察是独立记录，不属于采后批次。灌溉和灌排控制为软件模拟：开启后保存模拟回执，示范观测湿度恢复，告警自动解除并记录，不代表硬件执行。墒情观测是演示数据，按软件配置下限核验。梨叶视觉支持图片和摄像头采样，本地ONNX模型输出卷曲、虫害和斑点候选，检测置信度不是病害概率；人工复核意见单独保存，不改写模型输出。Agent可以读取观测、检索资料、核验阈值、查询本人视觉与共享业务记录，不能编造已执行操作。此说明没有提供鸭梨冷链温度、农药剂量或现场栽培方案，相关问题应明确资料缺失。")
   .updatedAt(LocalDateTime.now()).build());
 }
}
