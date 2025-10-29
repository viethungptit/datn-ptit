package com.ptit.adminservice.repository;

import com.ptit.adminservice.entity.AdminAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AdminAlertRepository extends JpaRepository<AdminAlert, UUID> {}
