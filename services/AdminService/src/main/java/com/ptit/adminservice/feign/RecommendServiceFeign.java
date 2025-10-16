package com.ptit.adminservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "recommendServiceClient", url = "${external.recommend.service.url}")
public interface RecommendServiceFeign {
    // Example endpoint, adjust as needed
    @GetMapping("/api/recommend-service/recommends/{id}")
    Object getRecommendById(@PathVariable("id") Long id);
}

