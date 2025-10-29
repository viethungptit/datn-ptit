package com.ptit.recruitservice.feign;

import com.ptit.recruitservice.dto.CompanyResponse;
import com.ptit.recruitservice.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "userServiceClient", url = "${external.user.service.url}")
public interface UserServiceFeign {
    @GetMapping("/api/user-service/companies/by-user/{userId}")
    CompanyResponse getCompanyByUserId(@PathVariable("userId") UUID userId, @RequestHeader("X-Internal-Secret") String secret);

    @GetMapping("/api/user-service/users/by-userId/{userId}")
    UserResponse getUserByUserId(@PathVariable("userId") UUID userId, @RequestHeader("X-Internal-Secret") String secret);

    @GetMapping("/api/user-service/companies/by-companyId/{companyId}")
    CompanyResponse getCompanyByCompanyId(@PathVariable("companyId") UUID companyId, @RequestHeader("X-Internal-Secret") String secret);

}


