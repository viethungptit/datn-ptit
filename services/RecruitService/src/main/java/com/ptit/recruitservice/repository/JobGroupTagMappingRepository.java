package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.JobGroupTagMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface JobGroupTagMappingRepository extends JpaRepository<JobGroupTagMapping, UUID> {
    List<JobGroupTagMapping> findByJob_JobId(UUID jobId);
    void deleteByJob_JobId(UUID jobId);
}
