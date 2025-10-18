package com.ptit.recruitservice.service;

import com.ptit.recruitservice.dto.CompanyResponse;
import com.ptit.recruitservice.dto.JobCreateRequest;
import com.ptit.recruitservice.dto.JobUpdateRequest;
import com.ptit.recruitservice.dto.JobDto;
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

    public CompanyResponse getCompanyByUserId(UUID userId) {
        return externalUserServiceFeignClient.getCompanyByUserId(userId);
    }

    @Transactional
    public JobDto createJob(JobCreateRequest request, UUID currentUserId) {
        UUID companyId = getCompanyByUserId(currentUserId).getCompanyId();
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
        job.setStatus(Job.Status.open);
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
        // TODO: Publish event to AI Service
        return toDto(job);
    }

    public JobDto deleteJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + jobId));
        job.setIsDeleted(true);
        job = jobRepository.save(job);
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
        CompanyResponse company = getCompanyByUserId(currentUserId);
        boolean isEmployer = company != null && job.getCompanyId().equals(company.getCompanyId());
        boolean isAdmin = company == null; // If company is null, treat as admin (adjust if you have a better admin check)
        if (!isEmployer && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền đóng công việc này");
        }
        if (job.getStatus() == Job.Status.closed) {
            throw new BusinessException("Công việc đã được đóng trước đó");
        }
        job.setStatus(Job.Status.closed);
        job = jobRepository.save(job);
        return toDto(job);
    }

    @Scheduled(cron = "0 0 1 * * *") // Runs daily at 1:00 AM
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
