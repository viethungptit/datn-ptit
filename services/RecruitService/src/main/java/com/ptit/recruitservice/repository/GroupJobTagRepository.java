package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.GroupJobTag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface GroupJobTagRepository extends JpaRepository<GroupJobTag, UUID> {
    List<GroupJobTag> findByIsDeletedFalse();
}
