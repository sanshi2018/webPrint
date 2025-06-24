package com.sanshi.webprint;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WebPrintApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebPrintApplication.class, args);
    }

    /**
     * Configure OpenAPI documentation
     * @return OpenAPI configuration with proper API info
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("WebPrint API")
                        .version("1.0.0")
                        .description("Network Printing Service API - A comprehensive printing solution supporting PDF files with HP LaserJet M1005 printers")
                        .contact(new Contact()
                                .name("WebPrint Team")
                                .email("support@webprint.com")));
    }

}
