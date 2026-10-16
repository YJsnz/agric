package com.example.ty.embedded;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;
/** Uses existing authenticated API boundary. Gateway logs in using a dedicated account. */
@RestController @RequestMapping("/api/farms/{farm}/embedded/{device}") @RequiredArgsConstructor
public class EmbeddedController {
    private final EmbeddedService service;
    @PostMapping("/telemetry") public EmbeddedMessage telemetry(@PathVariable String farm,@PathVariable String device,@RequestBody EmbeddedService.Uplink body){return service.ingest(farm,device,body);}
    @PostMapping("/commands") public EmbeddedMessage command(@PathVariable String farm,@PathVariable String device,@RequestBody EmbeddedService.Command body){return service.command(farm,device,body);}
    @GetMapping("/commands/pending") public List<EmbeddedMessage> pending(@PathVariable String farm,@PathVariable String device){return service.pending(farm,device);}
    @PostMapping("/acks") public EmbeddedMessage ack(@PathVariable String farm,@PathVariable String device,@RequestBody EmbeddedService.Ack body){return service.ack(farm,device,body);}
    @GetMapping("/messages") public List<EmbeddedMessage> history(@PathVariable String farm,@PathVariable String device){return service.history(farm,device);}
}
