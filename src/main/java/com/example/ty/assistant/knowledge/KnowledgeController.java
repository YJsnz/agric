package com.example.ty.assistant.knowledge;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/assistant/knowledge")
@RequiredArgsConstructor
public class KnowledgeController {
    private final KnowledgeService service;

    @GetMapping public List<KnowledgeDocumentSummary> list() { return service.list(); }
    @PutMapping("/{key}") public KnowledgeDocumentSummary upsert(@PathVariable String key, @Valid @RequestBody KnowledgeDocumentRequest request) { return service.upsert(key, request); }
    @DeleteMapping("/{key}") public void delete(@PathVariable String key) { service.delete(key); }
}
