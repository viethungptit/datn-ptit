package com.ptit.adminservice.controller;

import com.ptit.adminservice.entity.SystemHealth;
import com.ptit.adminservice.repository.SystemHealthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin-service/system-health")
@RequiredArgsConstructor
public class SystemHealthController {
    private final SystemHealthRepository systemHealthRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    public ResponseEntity<List<SystemHealth>> getHealthFromDb(@RequestParam(required = false) String service) {
        try{
            List<SystemHealth> list;
            if (service != null && !service.isBlank()) {
                Optional<SystemHealth> sh = systemHealthRepository.findById(service);
                list = sh.map(List::of).orElseGet(List::of);
            } else {
                list = systemHealthRepository.findAllByOrderByServiceNameAsc();
            }
            return ResponseEntity.ok(list);
        }catch (Exception e){
            throw new RuntimeException("Lỗi khi truy xuất dữ liệu hệ thống từ cơ sở dữ liệu.", e);
        }
    }
}

