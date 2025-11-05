package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.dto.TemplateUpsertRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import com.ptit.recruitservice.dto.TemplateDto;
import com.ptit.recruitservice.service.TemplateService;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruit-service/cv-templates")
public class TemplateController {
    @Autowired
    private TemplateService templateService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/", consumes = "multipart/form-data")
    public TemplateDto createTemplate(@ModelAttribute TemplateUpsertRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return templateService.createTemplate(request, UUID.fromString(currentUserId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{template_id}")
    public TemplateDto deleteTemplate(@PathVariable("template_id") UUID templateId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return templateService.deleteTemplate(templateId, UUID.fromString(currentUserId));
    }

    @GetMapping("/all")
    public List<TemplateDto> getAllTemplates() {
        return templateService.getAllTemplates();
    }

    @PreAuthorize("hasAnyRole('CANDIDATE', 'EMPLOYER', 'ADMIN')")
    @GetMapping("/{template_id}")
    public TemplateDto getTemplateDetail(@PathVariable("template_id") UUID templateId) {
        return templateService.getTemplateDetail(templateId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{template_id}", consumes = "multipart/form-data")
    public TemplateDto updateTemplate(@PathVariable("template_id") UUID templateId, @ModelAttribute TemplateUpsertRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return templateService.updateTemplate(templateId, request, UUID.fromString(currentUserId));
    }
}
