package com.example.ty.agent;

import com.example.ty.auth.entity.User;
import com.example.ty.auth.security.AuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/agent") @RequiredArgsConstructor
public class AgentController {
    private final AgentRuntime runtime;
    private final AgentStore store;
    public record TaskRequest(String question,String farmId) {}
    @PostMapping("/runs") @ResponseStatus(HttpStatus.ACCEPTED)
    public AgentRun create(@RequestAttribute(AuthInterceptor.CURRENT_USER_ATTR) User user,@RequestBody TaskRequest request) { return runtime.create(user.getId(),request.question(),request.farmId()==null?"yantian-01":request.farmId()); }
    @GetMapping("/runs") public List<AgentRun> list(@RequestAttribute(AuthInterceptor.CURRENT_USER_ATTR) User user) { return store.list(user.getId()); }
    @GetMapping("/runs/{id}") public AgentRun get(@RequestAttribute(AuthInterceptor.CURRENT_USER_ATTR) User user,@PathVariable String id) { return store.owned(id,user.getId()); }
    @GetMapping("/runs/{id}/events") public List<AgentEvent> events(@RequestAttribute(AuthInterceptor.CURRENT_USER_ATTR) User user,@PathVariable String id,@RequestParam(defaultValue="0") long after_seq) { return store.events(id,user.getId(),Math.max(0,after_seq)); }
    public record FollowupRequest(String question) {}
    @PostMapping("/runs/{id}/followup") public AgentRun followup(@RequestAttribute(AuthInterceptor.CURRENT_USER_ATTR) User user,@PathVariable String id,@RequestBody FollowupRequest request) {return runtime.followup(id,user.getId(),request.question());}
    @PostMapping("/runs/{id}/retry") public AgentRun retry(@RequestAttribute(AuthInterceptor.CURRENT_USER_ATTR) User user,@PathVariable String id) { return runtime.retry(id,user.getId()); }
    @PostMapping("/runs/{id}/cancel") public AgentRun cancel(@RequestAttribute(AuthInterceptor.CURRENT_USER_ATTR) User user,@PathVariable String id) { return runtime.cancel(id,user.getId()); }
}
