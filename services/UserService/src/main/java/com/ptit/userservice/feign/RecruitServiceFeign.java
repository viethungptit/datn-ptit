package com.ptit.userservice.feign;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@FeignClient(name = "recruitServiceClient", url = "${external.recruit.service.url}")
public interface RecruitServiceFeign {
    @PutMapping("/api/recruit-service/jobs/company/{companyId}/soft-delete")
    void softDeleteJobByCompanyId(@PathVariable("companyId") UUID companyId, @RequestHeader("X-Internal-Secret") String secret);

}


