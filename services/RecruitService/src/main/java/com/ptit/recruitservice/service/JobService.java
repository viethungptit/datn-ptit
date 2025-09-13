package com.ptit.recruitservice.service;

import com.ptit.recruitservice.dto.JobCreateRequest;
import com.ptit.recruitservice.dto.JobUpdateRequest;
import com.ptit.recruitservice.dto.JobDto;
import com.ptit.recruitservice.entity.Job;
import com.ptit.recruitservice.entity.JobTagMapping;
import com.ptit.recruitservice.entity.JobGroupTagMapping;
import com.ptit.recruitservice.repository.JobRepository;
import com.ptit.recruitservice.repository.JobTagMappingRepository;
import com.ptit.recruitservice.repository.JobGroupTagMappingRepository;
import com.ptit.recruitservice.repository.JobTagRepository;
import com.ptit.recruitservice.repository.GroupJobTagRepository;
import com.ptit.recruitservice.exception.ResourceNotFoundException;
import com.ptit.recruitservice.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public JobDto createJob(JobCreateRequest request, UUID userId) {
        //Chưa có Tìm company theo userId

        Job job = new Job();
        job.setCompanyId(request.getCompanyId());
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setSalaryRange(request.getSalaryRange());
        job.setLocation(request.getLocation());
        job.setCity(request.getCity());
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
                        .orElseThrow(() -> new ResourceNotFoundException("JobTag not found: " + tagId)));
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
                        .orElseThrow(() -> new ResourceNotFoundException("GroupJobTag not found: " + groupTagId)));
                    return mapping;
                }).collect(Collectors.toList());
            jobGroupTagMappingRepository.saveAll(groupTagMappings);
        }
        // TODO: Publish event to AI Service
        return toDto(job);
    }

    public JobDto getJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
        return toDto(job);
    }

    @Transactional
    public JobDto updateJob(UUID jobId, JobUpdateRequest request) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
        // Validate jobType
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
                        .orElseThrow(() -> new ResourceNotFoundException("JobTag not found: " + tagId)));
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
                        .orElseThrow(() -> new ResourceNotFoundException("GroupJobTag not found: " + groupTagId)));
                    return mapping;
                }).collect(Collectors.toList());
            jobGroupTagMappingRepository.saveAll(groupTagMappings);
        }
        // TODO: Publish event to AI Service
        return toDto(job);
    }

    public JobDto deleteJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
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

    private JobDto toDto(Job job) {
        JobDto dto = new JobDto();
        dto.setJobId(job.getJobId());
        dto.setCompanyId(job.getCompanyId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setSalaryRange(job.getSalaryRange());
        dto.setLocation(job.getLocation());
        dto.setCity(job.getCity());
        dto.setJobType(job.getJobType().name());
        dto.setStatus(job.getStatus().name());
        dto.setDeleted(Boolean.TRUE.equals(job.getIsDeleted()));
        return dto;
    }
}
