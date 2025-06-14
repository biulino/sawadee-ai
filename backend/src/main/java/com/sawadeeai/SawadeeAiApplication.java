package com.sawadeeai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.sawadeeai.repositories")
@EntityScan(basePackages = "com.sawadeeai.entities")
@EnableAsync
@EnableTransactionManagement
public class SawadeeAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(SawadeeAiApplication.class, args);
    }
}
