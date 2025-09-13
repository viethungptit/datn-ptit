package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.JobTag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface JobTagRepository extends JpaRepository<JobTag, UUID> {
    List<JobTag> findByIsDeletedFalse();
}
