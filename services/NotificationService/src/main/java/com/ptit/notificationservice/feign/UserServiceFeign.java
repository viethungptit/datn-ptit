package com.ptit.notificationservice.feign;

import com.ptit.notificationservice.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "notificationUserServiceClient", url = "${external.user.service.url}")
public interface UserServiceFeign {

    @GetMapping("/api/user-service/users/by-email")
    UserResponse getUserByEmail(@RequestParam("email") String email, @RequestHeader("X-Internal-Secret") String secret);
}
