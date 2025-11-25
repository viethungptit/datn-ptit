package com.ptit.adminservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "recommendServiceClient", url = "${external.recommend.service.url}")
public interface RecommendServiceFeign {
    @GetMapping("/api/recommend-service/health")
    Map<String, Object> getHealthStatus(@RequestHeader("X-Internal-Secret") String secret);
}

