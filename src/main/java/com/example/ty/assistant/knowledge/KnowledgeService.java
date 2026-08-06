package com.example.ty.assistant.knowledge;

import com.example.ty.auth.exception.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KnowledgeService {
    private static final int CHUNK_SIZE = 520;
    private static final int CHUNK_OVERLAP = 80;
    private final KnowledgeDocumentRepository documents;

    @Transactional(readOnly = true)
    public List<KnowledgeDocumentSummary> list() {
        return documents.findAllByOrderByUpdatedAtDesc().stream().map(this::summary).toList();
    }

    @Transactional
    public KnowledgeDocumentSummary upsert(String key, KnowledgeDocumentRequest request) {
        String normalizedKey = normalizeKey(key);
        KnowledgeDocument document = documents.findByDocumentKey(normalizedKey).orElseGet(KnowledgeDocument::new);
        document.setDocumentKey(normalizedKey);
        document.setTitle(request.title().trim());
        document.setContent(request.content().strip());
        document.setUpdatedAt(LocalDateTime.now());
        return summary(documents.save(document));
    }

    @Transactional
    public void delete(String key) {
        KnowledgeDocument document = documents.findByDocumentKey(normalizeKey(key)).orElseThrow(() -> BizException.notFound("知识文档不存在"));
        documents.delete(document);
    }

    @Transactional(readOnly = true)
    public List<KnowledgeSearchResult> search(String query, int limit) {
        if (query == null || query.isBlank()) return List.of();
        Set<String> terms = terms(query);
        if (terms.isEmpty()) return List.of();
        List<KnowledgeSearchResult> matches = new ArrayList<>();
        for (KnowledgeDocument document : documents.findAll()) {
            for (String chunk : chunks(document.getContent())) {
                double score = score(chunk, terms);
                if (score > 0) matches.add(new KnowledgeSearchResult(document.getTitle(), chunk, score));
            }
        }
        return matches.stream().sorted(Comparator.comparingDouble(KnowledgeSearchResult::score).reversed())
                .limit(Math.max(1, Math.min(limit, 6))).toList();
    }

    private double score(String chunk, Set<String> terms) {
        String normalized = chunk.toLowerCase(Locale.ROOT);
        double score = 0;
        for (String term : terms) {
            int index = normalized.indexOf(term);
            while (index >= 0) { score += term.length() >= 2 ? 2.0 : .35; index = normalized.indexOf(term, index + term.length()); }
        }
        return score;
    }

    private Set<String> terms(String query) {
        String normalized = query.toLowerCase(Locale.ROOT).replaceAll("[^\\p{IsHan}a-z0-9]+", " ").trim();
        Set<String> result = Arrays.stream(normalized.split("\\s+")).filter(item -> item.length() >= 2).collect(Collectors.toCollection(LinkedHashSet::new));
        String han = normalized.replaceAll("[^\\p{IsHan}]", "");
        for (int i = 0; i + 1 < han.length(); i++) result.add(han.substring(i, i + 2));
        return result;
    }

    private List<String> chunks(String content) {
        if (content == null || content.isBlank()) return List.of();
        List<String> result = new ArrayList<>();
        int start = 0;
        while (start < content.length()) {
            int end = Math.min(content.length(), start + CHUNK_SIZE);
            if (end < content.length()) {
                int breakAt = Math.max(content.lastIndexOf('\n', end), content.lastIndexOf('。', end));
                if (breakAt > start + CHUNK_SIZE / 2) end = breakAt + 1;
            }
            result.add(content.substring(start, end).strip());
            if (end >= content.length()) break;
            start = Math.max(start + 1, end - CHUNK_OVERLAP);
        }
        return result;
    }

    private KnowledgeDocumentSummary summary(KnowledgeDocument item) {
        return new KnowledgeDocumentSummary(item.getDocumentKey(), item.getTitle(), item.getContent().length(), chunks(item.getContent()).size(), item.getUpdatedAt());
    }

    private String normalizeKey(String key) {
        if (key == null || !key.matches("[A-Za-z0-9_-]{2,80}")) throw BizException.badRequest("知识文档标识格式不正确");
        return key.toLowerCase(Locale.ROOT);
    }
}
