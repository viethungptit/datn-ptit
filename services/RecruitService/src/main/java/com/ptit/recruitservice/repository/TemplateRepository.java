package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.Template;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TemplateRepository extends JpaRepository<Template, UUID> {
}

