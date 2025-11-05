package com.ptit.userservice.repository;

import com.ptit.userservice.entity.File;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FileRepository extends JpaRepository<File, UUID> {
    List<File> findAllByUser_UserId(UUID userId);
}
