package com.example.ty.transport;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.*;
@RestController @RequestMapping("/api/farms/{farmId}/transport") @RequiredArgsConstructor
public class TransportController {
 private final TransportService service;
 @GetMapping public Map<String,Object> state(@PathVariable String farmId){return Map.of("state",service.state(farmId),"roadStatus",service.roadStatus(farmId));}
 @GetMapping("/plan") public Object plan(@PathVariable String farmId,@RequestParam String source,@RequestParam String destination){return service.preview(farmId,source,destination);}
 @PostMapping("/tasks") public Object create(@PathVariable String farmId,@RequestBody TransportService.Create input){return service.create(farmId,input);}
 public record Control(String action){}
 @PostMapping("/tasks/{id}/control") public Object control(@PathVariable String farmId,@PathVariable String id,@RequestBody Control input){return service.control(farmId,id,input.action());}
 public record RoadInput(boolean blocked){}
 @PostMapping("/roads/{id}") public Object road(@PathVariable String farmId,@PathVariable String id,@RequestBody RoadInput input){return service.road(farmId,id,input.blocked());}
 public record ObstacleInput(String road,boolean moving){}
 @PostMapping("/obstacles") public Object obstacle(@PathVariable String farmId,@RequestBody ObstacleInput input){return service.obstacle(farmId,input.road(),input.moving());}
 @DeleteMapping("/obstacles") public Object clear(@PathVariable String farmId){return service.clearObstacles(farmId);}
}
