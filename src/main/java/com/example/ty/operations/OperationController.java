package com.example.ty.operations;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/farms/{farmId}/operations") @RequiredArgsConstructor
public class OperationController {
 private final OperationService service;
 @GetMapping public List<OperationRecord> list(@PathVariable String farmId){return service.list(farmId);}
 @PostMapping public OperationRecord create(@PathVariable String farmId,@Valid @RequestBody OperationService.Create input){return service.create(farmId,input);}
 @PostMapping("/{id}/advance") public OperationRecord advance(@PathVariable String farmId,@PathVariable Long id,@Valid @RequestBody OperationService.Advance input){return service.advance(farmId,id,input);}
 @GetMapping("/{id}/trace") public List<OperationRecord> trace(@PathVariable String farmId,@PathVariable Long id){return service.trace(farmId,id);}
}
