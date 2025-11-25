package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobRepository extends JpaRepository<Job, UUID>, JpaSpecificationExecutor<Job> {
    List<Job> findByIsDeletedFalse();
    List<Job> findByCompanyIdAndIsDeletedFalse(UUID companyId);
    List<Job> findByCityAndIsDeletedFalse(String city);
    List<Job> findByStatusAndDeadlineBefore(Job.Status status, java.sql.Timestamp deadline);

    // Count methods used by stats endpoint
    long countByIsDeletedFalse();
    long countByStatusAndIsDeletedFalse(Job.Status status);
}