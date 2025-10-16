package com.ptit.adminservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "recruitServiceClient", url = "${external.recruit.service.url}")
public interface RecruitServiceFeign {
    // Example endpoint, adjust as needed
    @GetMapping("/api/recruit-service/recruits/{id}")
    Object getRecruitById(@PathVariable("id") Long id);
}

