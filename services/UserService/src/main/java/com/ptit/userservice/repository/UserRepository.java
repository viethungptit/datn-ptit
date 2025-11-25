package com.ptit.userservice.repository;

import com.ptit.userservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIsDeletedFalse(String email);
    Optional<User> findByEmailAndIsDeletedFalse(String email);
    Page<User> findAllByIsDeletedFalse(Pageable pageable);

}
