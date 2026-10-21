package com.spoilai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SpoilAiApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpoilAiApplication.class, args);
    }
}
