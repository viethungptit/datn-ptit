package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.CV;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CVRepository extends JpaRepository<CV, UUID> {
    List<CV> findByUserIdAndIsDeletedFalse(UUID userId);
    List<CV> findByIsDeletedFalse();
    long countByIsDeletedFalse();
}
