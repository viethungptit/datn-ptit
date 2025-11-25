package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.GroupJobTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface GroupJobTagRepository extends JpaRepository<GroupJobTag, UUID> {
    List<GroupJobTag> findByIsDeletedFalse();
    @Query("SELECT g FROM GroupJobTag g JOIN JobGroupTagMapping m ON g.id = m.groupJobTag.id WHERE m.job.jobId = :jobId")
    List<GroupJobTag> findAllByJobId(@Param("jobId") UUID jobId);

    long countByIsDeletedFalse();
}
