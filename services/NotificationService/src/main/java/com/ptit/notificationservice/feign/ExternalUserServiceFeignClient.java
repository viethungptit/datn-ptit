package com.ptit.notificationservice.feign;

import com.ptit.notificationservice.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "externalUserService", url = "${external.user.service.url}")
public interface ExternalUserServiceFeignClient {

    @GetMapping("/api/users/by-email")
    UserResponse getUserByEmail(@RequestParam("email") String email);
}
