package com.example.ty;

import com.example.ty.assistant.knowledge.KnowledgeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@Rollback
class DashboardIntegrationTests {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired KnowledgeService knowledgeService;

    @Test
    void dashboardProvidesVirtualDataAndPersistsControls() throws Exception {
        String token = registerAndGetToken();

        mockMvc.perform(get("/api/farms/farm-01/dashboard").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.virtualData").value(true))
                .andExpect(jsonPath("$.entities.length()").value(15))
                .andExpect(jsonPath("$.zones.length()").value(8))
                .andExpect(jsonPath("$.environmentMetrics.length()").value(5))
                .andExpect(jsonPath("$.devices.length()").value(6))
                .andExpect(jsonPath("$.irrigationUnits.length()").value(5))
                .andExpect(jsonPath("$.alerts.length()").value(greaterThanOrEqualTo(5)))
                .andExpect(jsonPath("$.alerts[?(@.entityId == 'field-05')].title").value("5号露天种植区土壤湿度低于 35%"))
                .andExpect(jsonPath("$.alerts[?(@.title == '2号草莓温室空气温度超过 32°C')]").exists());

        mockMvc.perform(get("/api/farms/farm-01/greenhouses/gh-01").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.greenhouse.id").value("gh-01"))
                .andExpect(jsonPath("$.greenhouse.crop").value("樱桃番茄"))
                .andExpect(jsonPath("$.scene.cropModel").value("tomato-vine"))
                .andExpect(jsonPath("$.scene.nominalPlantCount").value(640))
                .andExpect(jsonPath("$.metrics.length()").value(5))
                .andExpect(jsonPath("$.devices.length()").value(6))
                .andExpect(jsonPath("$.devices[0].positionX").value(-7.1))
                .andExpect(jsonPath("$.zones.length()").value(3))
                .andExpect(jsonPath("$.plants.length()").value(12))
                .andExpect(jsonPath("$.plants[0].cultivar").value("千禧红"))
                .andExpect(jsonPath("$.heightTrend.length()").value(7));

        mockMvc.perform(get("/api/farms/farm-01/greenhouses/gh-02").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scene.cropModel").value("strawberry"))
                .andExpect(jsonPath("$.scene.cultivationMode").value("高架基质栽培"))
                .andExpect(jsonPath("$.plants[0].cultivar").value("红颜"));

        mockMvc.perform(get("/api/farms/farm-01/greenhouses/gh-06").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scene.cropModel").value("leafy-hydroponic"))
                .andExpect(jsonPath("$.scene.bedCount").value(6))
                .andExpect(jsonPath("$.devices[5].category").value("oxygenator"));

        mockMvc.perform(patch("/api/farms/farm-01/devices/valve-02")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"enabled\":true}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.enabled").value(true));

        mockMvc.perform(patch("/api/farms/farm-01/irrigation/zone-field-04")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"enabled\":true,\"durationMinutes\":25}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.enabled").value(true))
                .andExpect(jsonPath("$.durationMinutes").value(25));

        mockMvc.perform(patch("/api/farms/farm-01/devices/pump-02")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"enabled\":true}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value("离线设备无法开启"));

        mockMvc.perform(post("/api/farms/farm-01/devices/valve-02/self-test")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.lastSeen").value("刚刚"));

        mockMvc.perform(patch("/api/farms/farm-01/alerts/1/handle")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("已处理"));
    }

    @Test
    void dashboardRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/farms/farm-01/dashboard")).andExpect(status().isUnauthorized());
    }

    @Test
    void managesDevicesAndSoilMoistureThreshold() throws Exception {
        String token = registerAndGetToken();
        String auth = "Bearer " + token;
        String device = """
                {"id":"dev-soil-test","entityId":"soil-test-01","name":"测试墒情传感器","category":"sensor",
                 "location":"测试地块","online":true,"enabled":true,"currentValue":"41%"}
                """;

        mockMvc.perform(post("/api/farms/farm-01/devices").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(device))
                .andExpect(status().isOk()).andExpect(jsonPath("$.entityId").value("soil-test-01"));

        mockMvc.perform(put("/api/farms/farm-01/devices/soil-test-01").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(device.replace("测试地块", "4号种植区")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.location").value("4号种植区"));

        mockMvc.perform(put("/api/farms/farm-01/thresholds/soil-moisture").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"minimumValue\":50,\"enabled\":true}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.minimumValue").value(50));

        mockMvc.perform(post("/api/farms/farm-01/simulation/soil-moisture").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"value\":30}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.numericValue").value(30));

        mockMvc.perform(get("/api/farms/farm-01/dashboard").header("Authorization", auth))
                .andExpect(status().isOk()).andExpect(jsonPath("$.environmentMetrics[2].numericValue").value(30));

        mockMvc.perform(patch("/api/farms/farm-01/irrigation/zone-field-04").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"enabled\":true,\"durationMinutes\":18}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.enabled").value(true));

        mockMvc.perform(get("/api/farms/farm-01/dashboard").header("Authorization", auth))
                .andExpect(status().isOk()).andExpect(jsonPath("$.environmentMetrics[2].numericValue").value(90))
                .andExpect(jsonPath("$.entities[?(@.id == 'field-04')].status").value("normal"));

        mockMvc.perform(delete("/api/farms/farm-01/devices/soil-test-01").header("Authorization", auth))
                .andExpect(status().isOk());
    }

    @Test
    void createsUpdatesAndSafelyDeletesPlantingZones() throws Exception {
        String auth = "Bearer " + registerAndGetToken();
        String zone = """
                {"id":"field-07","name":"7号玉米种植区","crop":"甜玉米","area":"4.2 亩",
                 "stage":"苗期","environment":"土壤湿度 55%","health":91,"mapX":80,"mapY":72,
                 "polygon":[[1136,679],[1320,679],[1320,795],[1136,795]]}
                """;

        mockMvc.perform(post("/api/farms/farm-01/zones").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(zone))
                .andExpect(status().isOk()).andExpect(jsonPath("$.entityId").value("field-07"))
                .andExpect(jsonPath("$.crop").value("甜玉米"));

        mockMvc.perform(put("/api/farms/farm-01/zones/field-07").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(zone.replace("苗期", "拔节期").replace("91", "94")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.stage").value("拔节期"));

        mockMvc.perform(delete("/api/farms/farm-01/zones/field-05").header("Authorization", auth))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value("该种植区仍在灌溉，请先停止灌溉后再删除"));

        mockMvc.perform(delete("/api/farms/farm-01/zones/field-07").header("Authorization", auth))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/farms/farm-01/dashboard").header("Authorization", auth))
                .andExpect(status().isOk()).andExpect(jsonPath("$.entities[?(@.id == 'field-07')]").isEmpty());
    }

    @Test
    void managesRetrievableKnowledgeDocuments() throws Exception {
        String token = registerAndGetToken();
        String auth = "Bearer " + token;
        mockMvc.perform(put("/api/assistant/knowledge/test-guide").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"测试灌溉手册\",\"content\":\"银杏编码传感器用于测试地块，滴灌后检查回液。\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.chunks").value(1));

        mockMvc.perform(get("/api/assistant/knowledge").header("Authorization", auth))
                .andExpect(status().isOk()).andExpect(jsonPath("$[?(@.key == 'test-guide')]").exists());

        org.junit.jupiter.api.Assertions.assertEquals("测试灌溉手册", knowledgeService.search("银杏编码传感器", 2).get(0).source());

        mockMvc.perform(delete("/api/assistant/knowledge/test-guide").header("Authorization", auth))
                .andExpect(status().isOk());
    }

    @SuppressWarnings("unchecked")
    private String registerAndGetToken() throws Exception {
        String email = "dashboard-test-" + System.nanoTime() + "@example.test";
        String response = mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"数据台测试\",\"email\":\"" + email + "\",\"password\":\"DemoPass_2026!\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return (String) objectMapper.readValue(response, Map.class).get("token");
    }
}
