package com.ptit.recruitservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ptit.recruitservice.dto.*;
import com.ptit.recruitservice.entity.CV;
import com.ptit.recruitservice.entity.Template;
import com.ptit.recruitservice.repository.CVRepository;
import com.ptit.recruitservice.repository.TemplateRepository;
import com.ptit.recruitservice.exception.ResourceNotFoundException;
import com.ptit.recruitservice.exception.BusinessException;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CVService {
    @Autowired
    private CVRepository cvRepository;
    @Autowired
    private TemplateRepository templateRepository;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MinioClient minioClient;
    @Value("${minio.bucket}")
    private String bucketName;


    private String uploadCV(MultipartFile cvFile) {
        if (cvFile == null || cvFile.isEmpty()) return null;
        try (InputStream is = cvFile.getInputStream()) {
            String objectName = "cv/" + "cv-" + UUID.randomUUID() + "-" + cvFile.getOriginalFilename();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(is, cvFile.getSize(), -1)
                            .contentType(cvFile.getContentType())
                            .build()
            );
            return objectName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload cvFile to MinIO: " + e.getMessage());
        }
    }

    private void deleteCVInMinio(String objectKey) {
        if (objectKey == null || objectKey.isEmpty()) return;
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete cvFile in MinIO: " + e.getMessage());
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

    @Transactional
    public CVDto createCV(CVCreateRequest request, UUID userId) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new BusinessException("CV title must not be empty");
        }
        Template template = templateRepository.findById(request.getTemplateId())
            .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + request.getTemplateId()));
        CV cv = new CV();
        cv.setUserId(userId);
        cv.setSourceType(CV.SourceType.system);
        cv.setTemplate(template);
        cv.setTitle(request.getTitle());
        cv.setDataJson(validateAndConvertJson(request.getDataJson(), "dataJson"));
        cv.setFileUrl(null);
        cv.setStatus(CV.Status.pending_embbeding);
        cv.setIsDeleted(false);
        cv.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        cv = cvRepository.save(cv);
        // TODO: Publish event to AI Service
        return toDto(cv);
    }

    @Transactional
    public CVDto uploadCV(CVUploadRequest request, UUID userId) {
        MultipartFile file = request.getCv();
        if (file == null || file.isEmpty()) {
            throw new BusinessException("CV file must not be empty");
        }
        String objectName = uploadCV(file); // Use MinIO upload helper
        CV cv = new CV();
        cv.setUserId(userId);
        cv.setSourceType(CV.SourceType.upload);
        cv.setTemplate(null);
        cv.setTitle(file.getOriginalFilename());
        cv.setDataJson(null);
        cv.setFileUrl(objectName); // Store MinIO object name
        cv.setStatus(CV.Status.pending_embbeding);
        cv.setIsDeleted(false);
        cv.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        cv = cvRepository.save(cv);
        // TODO: Publish event to AI Service
        return toDto(cv);
    }

    public CVDto getCV(UUID cvId, UUID currentUserId, boolean isPrivilegedUser) {
        CV cv = cvRepository.findById(cvId)
            .orElseThrow(() -> new ResourceNotFoundException("CV not found: " + cvId));
        if(!isPrivilegedUser && !cv.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException("You can't view other people's CV");
        }
        return toDto(cv);
    }

    @Transactional
    public CVDto updateCV(UUID cvId, CVUpdateRequest request, UUID currentUserId) {
        CV cv = cvRepository.findById(cvId)
            .orElseThrow(() -> new ResourceNotFoundException("CV not found: " + cvId));
        if(!currentUserId.equals(cv.getUserId())){
            throw new AccessDeniedException("You can't update other people's CV");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new BusinessException("CV title must not be empty");
        }
        Template template = templateRepository.findById(request.getTemplateId())
            .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + request.getTemplateId()));
        cv.setTemplate(template);
        cv.setTitle(request.getTitle());
        cv.setDataJson(validateAndConvertJson(request.getDataJson(), "dataJson"));
        cv.setFileUrl(null);
        cv.setSourceType(CV.SourceType.system);
        cv.setStatus(CV.Status.pending_embbeding);
        cv = cvRepository.save(cv);
        // TODO: Publish event to AI Service
        return toDto(cv);
    }

    @Transactional
    public CVDto deleteCV(UUID cvId, UUID currentUserId, boolean isAdmin) {
        CV cv = cvRepository.findById(cvId)
            .orElseThrow(() -> new ResourceNotFoundException("CV not found: " + cvId));
        if(!isAdmin && !cv.getUserId().equals(currentUserId)){
            throw new AccessDeniedException("You can't delete other people's CV");
        }
        if (cv.getFileUrl() != null && !cv.getFileUrl().isEmpty()) {
            deleteCVInMinio(cv.getFileUrl()); // Remove file from MinIO if exists
        }
        cv.setIsDeleted(true);
        cv = cvRepository.save(cv);
        // TODO: Publish event to AI Service
        return toDto(cv);
    }

    @Transactional
    public CVExportResponse exportCV(UUID cvId) {
        CV cv = cvRepository.findById(cvId)
            .orElseThrow(() -> new ResourceNotFoundException("CV not found: " + cvId));
        if (cv.getSourceType() != CV.SourceType.system) {
            throw new BusinessException("Only system CVs can be exported to PDF");
        }
        // TODO: Render PDF from dataJson using iText
        // InputStream pdfStream = ...; // Rendered PDF stream
        // MultipartFile pdfFile = ...; // Convert to MultipartFile if needed
        // String objectName = uploadCV(pdfFile); // Upload PDF to MinIO
        // cv.setFileUrl(objectName);
        // For now, keep placeholder
        String fileUrl = "minio-url/exported-" + cv.getCvId() + ".pdf"; // Placeholder
        cv.setFileUrl(fileUrl);
        cv = cvRepository.save(cv);
        CVExportResponse response = new CVExportResponse();
        response.setFileUrl(fileUrl);
        return response;
    }

    public List<CVDto> getAllCVsByUser(UUID userId, UUID currentUserId, boolean isAdmin) {
        if(!isAdmin && !userId.equals(currentUserId)){
            throw new AccessDeniedException("You can't view other people's CV");
        }
        return cvRepository.findByUserIdAndIsDeletedFalse(userId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<CVDto> getAllCVs() {
        return cvRepository.findByIsDeletedFalse().stream().map(this::toDto).collect(Collectors.toList());
    }

    private CVDto toDto(CV cv) {
        CVDto dto = new CVDto();
        dto.setCvId(cv.getCvId());
        dto.setUserId(cv.getUserId());
        dto.setSourceType(cv.getSourceType().name());
        dto.setTemplateId(cv.getTemplate() != null ? cv.getTemplate().getTemplateId() : null);
        dto.setDataJson(cv.getDataJson() != null ? cv.getDataJson() : null);
        dto.setFileUrl(cv.getFileUrl());
        dto.setTitle(cv.getTitle());
        dto.setStatus(cv.getStatus().name());
        dto.setDeleted(Boolean.TRUE.equals(cv.getIsDeleted()));
        dto.setCreatedAt(cv.getCreatedAt());
        return dto;
    }
}
