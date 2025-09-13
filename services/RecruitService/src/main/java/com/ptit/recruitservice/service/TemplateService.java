package com.ptit.recruitservice.service;

import com.ptit.recruitservice.dto.TemplateDto;
import com.ptit.recruitservice.dto.TemplateUpsertRequest;
import com.ptit.recruitservice.entity.Template;
import com.ptit.recruitservice.repository.TemplateRepository;
import com.ptit.recruitservice.exception.ResourceNotFoundException;
import com.ptit.recruitservice.exception.BusinessException;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.io.InputStream;
import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class TemplateService {
    @Autowired
    private TemplateRepository templateRepository;
    @Autowired
    private MinioClient minioClient;
    @Value("${minio.bucket}")
    private String bucketName;
    @Autowired
    private ObjectMapper objectMapper;


    private String uploadPreviewImage(MultipartFile previewImage) {
        if (previewImage == null || previewImage.isEmpty()) return null;
        try (InputStream is = previewImage.getInputStream()) {
            String objectName = "preview-image/" + "template-" + UUID.randomUUID() + "-" + previewImage.getOriginalFilename();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(is, previewImage.getSize(), -1)
                            .contentType(previewImage.getContentType())
                            .build()
            );
            return objectName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload previewImage to MinIO: " + e.getMessage());
        }
    }

    private void deletePreviewImageInMinio(String objectKey) {
        if (objectKey == null || objectKey.isEmpty()) return;
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete preview image in MinIO: " + e.getMessage());
        }
    }

    private JsonNode validateAndConvertJson(String json, String fieldName) {
        if (json == null || json.isEmpty()) return null;
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            throw new BusinessException("Invalid JSON for field '" + fieldName + "': " + e.getMessage());
        }
    }

    public TemplateDto createTemplate(TemplateUpsertRequest request) {
        Template entity = new Template();
        entity.setName(request.getName());
        entity.setLayoutJson(validateAndConvertJson(request.getLayoutJson(), "layoutJson"));
        entity.setThemeJson(validateAndConvertJson(request.getThemeJson(), "themeJson"));
        entity.setIsDeleted(false);
        entity.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        if (request.getPreview() != null && !request.getPreview().isEmpty()) {
            String previewUrl = uploadPreviewImage(request.getPreview());
            entity.setPreviewUrl(previewUrl);
        }
        entity = templateRepository.save(entity);
        return toDto(entity);
    }

    public TemplateDto deleteTemplate(UUID templateId) {
        Template entity = templateRepository.findById(templateId)
            .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + templateId));
        entity.setIsDeleted(true);
        templateRepository.save(entity);
        return toDto(entity);
    }

    public List<TemplateDto> getAllTemplates() {
        return templateRepository.findAll().stream()
                .filter(t -> !Boolean.TRUE.equals(t.getIsDeleted()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public TemplateDto getTemplateDetail(UUID templateId) {
        Template entity = templateRepository.findById(templateId)
            .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + templateId));
        return toDto(entity);
    }

    public TemplateDto updateTemplate(UUID templateId, TemplateUpsertRequest request) {
        Template entity = templateRepository.findById(templateId)
            .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + templateId));
        entity.setName(request.getName());
        entity.setLayoutJson(validateAndConvertJson(request.getLayoutJson(), "layoutJson"));
        entity.setThemeJson(validateAndConvertJson(request.getThemeJson(), "themeJson"));
        MultipartFile newPreview = request.getPreview();
        if (newPreview != null && !newPreview.isEmpty()) {
            // Delete old preview in MinIO
            deletePreviewImageInMinio(entity.getPreviewUrl());
            // Upload new preview
            String previewUrl = uploadPreviewImage(newPreview);
            entity.setPreviewUrl(previewUrl);
        }
        templateRepository.save(entity);
        return toDto(entity);
    }

    private TemplateDto toDto(Template entity) {
        if (entity == null) return null;
        TemplateDto dto = new TemplateDto();
        dto.setTemplateId(entity.getTemplateId());
        dto.setName(entity.getName());
        dto.setLayoutJson(entity.getLayoutJson() != null ? entity.getLayoutJson().toString() : null);
        dto.setThemeJson(entity.getThemeJson() != null ? entity.getThemeJson().toString() : null);
        dto.setPreviewUrl(entity.getPreviewUrl());
        dto.setIsDeleted(entity.getIsDeleted());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
