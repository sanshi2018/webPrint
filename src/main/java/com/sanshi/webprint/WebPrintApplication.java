package com.sanshi.webprint;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WebPrintApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebPrintApplication.class, args);
    }

}
