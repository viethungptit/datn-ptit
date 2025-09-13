package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JobRepository extends JpaRepository<Job, UUID> {
    List<Job> findByIsDeletedFalse();
    List<Job> findByCompanyIdAndIsDeletedFalse(UUID companyId);
    List<Job> findByCityAndIsDeletedFalse(String city);
}