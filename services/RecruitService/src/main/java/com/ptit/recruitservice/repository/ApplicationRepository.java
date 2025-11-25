package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByJob_JobIdAndCv_UserIdAndIsDeletedFalse(UUID jobId, UUID userId);
    List<Application> findByCv_UserIdAndIsDeletedFalse(UUID userId);

    // Count helpers for stats
    long countByIsDeletedFalse();
    long countByStatusAndIsDeletedFalse(Application.Status status);
}
