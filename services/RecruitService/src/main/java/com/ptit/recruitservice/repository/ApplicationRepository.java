package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
}

