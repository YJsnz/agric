package com.example.ty;

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

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@Rollback
class DashboardIntegrationTests {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

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
                .andExpect(jsonPath("$.alerts.length()").value(3));

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

    @SuppressWarnings("unchecked")
    private String registerAndGetToken() throws Exception {
        String email = "dashboard-test-" + System.nanoTime() + "@example.test";
        String response = mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"数据台测试\",\"email\":\"" + email + "\",\"password\":\"DemoPass_2026!\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return (String) objectMapper.readValue(response, Map.class).get("token");
    }
}
