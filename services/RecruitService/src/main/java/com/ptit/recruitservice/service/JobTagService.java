package com.ptit.recruitservice.service;

import com.ptit.recruitservice.dto.JobTagDto;
import com.ptit.recruitservice.dto.JobTagMappingDto;
import com.ptit.recruitservice.dto.JobTagMappingCreateRequest;
import com.ptit.recruitservice.dto.JobTagUpsertRequest;
import com.ptit.recruitservice.entity.JobTag;
import com.ptit.recruitservice.entity.JobTagMapping;
import com.ptit.recruitservice.exception.BusinessException;
import com.ptit.recruitservice.exception.ResourceNotFoundException;
import com.ptit.recruitservice.repository.JobTagRepository;
import com.ptit.recruitservice.repository.JobTagMappingRepository;
import com.ptit.recruitservice.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JobTagService {
    @Autowired
    private JobTagRepository jobTagRepository;
    @Autowired
    private JobTagMappingRepository jobTagMappingRepository;
    @Autowired
    private JobRepository jobRepository;

    public JobTagDto createJobTag(JobTagUpsertRequest dto) {
        if (dto.getJobName() == null || dto.getJobName().trim().isEmpty()) {
            throw new BusinessException("Tên thẻ công việc không được bỏ trống");
        }
        if (jobTagRepository.findByIsDeletedFalse().stream().anyMatch(tag -> tag.getJobName().equalsIgnoreCase(dto.getJobName()))) {
            throw new BusinessException("Thẻ công việc đã tồn tại" + dto.getJobName());
        }
        JobTag entity = new JobTag();
        entity.setJobName(dto.getJobName());
        entity.setIsDeleted(false);
        entity = jobTagRepository.save(entity);
        return toDto(entity);
    }

    public JobTagDto deleteJobTag(UUID jobTagId) {
        JobTag entity = jobTagRepository.findById(jobTagId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thẻ công việc: " + jobTagId));
        entity.setIsDeleted(true);
        jobTagRepository.save(entity);
        return toDto(entity);
    }

    public JobTagDto updateJobTag(UUID jobTagId, JobTagUpsertRequest dto) {
        JobTag entity = jobTagRepository.findById(jobTagId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thẻ công việc: " + jobTagId));
        if (dto.getJobName() == null || dto.getJobName().trim().isEmpty()) {
            throw new BusinessException("Tên thẻ công việc không được bỏ trống");
        }
        if (jobTagRepository.findByIsDeletedFalse().stream().anyMatch(tag -> tag.getJobName().equalsIgnoreCase(dto.getJobName()) && !tag.getJobTagId().equals(jobTagId))) {
            throw new BusinessException("Thẻ công việc đã tồn tại" + dto.getJobName());
        }
        entity.setJobName(dto.getJobName());
        jobTagRepository.save(entity);
        return toDto(entity);
    }

    public List<JobTagDto> getAllJobTags() {
        return jobTagRepository.findByIsDeletedFalse().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<JobTagMappingDto> getJobTagsByJob(UUID jobId) {
        return jobTagMappingRepository.findByJob_JobId(jobId).stream().map(this::toMappingDto).collect(Collectors.toList());
    }

    public JobTagMappingDto addJobTagMapping(JobTagMappingCreateRequest dto) {
        JobTagMapping mapping = new JobTagMapping();
        mapping.setJob(jobRepository.findById(dto.getJobId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + dto.getJobId())));
        mapping.setJobTag(jobTagRepository.findById(dto.getJobTagId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thẻ công việc: " + dto.getJobTagId())));
        mapping = jobTagMappingRepository.save(mapping);
        return toMappingDto(mapping);
    }

    public String deleteJobTagMapping(UUID jtTagId) {
        jobTagMappingRepository.deleteById(jtTagId);
        return "Xóa ánh xạ thẻ công việc thành công";
    }

    private JobTagDto toDto(JobTag entity) {
        if (entity == null) return null;
        JobTagDto dto = new JobTagDto();
        dto.setJobTagId(entity.getJobTagId());
        dto.setJobName(entity.getJobName());
        dto.setIsDeleted(entity.getIsDeleted());
        return dto;
    }

    private JobTagMappingDto toMappingDto(JobTagMapping entity) {
        JobTagMappingDto dto = new JobTagMappingDto();
        dto.setJtTagId(entity.getJtTagId());
        dto.setJobTagId(entity.getJobTag().getJobTagId());
        dto.setJobId(entity.getJob().getJobId());
        return dto;
    }
}
