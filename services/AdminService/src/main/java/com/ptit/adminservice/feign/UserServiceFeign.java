package com.ptit.adminservice.feign;

import com.ptit.adminservice.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "userServiceClient", url = "${external.user.service.url}")
public interface UserServiceFeign {
    // Example endpoint, adjust as needed
    @GetMapping("/api/user-service/users/by-email")
    UserResponse getUserByEmail(@RequestParam("email") String email);
}

