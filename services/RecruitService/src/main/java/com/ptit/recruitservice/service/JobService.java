package com.ptit.recruitservice.service;

import com.ptit.recruitservice.config.EventPublisher;
import com.ptit.recruitservice.dto.*;
import com.ptit.recruitservice.entity.Job;
import com.ptit.recruitservice.entity.JobTagMapping;
import com.ptit.recruitservice.entity.JobGroupTagMapping;
import com.ptit.recruitservice.feign.UserServiceFeign;
import com.ptit.recruitservice.repository.JobRepository;
import com.ptit.recruitservice.repository.JobTagMappingRepository;
import com.ptit.recruitservice.repository.JobGroupTagMappingRepository;
import com.ptit.recruitservice.repository.JobTagRepository;
import com.ptit.recruitservice.repository.GroupJobTagRepository;
import com.ptit.recruitservice.exception.ResourceNotFoundException;
import com.ptit.recruitservice.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JobService {
    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private JobTagMappingRepository jobTagMappingRepository;
    @Autowired
    private JobGroupTagMappingRepository jobGroupTagMappingRepository;
    @Autowired
    private JobTagRepository jobTagRepository;
    @Autowired
    private GroupJobTagRepository groupJobTagRepository;
    @Autowired
    private UserServiceFeign externalUserServiceFeignClient;
    @Autowired
    private EventPublisher eventPublisher;

    @Value("${internal.secret}")
    private String internalSecret;

    @Value("${log.exchange}")
    private String logExchange;

    @Value("${log.activity.routing-key}")
    private String logActivityRoutingKey;

    public CompanyResponse getCompanyByUserId(UUID userId) {
        return externalUserServiceFeignClient.getCompanyByUserId(userId, internalSecret);
    }

    public CompanyResponse getCompanyByCompanyId(UUID companyId) {
        return externalUserServiceFeignClient.getCompanyByCompanyId(companyId, internalSecret);
    }

    @Transactional
    public JobDto createJob(JobCreateRequest request, UUID currentUserId) {
        CompanyResponse company = getCompanyByUserId(currentUserId);
        UUID companyId = company.getCompanyId();
        Job job = new Job();
        job.setCompanyId(companyId);
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setSalaryRange(request.getSalaryRange());
        job.setLocation(request.getLocation());
        job.setCity(request.getCity());
        job.setQuantity(request.getQuantity());
        job.setDeadline(request.getDeadline());
        job.setJobType(Job.JobType.valueOf(request.getJobType().replace("|", "_")));
        job.setStatus(Job.Status.pending);
        job.setIsDeleted(false);
        job = jobRepository.save(job);
        final Job savedJob = job;
        // Bulk map JobTag
        if (request.getJobTagIds() != null && !request.getJobTagIds().isEmpty()) {
            List<JobTagMapping> jobTagMappings = request.getJobTagIds().stream()
                .map(tagId -> {
                    JobTagMapping mapping = new JobTagMapping();
                    mapping.setJob(savedJob);
                    mapping.setJobTag(jobTagRepository.findById(tagId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thẻ công việc này" + tagId)));
                    return mapping;
                }).collect(Collectors.toList());
            jobTagMappingRepository.saveAll(jobTagMappings);
        }
        // Bulk map GroupJobTag
        if (request.getGroupTagIds() != null && !request.getGroupTagIds().isEmpty()) {
            List<JobGroupTagMapping> groupTagMappings = request.getGroupTagIds().stream()
                .map(groupTagId -> {
                    JobGroupTagMapping mapping = new JobGroupTagMapping();
                    mapping.setJob(savedJob);
                    mapping.setGroupJobTag(groupJobTagRepository.findById(groupTagId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tên ngành nghề: " + groupTagId)));
                    return mapping;
                }).collect(Collectors.toList());
            jobGroupTagMappingRepository.saveAll(groupTagMappings);
        }

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("EMPLOYER")
                        .action("CREATE_JOB")
                        .targetType("JOB")
                        .targetId(job.getJobId().toString())
                        .description(String.format("Nhà tuyển dụng %s đã tạo công việc mới %s tại công ty %s",
                                currentUserId, job.getTitle(), company.getCompanyName() ))
                        .build()
        );

        // TODO: Publish event to AI Service
        return toDto(job);
    }

    public JobDto getJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + jobId));
        return toDto(job);
    }

    @Transactional
    public JobDto updateJob(UUID jobId, JobUpdateRequest request, UUID currentUserId) {
        UUID companyId = getCompanyByUserId(currentUserId).getCompanyId();
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + jobId));
        if(!job.getCompanyId().equals(companyId)) {
            throw new AccessDeniedException("You do not have permission to update this job");
        }
        try {
            Job.JobType.valueOf(request.getJobType().replace("|", "_"));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid jobType: " + request.getJobType());
        }
        job.setCompanyId(request.getCompanyId());
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setSalaryRange(request.getSalaryRange());
        job.setLocation(request.getLocation());
        job.setCity(request.getCity());
        job.setQuantity(request.getQuantity());
        job.setDeadline(request.getDeadline());
        job.setJobType(Job.JobType.valueOf(request.getJobType().replace("|", "_")));
        job = jobRepository.save(job);
        final Job savedJob = job;
        // Remove old mappings
        jobTagMappingRepository.deleteByJob_JobId(jobId);
        jobGroupTagMappingRepository.deleteByJob_JobId(jobId);
        // Bulk add new JobTag mappings
        if (request.getJobTagIds() != null && !request.getJobTagIds().isEmpty()) {
            List<JobTagMapping> jobTagMappings = request.getJobTagIds().stream()
                .map(tagId -> {
                    JobTagMapping mapping = new JobTagMapping();
                    mapping.setJob(savedJob);
                    mapping.setJobTag(jobTagRepository.findById(tagId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thẻ công việc này" + tagId)));
                    return mapping;
                }).collect(Collectors.toList());
            jobTagMappingRepository.saveAll(jobTagMappings);
        }
        // Bulk add new GroupJobTag mappings
        if (request.getGroupTagIds() != null && !request.getGroupTagIds().isEmpty()) {
            List<JobGroupTagMapping> groupTagMappings = request.getGroupTagIds().stream()
                .map(groupTagId -> {
                    JobGroupTagMapping mapping = new JobGroupTagMapping();
                    mapping.setJob(savedJob);
                    mapping.setGroupJobTag(groupJobTagRepository.findById(groupTagId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tên ngành nghề: " + groupTagId)));
                    return mapping;
                }).collect(Collectors.toList());
            jobGroupTagMappingRepository.saveAll(groupTagMappings);
        }

        // Gửi log sang AdminService
        CompanyResponse company = getCompanyByUserId(currentUserId);
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("EMPLOYER")
                        .action("UPDATE_JOB")
                        .targetType("JOB")
                        .targetId(job.getJobId().toString())
                        .description(String.format("Nhà tuyển dụng %s đã tạo công việc mới %s tại công ty %s",
                                currentUserId, job.getTitle(), company.getCompanyName()))
                        .build()
        );

        // TODO: Publish event to AI Service
        return toDto(job);
    }

    public JobDto deleteJob(UUID jobId, UUID currentUserId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + jobId));
        job.setIsDeleted(true);
        job = jobRepository.save(job);

        // Gửi log sang AdminService
        CompanyResponse company = getCompanyByUserId(currentUserId);
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("ADMIN")
                        .action("DELETE_JOB")
                        .targetType("JOB")
                        .targetId(job.getJobId().toString())
                        .description(String.format("Nhà tuyển dụng %s đã xóa công việc %s tại công ty %s",
                                currentUserId, job.getTitle(), company.getCompanyName()))
                        .build()
        );
        return toDto(job);
    }

    public List<JobDto> getAllJobs() {
        return jobRepository.findByIsDeletedFalse().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<JobDto> getAllJobsByCompany(UUID companyId) {
        return jobRepository.findByCompanyIdAndIsDeletedFalse(companyId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<JobDto> getAllJobsByCity(String city) {
        return jobRepository.findByCityAndIsDeletedFalse(city).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public JobDto closeJob(UUID jobId, UUID currentUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + jobId));
        CompanyResponse company = getCompanyByCompanyId(job.getCompanyId());
        boolean isEmployer = company != null && job.getCompanyId().equals(company.getCompanyId());
        boolean isAdmin = company == null;
        if (!isEmployer && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền đóng công việc này");
        }
        if (job.getStatus() == Job.Status.closed) {
            throw new BusinessException("Công việc đã được đóng trước đó");
        }
        job.setStatus(Job.Status.closed);
        job = jobRepository.save(job);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("ADMIN")
                        .action("CLOSE_JOB")
                        .targetType("JOB")
                        .targetId(job.getJobId().toString())
                        .description(String.format("Nhà tuyển dụng %s đã đóng công việc %s tại công ty %s",
                                currentUserId, job.getTitle(), company.getCompanyName()))
                        .build()
        );
        return toDto(job);
    }

    @Transactional
    public JobDto approveJob(UUID jobId, UUID currentUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + jobId));
        CompanyResponse company = getCompanyByCompanyId(job.getCompanyId());
        if (job.getStatus() == Job.Status.open) {
            throw new BusinessException("Công việc đã được mở trước đó");
        }
        job.setStatus(Job.Status.open);
        job = jobRepository.save(job);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("ADMIN")
                        .action("APPROVE_JOB")
                        .targetType("JOB")
                        .targetId(jobId.toString())
                        .description(String.format("Quản trị viên %s đã duyệt công việc %s tại công ty %s",
                                currentUserId, job.getTitle(), company.getCompanyName()))
                        .build()
        );
        return toDto(job);
    }

    @Scheduled(cron = "0 0 0 * * *") // Runs daily at 0:00 AM
    @Transactional
    public void closeExpiredJobs() {
        List<Job> expiredJobs = jobRepository.findByStatusAndDeadlineBefore(Job.Status.open, Timestamp.from(Instant.now()));
        for (Job job : expiredJobs) {
            job.setStatus(Job.Status.closed);
            jobRepository.save(job);
        }
    }

    private JobDto toDto(Job job) {
        JobDto dto = new JobDto();
        dto.setJobId(job.getJobId());
        dto.setCompanyId(job.getCompanyId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setSalaryRange(job.getSalaryRange());
        dto.setLocation(job.getLocation());
        dto.setCity(job.getCity());
        dto.setQuantity(job.getQuantity());
        dto.setDeadline(job.getDeadline());
        dto.setJobType(job.getJobType().name());
        dto.setStatus(job.getStatus().name());
        dto.setDeleted(Boolean.TRUE.equals(job.getIsDeleted()));
        return dto;
    }
}
