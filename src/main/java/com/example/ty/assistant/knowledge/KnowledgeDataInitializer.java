package com.example.ty.assistant.knowledge;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KnowledgeDataInitializer implements ApplicationRunner {
    private final KnowledgeDocumentRepository documents;
    private final KnowledgeService service;

    @Override
    public void run(ApplicationArguments args) {
        if (documents.count() > 0) return;
        service.upsert("irrigation-guide", new KnowledgeDocumentRequest("智慧灌溉基础指南", """
                # 土壤墒情与灌溉建议

                土壤湿度应结合土壤类型、作物阶段、天气和根系深度判断。平台中的湿度百分比是监测指标，不能脱离传感器标定直接换算成绝对含水量。

                当土壤湿度低于配置下限时，应先核对传感器在线状态和最近采集时间，再检查同一区域相邻探头。确认偏低后，可采用少量多次灌溉，避免一次过量造成深层渗漏。

                温室草莓膨果期应保持根区水分稳定，滴灌后复查回液、EC 和叶片状态。叶菜在高温高蒸散条件下可缩短灌溉间隔，但应避免夜间长期高湿。

                远程启动灌溉前必须确认阀门、泵站在线且管路无检修作业。下发指令后应核对流量或压力反馈；没有设备回执时，不得判断灌溉已经成功执行。

                阈值告警用于提醒人工复核，不应直接替代农艺决策。传感器故障、安装位置和土壤局部差异都可能造成异常读数。
                """));
    }
}
