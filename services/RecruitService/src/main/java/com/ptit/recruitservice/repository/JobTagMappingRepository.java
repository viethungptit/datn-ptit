package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.JobTagMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface JobTagMappingRepository extends JpaRepository<JobTagMapping, UUID> {
    List<JobTagMapping> findByJob_JobId(UUID jobId);
    void deleteByJob_JobId(UUID jobId);
}
