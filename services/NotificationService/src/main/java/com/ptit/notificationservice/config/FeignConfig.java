package com.ptit.notificationservice.config;

import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableFeignClients(basePackages = "com.ptit.notificationservice")
public class FeignConfig {

}

