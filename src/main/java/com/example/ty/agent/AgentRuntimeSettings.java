package com.example.ty.agent;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Shared validated resource limits for desktop and edge deployment. */
@Component
public record AgentRuntimeSettings(int workers,int capacity,int contextTokens,int maxTokens) {
    public AgentRuntimeSettings(
        @Value("${AGENT_WORKERS:2}") int workers,
        @Value("${AGENT_CAPACITY:4}") int capacity,
        @Value("${AGENT_CONTEXT_TOKENS:8192}") int contextTokens,
        @Value("${AGENT_MAX_TOKENS:768}") int maxTokens) {
        if(workers<1||workers>4||capacity<workers||capacity>16)
            throw new IllegalArgumentException("Agent workers must be 1..4; capacity must be workers..16");
        if(contextTokens<2048||contextTokens>32768||maxTokens<128||maxTokens>2048||maxTokens>=contextTokens)
            throw new IllegalArgumentException("Invalid Agent token budget");
        this.workers=workers;this.capacity=capacity;this.contextTokens=contextTokens;this.maxTokens=maxTokens;
    }
}
