package com.example.ty;

import com.example.ty.multicrop.MultiCropRuntime;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import java.net.URI;
import static org.assertj.core.api.Assertions.*;

class MultiCropRuntimeTests {
    @Test void automaticOwnershipIsLimitedToLocalHttpServices(){
        assertThat(MultiCropRuntime.local(URI.create("http://127.0.0.1:8090"))).isTrue();
        assertThat(MultiCropRuntime.local(URI.create("http://localhost:8090"))).isTrue();
        assertThat(MultiCropRuntime.local(URI.create("https://example.com"))).isFalse();
        assertThat(MultiCropRuntime.local(URI.create("http://127.0.0.1:8090/external"))).isFalse();
    }
    @Test void externalAndDisabledServicesAreNotStartedOrStopped(){
        for(var url:new String[]{"http://example.com:8090","http://127.0.0.1:8090"}){
            var runtime=new MultiCropRuntime(new ObjectMapper(),url,"nonexistent-python",false);
            try{assertThatCode(runtime::ensureReady).doesNotThrowAnyException();}finally{runtime.close();}
        }
    }
}
