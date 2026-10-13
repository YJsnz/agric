package com.example.ty.operations;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/** Liveness only; authenticated system status reports model/database readiness. */
@RestController
public class HealthController {
    @GetMapping("/api/health") public Map<String,String> health() { return Map.of("status","UP"); }
}
