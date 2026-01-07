package com.ptit.recruitservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
@EnableFeignClients(basePackages = "com.ptit.recruitservice.feign")
public class RecruitServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(RecruitServiceApplication.class, args);
	}

}
