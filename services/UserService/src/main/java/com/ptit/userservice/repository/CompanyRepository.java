package com.ptit.userservice.repository;

import com.ptit.userservice.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {
    // Custom query methods if needed
    long countByIsDeletedFalse();

    Page<Company> findAllByIsDeletedFalse(Pageable pageable);

    Page<Company> findByIsDeletedFalseAndCompanyNameContainingIgnoreCase(String keyword, Pageable pageable);
}
