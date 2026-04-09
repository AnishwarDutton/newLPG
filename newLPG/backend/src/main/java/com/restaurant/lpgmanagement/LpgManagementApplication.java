package com.restaurant.lpgmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.restaurant.lpgmanagement")
public class LpgManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(LpgManagementApplication.class, args);
    }
}