package com.example.ty;
import com.example.ty.agent.AgentRuntimeSettings;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class AgentResourceTests {
    @Test void edgeLimitsAreBoundedBeforeStartingNativeRuntimes() {
        var settings=new AgentRuntimeSettings(1,2,4096,512);
        assertThat(settings.workers()).isEqualTo(1);
        assertThatThrownBy(()->new AgentRuntimeSettings(3,2,4096,512)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(()->new AgentRuntimeSettings(1,2,1024,512)).isInstanceOf(IllegalArgumentException.class);
    }
}
