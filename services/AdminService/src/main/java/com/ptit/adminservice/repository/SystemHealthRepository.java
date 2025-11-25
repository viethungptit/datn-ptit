package com.ptit.adminservice.repository;

import com.ptit.adminservice.entity.SystemHealth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SystemHealthRepository extends JpaRepository<SystemHealth, String> {
    List<SystemHealth> findAllByOrderByServiceNameAsc();
}
