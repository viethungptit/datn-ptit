package com.ptit.recruitservice.feign;

import com.ptit.recruitservice.dto.CompanyResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "userServiceClient", url = "${external.user.service.url}")
public interface UserServiceFeign {
    // Example endpoint, adjust as needed
    @GetMapping("/api/user-service/companies/by-user/{userId}")
    CompanyResponse getCompanyByUserId(@RequestParam("userId") UUID userId);
}


