package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.dto.TemplateUpsertRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import com.ptit.recruitservice.dto.TemplateDto;
import com.ptit.recruitservice.service.TemplateService;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {
    @Autowired
    private TemplateService templateService;


    @PostMapping(value = "/", consumes = "multipart/form-data")
    public TemplateDto createTemplate(@ModelAttribute TemplateUpsertRequest request) {
        return templateService.createTemplate(request);
    }

    @DeleteMapping("/{template_id}")
    public TemplateDto deleteTemplate(@PathVariable("template_id") UUID templateId) {
        return templateService.deleteTemplate(templateId);
    }

    @GetMapping("/all")
    public List<TemplateDto> getAllTemplates() {
        return templateService.getAllTemplates();
    }

    @GetMapping("/{template_id}")
    public TemplateDto getTemplateDetail(@PathVariable("template_id") UUID templateId) {
        return templateService.getTemplateDetail(templateId);
    }

    @PutMapping(value = "/{template_id}", consumes = "multipart/form-data")
    public TemplateDto updateTemplate(@PathVariable("template_id") UUID templateId, @ModelAttribute TemplateUpsertRequest request) {
        return templateService.updateTemplate(templateId, request);
    }
}
