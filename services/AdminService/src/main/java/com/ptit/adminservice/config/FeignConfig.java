package com.ptit.adminservice.config;

import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableFeignClients(basePackages = "com.ptit.adminservice.feign")
public class FeignConfig {

}

