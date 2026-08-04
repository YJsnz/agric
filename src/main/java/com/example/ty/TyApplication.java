package com.example.ty;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TyApplication {

    public static void main(String[] args) {
        SpringApplication.run(TyApplication.class, args);
    }

}
