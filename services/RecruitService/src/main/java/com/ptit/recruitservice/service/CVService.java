package com.ptit.recruitservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ptit.recruitservice.config.EventPublisher;
import com.ptit.recruitservice.dto.*;
import com.ptit.recruitservice.entity.CV;
import com.ptit.recruitservice.entity.Job;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    @Value("${minio.url}")
    private String minioUrl;

    @Autowired
    private EventPublisher eventPublisher;

    @Value("${log.exchange}")
    private String logExchange;

    @Value("${log.activity.routing-key}")
    private String logActivityRoutingKey;

    @Value("${embedding.exchange}")
    private String embeddingExchange;

    @Value("${embedding.cv.routing-key}")
    private String embeddingCVRoutingKey;

    @Value("${embedding.delete.cv.routing-key}")
    private String deleteCVRoutingKey;

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

    private String buildRawTextFromDataJson(JsonNode data) {
        StringBuilder rawText = new StringBuilder();

        rawText.append("Position: ").append(data.path("position").asText("")).append("\n");
        rawText.append("Summary: ").append(data.path("summary").asText("")).append("\n");
        rawText.append("Skills: ").append(data.path("skills").asText("")).append("\n");
        rawText.append("Experience: ").append(data.path("experience").asText("")).append("\n");
        rawText.append("Projects: ").append(data.path("projects").asText(""));
        return rawText.toString().trim().replaceAll("\\s+", " ");
    }

    @Transactional
    public CVDto createCV(CVCreateRequest request, UUID userId) {
        JsonNode data = validateAndConvertJson(request.getDataJson(), "dataJson");
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
        cv.setDataJson(data);
        cv.setFileUrl(null);
        cv.setStatusEmbedding(CV.StatusEmbedding.pending);
        cv.setIsDeleted(false);
        cv.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        cv = cvRepository.save(cv);

        // Gửi sang RecommendService để embedding
        String rawText = buildRawTextFromDataJson(data);
        Map<String, Object> event1 = new HashMap<>();
        event1.put("cv_id", cv.getCvId());
        event1.put("raw_text", rawText);
        eventPublisher.publish(embeddingExchange, embeddingCVRoutingKey, event1);

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
        cv.setStatusEmbedding(CV.StatusEmbedding.pending);
        cv.setIsDeleted(false);
        cv.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        cv = cvRepository.save(cv);

        // Gửi sang RecommendService để embedding
        Map<String, Object> event1 = new HashMap<>();
        event1.put("cv_id", cv.getCvId());
        event1.put("file_url", cv.getFileUrl());
        eventPublisher.publish(embeddingExchange, embeddingCVRoutingKey, event1);

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
        JsonNode data = validateAndConvertJson(request.getDataJson(), "dataJson");
        Template template = templateRepository.findById(request.getTemplateId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẫu CV " + request.getTemplateId()));
        cv.setTemplate(template);
        cv.setTitle(request.getTitle());
        cv.setDataJson(data);
        cv.setFileUrl(null);
        cv.setSourceType(CV.SourceType.system);
        cv.setStatusEmbedding(CV.StatusEmbedding.pending);
        cv = cvRepository.save(cv);

        // Gửi sang RecommendService để embedding
        String rawText = buildRawTextFromDataJson(data);
        Map<String, Object> event1 = new HashMap<>();
        event1.put("cv_id", cv.getCvId());
        event1.put("raw_text", rawText);
        eventPublisher.publish(embeddingExchange, embeddingCVRoutingKey, event1);

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
        return toDto(cv);
    }

    @Transactional
    public CVDto updateNameCV(UUID cvId, String name, UUID currentUserId) {
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV: " + cvId));
        if(!currentUserId.equals(cv.getUserId())){
            throw new AccessDeniedException("Bạn không thể chỉnh sửa CV của người khác");
        }
        cv.setTitle(name);
        cv = cvRepository.save(cv);
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

        // Gửi sang RecommendService để xóa embedding
        Map<String, Object> event1 = new HashMap<>();
        event1.put("cv_id", cv.getCvId());
        eventPublisher.publish(embeddingExchange, deleteCVRoutingKey, event1);

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
        return toDto(cv);
    }

    @Transactional
    public CVExportResponse exportCV(UUID cvId) {
        CV cv = cvRepository.findById(cvId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV:  " + cvId));
        if(!cv.getSourceType().equals(CV.SourceType.upload)) {
            throw new BusinessException("Chỉ có thể xuất các CV được tải lên");
        }
        CVExportResponse response = new CVExportResponse();
        String fullURL = minioUrl + "/" + bucketName + "/" + cv.getFileUrl();
        response.setFileUrl(fullURL);
        return response;
    }

    public List<CVDto> getAllCVsMe(UUID currentUserId, String sourceTypeStr) {
        if (sourceTypeStr == null || sourceTypeStr.trim().isEmpty()) {
            return cvRepository.findByUserIdAndIsDeletedFalse(currentUserId)
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }

        CV.SourceType sourceType;
        try {
            sourceType = CV.SourceType.valueOf(sourceTypeStr.trim());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("Invalid sourceType: " + sourceTypeStr);
        }

        return cvRepository.findByUserIdAndIsDeletedFalse(currentUserId)
                .stream()
                .filter(cv -> cv.getSourceType() == sourceType)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<CVDto> getAllCVsByUser(UUID userId) {
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
        dto.setStatusEmbedding(cv.getStatusEmbedding().name());
        dto.setDeleted(Boolean.TRUE.equals(cv.getIsDeleted()));
        dto.setCreatedAt(cv.getCreatedAt());
        return dto;
    }

    @Transactional
    public CVDto retryEmbedding(UUID cvId, UUID currentUserId, boolean isAdmin) {
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV: " + cvId));
        cv.setStatusEmbedding(CV.StatusEmbedding.pending);
        cv = cvRepository.save(cv);

        // Gửi sang RecommendService để embedding lại
        Map<String, Object> event = new HashMap<>();
        if (cv.getSourceType() == CV.SourceType.upload) {
            event.put("cv_id", cv.getCvId());
            event.put("file_url", cv.getFileUrl());
        } else {
            String rawText = buildRawTextFromDataJson(cv.getDataJson());
            event.put("cv_id", cv.getCvId());
            event.put("raw_text", rawText);
        }
        eventPublisher.publish(embeddingExchange, embeddingCVRoutingKey, event);

        // Gửi log sang AdminService
        String description = isAdmin
                ? String.format("Quản trị viên %s đã phân tích lại CV %s",
                currentUserId, cv.getTitle())
                : String.format("Ứng viên %s đã phân tích lại CV %s",
                currentUserId, cv.getTitle());
        
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole(isAdmin ? "ADMIN" : "CANDIDATE")
                        .action("RETRY_EMBEDDING")
                        .targetType("CV")
                        .targetId(cv.getCvId().toString())
                        .description(description)
                        .build()
        );
        return toDto(cv);
    }

    @Transactional
    public CVDto updateStatusEmbedding(UUID cvId, CV.StatusEmbedding status) {
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV: " + cvId));
        if (status == null) {
            throw new BusinessException("status must be provided");
        }
        if (CV.StatusEmbedding.embedded.equals(status)) {
            cv.setStatusEmbedding(CV.StatusEmbedding.embedded);
        } else if (CV.StatusEmbedding.failed.equals(status)) {
            cv.setStatusEmbedding(CV.StatusEmbedding.failed);
        } else {
            throw new BusinessException("Invalid statusEmbedding: " + status + ". Allowed values: embedded, failed");
        }
        cv = cvRepository.save(cv);
        return toDto(cv);
    }
}
