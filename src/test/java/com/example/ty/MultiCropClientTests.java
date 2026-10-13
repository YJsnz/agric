package com.example.ty;
import com.example.ty.multicrop.MultiCropClient;
import com.example.ty.auth.exception.BizException;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import java.net.InetSocketAddress;
import java.util.concurrent.atomic.AtomicReference;
import static org.assertj.core.api.Assertions.*;

class MultiCropClientTests {
    @Test void forwardingUsesOnlyFixedRoutesAndPreservesInput() throws Exception {
        var server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
        var route=new AtomicReference<String>();var body=new AtomicReference<String>();
        server.createContext("/",exchange->{
            route.set(exchange.getRequestURI().toString());
            body.set(new String(exchange.getRequestBody().readAllBytes(),java.nio.charset.StandardCharsets.UTF_8));
            byte[] reply=(exchange.getRequestURI().getPath().equals("/api/wheat/ask")?"{\"status\":\"validation_failed\"}":"{\"success\":true}").getBytes();
            exchange.sendResponseHeaders(200,reply.length);exchange.getResponseBody().write(reply);exchange.close();
        });
        server.start();
        try {
            var client=new MultiCropClient("http://127.0.0.1:"+server.getAddress().getPort(),new ObjectMapper());
            assertThat(client.forward("POST","/api/jujube/vision/analyze",null,"application/json","payload".getBytes()).statusCode()).isEqualTo(200);
            assertThat(route.get()).isEqualTo("/jujube/api/jujube/vision/analyze");
            assertThat(body.get()).isEqualTo("payload");
            assertThatThrownBy(()->client.forward("GET","/admin",null,"application/json",new byte[0])).isInstanceOf(BizException.class);
            assertThatThrownBy(()->client.ask("tomato","番茄问题")).isInstanceOf(BizException.class);
            assertThatThrownBy(()->client.ask("wheat","小麦问题")).isInstanceOf(BizException.class).hasMessageContaining("证据核验");
        }finally{server.stop(0);}
    }
    @Test void publicApiCannotTrainOrSelectAnArbitraryModelHost() {
        assertThat(MultiCropClient.allowed("POST","/api/train")).isFalse();
        assertThat(MultiCropClient.allowed("DELETE","/api/wheat/diagnose")).isFalse();
        assertThat(MultiCropClient.allowed("POST","/api/qingxian/ask")).isTrue();
    }
}
