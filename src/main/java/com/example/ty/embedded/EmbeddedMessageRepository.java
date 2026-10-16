package com.example.ty.embedded;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface EmbeddedMessageRepository extends JpaRepository<EmbeddedMessage,Long> {
    Optional<EmbeddedMessage> findByDeviceIdAndMessageKey(String deviceId,String messageKey);
    List<EmbeddedMessage> findTop100ByDeviceIdOrderByIdDesc(String deviceId);
    List<EmbeddedMessage> findTop20ByDeviceIdAndKindAndStatusOrderByIdAsc(String deviceId,String kind,String status);
}
