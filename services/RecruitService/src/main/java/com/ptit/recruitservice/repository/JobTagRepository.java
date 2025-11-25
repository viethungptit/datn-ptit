package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.JobTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface JobTagRepository extends JpaRepository<JobTag, UUID> {
    List<JobTag> findByIsDeletedFalse();
    @Query("SELECT t FROM JobTag t JOIN JobTagMapping m ON t.id = m.jobTag.id WHERE m.job.jobId = :jobId")
    List<JobTag> findAllByJobId(@Param("jobId") UUID jobId);

    // count for stats
    long countByIsDeletedFalse();
}
