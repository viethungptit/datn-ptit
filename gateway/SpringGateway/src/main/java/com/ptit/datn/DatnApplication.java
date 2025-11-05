package com.ptit.datn;

import com.ptit.datn.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class DatnApplication {
	public static void main(String[] args) {
		SpringApplication.run(DatnApplication.class, args);
	}

}
