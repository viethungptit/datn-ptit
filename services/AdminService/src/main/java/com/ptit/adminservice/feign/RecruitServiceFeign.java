package com.ptit.adminservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "recruitServiceClient", url = "${external.recruit.service.url}")
public interface RecruitServiceFeign {
    @GetMapping("/api/recruit-service/health")
    Map<String, Object> getHealthStatus(@RequestHeader("X-Internal-Secret") String secret);

    @GetMapping("/api/recruit-service/health/stats")
    Map<String, Object> getRecruitStats(@RequestHeader("X-Internal-Secret") String secret);
}

