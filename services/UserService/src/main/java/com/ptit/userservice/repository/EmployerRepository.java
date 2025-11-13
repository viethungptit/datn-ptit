package com.ptit.userservice.repository;

import com.ptit.userservice.entity.Employer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployerRepository extends JpaRepository<Employer, UUID> {
    List<Employer> findByCompany_CompanyId(UUID companyId);
    Optional<Employer> findByUser_UserId(UUID userId);
}
