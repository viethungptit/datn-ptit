package com.ptit.recruitservice.service;

import com.ptit.recruitservice.config.EventPublisher;
import com.ptit.recruitservice.dto.*;
import com.ptit.recruitservice.entity.Application;
import com.ptit.recruitservice.entity.CV;
import com.ptit.recruitservice.entity.Job;
import com.ptit.recruitservice.exception.BusinessException;
import com.ptit.recruitservice.exception.ResourceNotFoundException;
import com.ptit.recruitservice.feign.UserServiceFeign;
import com.ptit.recruitservice.repository.ApplicationRepository;
import com.ptit.recruitservice.repository.CVRepository;
import com.ptit.recruitservice.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ApplicationService {
    @Autowired
    private ApplicationRepository applicationRepository;
    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private CVRepository cvRepository;
    @Autowired
    private UserServiceFeign userServiceFeign;

    @Value("${internal.secret}")
    private String internalSecret;

    public UserResponse getUserByUserId(UUID userId) {
        return userServiceFeign.getUserByUserId(userId, internalSecret);
    }

    public CompanyResponse getCompanyByCompanyId(UUID companyId) {
        return userServiceFeign.getCompanyByCompanyId(companyId, internalSecret);
    }

    @Autowired
    private EventPublisher eventPublisher;

    @Value("${log.exchange}")
    private String logExchange;

    @Value("${log.activity.routing-key}")
    private String logActivityRoutingKey;

    @Value("${notification.exchange}")
    private String notificationExchange;

    @Value("${notification.application.status.routing-key}")
    private String notificationApplicationStatusRoutingKey;

    @Value("${notification.application.created.routing-key}")
    private String notificationApplicationCreatedRoutingKey;

    @Value("${embedding.exchange}")
    private String embeddingExchange;

    @Value("${embedding.application.routing-key}")
    private String embeddingApplicationRoutingKey;

    @Value("${embedding.application.delete.routing-key}")
    private String embeddingApplicationDeleteRoutingKey;

    @Value("${embedding.application.status.routing-key}")
    private String embeddingApplicationStatusRoutingKey;

    private String getVietnameseStatusLog(Application.Status status) {
        return switch (status) {
            case pending -> "đang nộp";
            case approved -> "chấp nhận";
            case rejected -> "từ chối";
        };
    }

    private String getVietnameseStatusEmail(Application.Status status) {
        return switch (status) {
            case pending -> "đang nộp";
            case approved -> "chấp nhận";
            case rejected -> "từ chối";
        };
    }

    public ApplicationResponse applyForJob(ApplicationRequest request, UUID userId) {
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc này"));
        if (job.getStatus() == Job.Status.closed) {
            throw new BusinessException("Công việc này đã đóng, không thể ứng tuyển");
        }
        CV cv = cvRepository.findById(request.getCvId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV này"));
        if (!cv.getUserId().equals(userId)) {
            throw new BusinessException("Bạn không thể sử dụng CV của người khác để ứng tuyển");
        }
        Application application = new Application();
        application.setJob(job);
        application.setCv(cv);
        application.setStatus(Application.Status.pending);
        application.setIsDeleted(false);
        application.setAppliedAt(new Timestamp(System.currentTimeMillis()));
        application = applicationRepository.save(application);

        // Đồng bộ DB với RecommendService
        Map<String, Object> event1 = new HashMap<>();
        event1.put("application_id", application.getApplicationId());
        event1.put("job_id", job.getJobId());
        event1.put("cv_id", cv.getCvId());
        event1.put("apply_status", application.getStatus().name());
        eventPublisher.publish(embeddingExchange, embeddingApplicationRoutingKey, event1);

        // Gửi notification sang NotificationService
        UserResponse user = getUserByUserId(userId);
        CompanyResponse company = getCompanyByCompanyId(job.getCompanyId());
        Map<String, Object> data = new HashMap<>();
        data.put("name", user.getFullName());
        data.put("email", user.getEmail());
        data.put("job_title", job.getTitle());
        data.put("company_name", company.getCompanyName());

        Map<String, Object> event2 = new HashMap<>();
        event2.put("event_type", notificationApplicationCreatedRoutingKey);
        event2.put("to", user.getEmail());
        event2.put("data", data);
        eventPublisher.publish(notificationExchange, notificationApplicationCreatedRoutingKey, event2);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(userId.toString())
                        .actorRole("CANDIDATE")
                        .action("APPLY_JOB")
                        .targetType("JOB")
                        .targetId(job.getJobId().toString())
                        .description(String.format("Người dùng %s đã ứng tuyển vào công việc %s tại công ty %s", userId, job.getTitle(), company.getCompanyName()))
                        .build()
        );
        return toResponse(application);
    }

    public ApplicationResponse updateStatus(UUID applicationId, Application.Status status, UUID userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển"));
        application.setStatus(status);
        application = applicationRepository.save(application);

        // Đồng bộ DB với RecommendService
        Map<String, Object> event1 = new HashMap<>();
        event1.put("application_id", application.getApplicationId());
        event1.put("apply_status", application.getStatus().name());
        eventPublisher.publish(embeddingExchange, embeddingApplicationStatusRoutingKey, event1);

        // Gửi notification sang NotificationService
        UserResponse user = getUserByUserId(application.getCv().getUserId());
        CompanyResponse company = getCompanyByCompanyId(application.getJob().getCompanyId());
        Map<String, Object> data = new HashMap<>();
        data.put("name", user.getFullName());
        data.put("email", user.getEmail());
        data.put("job_title", application.getJob().getTitle());
        data.put("company_name", company.getCompanyName());
        data.put("status", getVietnameseStatusEmail(status));

        Map<String, Object> event = new HashMap<>();
        event.put("event_type", notificationApplicationStatusRoutingKey);
        event.put("to", user.getEmail());
        event.put("data", data);
        eventPublisher.publish(notificationExchange, notificationApplicationStatusRoutingKey, event);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(userId.toString())
                        .actorRole("EMPLOYER")
                        .action("CHANGE_STATUS_APPLICATION")
                        .targetType("APPLICATION")
                        .targetId(applicationId.toString())
                        .description(String.format("Nhà tuyển dụng %s đã %s CV ứng tuyển công việc %s tại công ty %s của người dùng %s",
                                userId, getVietnameseStatusLog(status), application.getJob().getTitle(), company.getCompanyName(), application.getCv().getUserId()))
                        .build()
        );

        return toResponse(application);
    }

    public ApplicationResponse deleteApplication(UUID applicationId, UUID currentUserId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn ứng tuyển"));
        application.setIsDeleted(true);
        application = applicationRepository.save(application);

        // Đồng bộ DB với RecommendService
        Map<String, Object> event = new HashMap<>();
        event.put("application_id", application.getApplicationId());
        eventPublisher.publish(embeddingExchange, embeddingApplicationDeleteRoutingKey, event);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("ADMIN")
                        .action("DELETE_APPLICATION")
                        .targetType("APPLICATION")
                        .targetId(applicationId.toString())
                        .description(String.format("Quản trị viên %s đã xóa CV %s", currentUserId, applicationId))
                        .build()
        );
        return toResponse(application);
    }

    public List<ApplicationResponse> getApplicationsByJobId(UUID jobId) {

        // Lấy toàn bộ application theo job, không deleted
        List<Application> applications = applicationRepository
                .findAll()
                .stream()
                .filter(app -> app.getJob().getJobId().equals(jobId)
                        && !Boolean.TRUE.equals(app.getIsDeleted()))
                .collect(Collectors.toList());

        List<ApplicationResponse> responses = new ArrayList<>();

        for (Application app : applications) {

            // Build CVDto
            CVDto cvDto = new CVDto();
            cvDto.setCvId(app.getCv().getCvId());
            cvDto.setUserId(app.getCv().getUserId());
            cvDto.setSourceType(app.getCv().getSourceType() != null ? app.getCv().getSourceType().name() : null);
            cvDto.setTemplateId(app.getCv().getTemplate() != null ? app.getCv().getTemplate().getTemplateId() : null);
            cvDto.setDataJson(app.getCv().getDataJson());
            cvDto.setFileUrl(app.getCv().getFileUrl());
            cvDto.setTitle(app.getCv().getTitle());
            cvDto.setStatusEmbedding(app.getCv().getStatusEmbedding() != null ? app.getCv().getStatusEmbedding().name() : null);
            cvDto.setDeleted(app.getCv().getIsDeleted());
            cvDto.setCreatedAt(app.getCv().getCreatedAt());

            // Build ApplicationResponse
            ApplicationResponse resp = new ApplicationResponse();
            resp.setApplicationId(app.getApplicationId());
            resp.setJobId(app.getJob().getJobId());
            resp.setCvId(app.getCv().getCvId());
            resp.setStatus(app.getStatus().name());
            resp.setDeleted(app.getIsDeleted());
            resp.setAppliedAt(app.getAppliedAt());
            resp.setCv(cvDto);

            responses.add(resp);
        }

        return responses;
    }

    public List<ApplicationResponse> getApplicationsByJobIdForCandidate(UUID jobId, UUID currentUserId) {
        List<Application> applications = applicationRepository
                .findByJob_JobIdAndCv_UserIdAndIsDeletedFalse(jobId, currentUserId);

        List<ApplicationResponse> responses = new ArrayList<>();

        for (Application app : applications) {

            CVDto cvDto = new CVDto();
            cvDto.setCvId(app.getCv().getCvId());
            cvDto.setUserId(app.getCv().getUserId());
            cvDto.setSourceType(app.getCv().getSourceType() != null ? app.getCv().getSourceType().name() : null);
            cvDto.setTemplateId(app.getCv().getTemplate() != null ? app.getCv().getTemplate().getTemplateId() : null);
            cvDto.setDataJson(app.getCv().getDataJson());
            cvDto.setFileUrl(app.getCv().getFileUrl());
            cvDto.setTitle(app.getCv().getTitle());
            cvDto.setStatusEmbedding(app.getCv().getStatusEmbedding() != null ? app.getCv().getStatusEmbedding().name() : null);
            cvDto.setDeleted(app.getCv().getIsDeleted());
            cvDto.setCreatedAt(app.getCv().getCreatedAt());

            // Tạo ApplicationResponse
            ApplicationResponse resp = new ApplicationResponse();
            resp.setApplicationId(app.getApplicationId());
            resp.setJobId(app.getJob().getJobId());
            resp.setCvId(app.getCv().getCvId());
            resp.setStatus(app.getStatus().name());
            resp.setDeleted(app.getIsDeleted());
            resp.setAppliedAt(app.getAppliedAt());
            resp.setCv(cvDto); // nếu ApplicationResponse có field CVDto

            responses.add(resp);
        }

        return responses;
    }

    public List<ApplicationResponse> getApplicationsForCandidate(UUID currentUserId) {
        List<Application> applications = applicationRepository
                .findByCv_UserIdAndIsDeletedFalse(currentUserId);

        List<ApplicationResponse> responses = new ArrayList<>();

        for (Application app : applications) {

            CVDto cvDto = new CVDto();
            cvDto.setCvId(app.getCv().getCvId());
            cvDto.setUserId(app.getCv().getUserId());
            cvDto.setSourceType(app.getCv().getSourceType() != null ? app.getCv().getSourceType().name() : null);
            cvDto.setTemplateId(app.getCv().getTemplate() != null ? app.getCv().getTemplate().getTemplateId() : null);
            cvDto.setDataJson(app.getCv().getDataJson());
            cvDto.setFileUrl(app.getCv().getFileUrl());
            cvDto.setTitle(app.getCv().getTitle());
            cvDto.setStatusEmbedding(app.getCv().getStatusEmbedding() != null ? app.getCv().getStatusEmbedding().name() : null);
            cvDto.setDeleted(app.getCv().getIsDeleted());
            cvDto.setCreatedAt(app.getCv().getCreatedAt());

            JobDto jobDto = new JobDto();
            jobDto.setJobId(app.getJob().getJobId());
            jobDto.setCompanyId(app.getJob().getCompanyId());
            jobDto.setTitle(app.getJob().getTitle());
            jobDto.setDescription(app.getJob().getDescription());
            jobDto.setMinSalary(app.getJob().getMinSalary());
            jobDto.setMaxSalary(app.getJob().getMaxSalary());
            jobDto.setLocation(app.getJob().getLocation());
            jobDto.setCity(app.getJob().getCity());
            jobDto.setQuantity(app.getJob().getQuantity());
            jobDto.setExperience(app.getJob().getExperience());
            jobDto.setDeadline(app.getJob().getDeadline());
            jobDto.setJobType(app.getJob().getJobType().name());
            jobDto.setStatus(app.getJob().getStatus().name());
            jobDto.setStatusEmbedding(app.getJob().getStatusEmbedding().name());
            jobDto.setDeleted(Boolean.TRUE.equals(app.getJob().getIsDeleted()));
            jobDto.setCreatedAt(app.getJob().getCreatedAt());
            jobDto.setCreatedBy(app.getJob().getCreatedBy());
            jobDto.setUpdatedBy(app.getJob().getUpdatedBy());

            CompanyResponse company = getCompanyByCompanyId(app.getJob().getCompanyId());

            // Tạo ApplicationResponse
            ApplicationResponse resp = new ApplicationResponse();
            resp.setApplicationId(app.getApplicationId());
            resp.setJobId(app.getJob().getJobId());
            resp.setCvId(app.getCv().getCvId());
            resp.setStatus(app.getStatus().name());
            resp.setDeleted(app.getIsDeleted());
            resp.setAppliedAt(app.getAppliedAt());
            resp.setCv(cvDto);
            resp.setJob(jobDto);
            resp.setCompany(company);

            responses.add(resp);
        }

        return responses;
    }

    private ApplicationResponse toResponse(Application application) {
        ApplicationResponse response = new ApplicationResponse();
        response.setApplicationId(application.getApplicationId());
        response.setJobId(application.getJob().getJobId());
        response.setCvId(application.getCv().getCvId());
        response.setStatus(application.getStatus().name());
        response.setDeleted(Boolean.TRUE.equals(application.getIsDeleted()));
        response.setAppliedAt(application.getAppliedAt());
        return response;
    }
}
