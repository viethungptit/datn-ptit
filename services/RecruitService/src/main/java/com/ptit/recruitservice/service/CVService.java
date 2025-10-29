package com.ptit.recruitservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ptit.recruitservice.config.EventPublisher;
import com.ptit.recruitservice.dto.*;
import com.ptit.recruitservice.entity.CV;
import com.ptit.recruitservice.entity.Template;
import com.ptit.recruitservice.feign.UserServiceFeign;
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

    @Autowired
    private EventPublisher eventPublisher;

    @Value("${log.exchange}")
    private String logExchange;

    @Value("${log.activity.routing-key}")
    private String logActivityRoutingKey;

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
            System.out.println(e.getMessage());
            throw new RuntimeException("Lỗi tải CV lên MinIO");
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
            System.out.println(e.getMessage());
            throw new RuntimeException("Lỗi xóa CV trên MinIO");
        }
    }

    private JsonNode validateAndConvertJson(String json, String fieldName) {
        if (json == null || json.isEmpty()) return null;
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            throw new BusinessException("Lỗi JSON với trường '" + fieldName + "': " + e.getMessage());
        }
    }

    @Transactional
    public CVDto createCV(CVCreateRequest request, UUID userId) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new BusinessException("Tên CV không được để trống");
        }
        Template template = templateRepository.findById(request.getTemplateId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẫu CV với ID: " + request.getTemplateId()));
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

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(userId.toString())
                        .actorRole("CANDIDATE")
                        .action("CREATE_CV")
                        .targetType("CV")
                        .targetId(cv.getCvId().toString())
                        .description(String.format("Người dùng %s đã tạo CV mới với tên %s", userId, cv.getTitle()))
                        .build()
        );

        // TODO: Publish event to AI Service
        return toDto(cv);
    }

    @Transactional
    public CVDto uploadCV(CVUploadRequest request, UUID userId) {
        MultipartFile file = request.getCv();
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Không tìm thấy file CV để tải lên");
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

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(userId.toString())
                        .actorRole("CANDIDATE")
                        .action("UPLOAD_CV")
                        .targetType("CV")
                        .targetId(cv.getCvId().toString())
                        .description(String.format("Người dùng %s đã tải lên CV mới với tên %s", userId, cv.getTitle()))
                        .build()
        );

        // TODO: Publish event to AI Service
        return toDto(cv);
    }

    public CVDto getCV(UUID cvId, UUID currentUserId, boolean isPrivilegedUser) {
        CV cv = cvRepository.findById(cvId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV: " + cvId));
        if(!isPrivilegedUser && !cv.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException("Bạn không thể xem CV của người khác");
        }
        return toDto(cv);
    }

    @Transactional
    public CVDto updateCV(UUID cvId, CVUpdateRequest request, UUID currentUserId) {
        CV cv = cvRepository.findById(cvId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV: " + cvId));
        if(!currentUserId.equals(cv.getUserId())){
            throw new AccessDeniedException("Bạn không thể chỉnh sửa CV của người khác");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new BusinessException("Tên CV không được để trống");
        }
        Template template = templateRepository.findById(request.getTemplateId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẫu CV " + request.getTemplateId()));
        cv.setTemplate(template);
        cv.setTitle(request.getTitle());
        cv.setDataJson(validateAndConvertJson(request.getDataJson(), "dataJson"));
        cv.setFileUrl(null);
        cv.setSourceType(CV.SourceType.system);
        cv.setStatus(CV.Status.pending_embbeding);
        cv = cvRepository.save(cv);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("CANDIDATE")
                        .action("UPDATE_CV")
                        .targetType("CV")
                        .targetId(cv.getCvId().toString())
                        .description(String.format("Người dùng %s đã cập nhật CV với tên %s", currentUserId, cv.getTitle()))
                        .build()
        );

        // TODO: Publish event to AI Service
        return toDto(cv);
    }

    @Transactional
    public CVDto deleteCV(UUID cvId, UUID currentUserId, boolean isAdmin) {
        CV cv = cvRepository.findById(cvId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV:  " + cvId));
        if(!isAdmin && !cv.getUserId().equals(currentUserId)){
            throw new AccessDeniedException("Bạn không thể xóa CV của người khác");
        }
        if (cv.getFileUrl() != null && !cv.getFileUrl().isEmpty()) {
            deleteCVInMinio(cv.getFileUrl());
        }
        cv.setIsDeleted(true);
        cv = cvRepository.save(cv);

        // Gửi log sang AdminService
        String role = isAdmin ? "ADMIN" : "CANDIDATE";
        String desc = String.format("%s %s đã xóa CV với tên %s",
                isAdmin ? "Quản trị viên" : "Người dùng", currentUserId, cv.getTitle()
        );
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole(role)
                        .action("CREATE_CV")
                        .targetType("CV")
                        .targetId(cv.getCvId().toString())
                        .description(desc)
                        .build()
        );

        // TODO: Publish event to AI Service
        return toDto(cv);
    }

    @Transactional
    public CVExportResponse exportCV(UUID cvId) {
        CV cv = cvRepository.findById(cvId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV:  " + cvId));
        if (cv.getSourceType() != CV.SourceType.system) {
            throw new BusinessException("Chỉ có thể xuất CV được tạo từ hệ thống");
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
            throw new AccessDeniedException("Bạn không thể xem CV của người khác");
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
