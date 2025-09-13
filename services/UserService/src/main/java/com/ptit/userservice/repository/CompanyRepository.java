package com.ptit.userservice.repository;

import com.ptit.userservice.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {
    // Custom query methods if needed
}

