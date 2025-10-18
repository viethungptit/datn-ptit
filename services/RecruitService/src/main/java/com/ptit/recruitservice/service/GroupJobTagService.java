package com.ptit.recruitservice.service;

import com.ptit.recruitservice.dto.GroupJobTagUpsertRequest;
import com.ptit.recruitservice.dto.GroupJobTagDto;
import com.ptit.recruitservice.dto.JobGroupTagMappingDto;
import com.ptit.recruitservice.dto.JobGroupTagMappingCreateRequest;
import com.ptit.recruitservice.entity.GroupJobTag;
import com.ptit.recruitservice.entity.JobGroupTagMapping;
import com.ptit.recruitservice.exception.ResourceNotFoundException;
import com.ptit.recruitservice.exception.BusinessException;
import com.ptit.recruitservice.repository.GroupJobTagRepository;
import com.ptit.recruitservice.repository.JobGroupTagMappingRepository;
import com.ptit.recruitservice.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GroupJobTagService {
    @Autowired
    private GroupJobTagRepository groupJobTagRepository;
    @Autowired
    private JobGroupTagMappingRepository jobGroupTagMappingRepository;
    @Autowired
    private JobRepository jobRepository;

    public GroupJobTagDto createGroupJobTag(GroupJobTagUpsertRequest dto) {
        if (dto.getGroupJobName() == null || dto.getGroupJobName().trim().isEmpty()) {
            throw new BusinessException("Tên ngành nghề không được bỏ trống");
        }
        if (groupJobTagRepository.findByIsDeletedFalse().stream().anyMatch(tag -> tag.getGroupJobName().equalsIgnoreCase(dto.getGroupJobName()))) {
            throw new BusinessException("Tên ngành nghề đã tồn tại: " + dto.getGroupJobName());
        }
        GroupJobTag entity = new GroupJobTag();
        entity.setGroupJobName(dto.getGroupJobName());
        entity.setIsDeleted(false);
        entity = groupJobTagRepository.save(entity);
        return toDto(entity);
    }

    public GroupJobTagDto deleteGroupJobTag(UUID groupTagId) {
        GroupJobTag entity = groupJobTagRepository.findById(groupTagId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tên ngành nghề này: " + groupTagId));
        entity.setIsDeleted(true);
        groupJobTagRepository.save(entity);
        return toDto(entity);
    }

    public GroupJobTagDto updateGroupJobTag(UUID groupTagId, GroupJobTagUpsertRequest dto) {
        GroupJobTag entity = groupJobTagRepository.findById(groupTagId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tên ngành nghề này: " + groupTagId));
        if (dto.getGroupJobName() == null || dto.getGroupJobName().trim().isEmpty()) {
            throw new BusinessException("Tên ngành nghề không được bỏ trống");
        }
        if (groupJobTagRepository.findByIsDeletedFalse().stream().anyMatch(tag -> tag.getGroupJobName().equalsIgnoreCase(dto.getGroupJobName()) && !tag.getGroupTagId().equals(groupTagId))) {
            throw new BusinessException("Tên ngành nghề đã tồn tại: " + dto.getGroupJobName());
        }
        entity.setGroupJobName(dto.getGroupJobName());
        groupJobTagRepository.save(entity);
        return toDto(entity);
    }

    public List<GroupJobTagDto> getAllGroupJobTags() {
        return groupJobTagRepository.findByIsDeletedFalse().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<JobGroupTagMappingDto> getGroupJobTagsByJob(UUID jobId) {
        return jobGroupTagMappingRepository.findByJob_JobId(jobId).stream().map(this::toMappingDto).collect(Collectors.toList());
    }

    public JobGroupTagMappingDto addGroupJobTagMapping(JobGroupTagMappingCreateRequest dto) {
        JobGroupTagMapping mapping = new JobGroupTagMapping();
        mapping.setJob(jobRepository.findById(dto.getJobId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc: " + dto.getJobId())));
        mapping.setGroupJobTag(groupJobTagRepository.findById(dto.getGroupTagId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tên ngành nghề này: " + dto.getGroupTagId())));
        mapping = jobGroupTagMappingRepository.save(mapping);
        return toMappingDto(mapping);
    }

    public String deleteGroupJobTagMapping(UUID jgTagId) {
        jobGroupTagMappingRepository.deleteById(jgTagId);
        return "Xóa mapping thành công";
    }

    private GroupJobTagDto toDto(GroupJobTag entity) {
        if (entity == null) return null;
        GroupJobTagDto dto = new GroupJobTagDto();
        dto.setGroupTagId(entity.getGroupTagId());
        dto.setGroupJobName(entity.getGroupJobName());
        dto.setIsDeleted(entity.getIsDeleted());
        return dto;
    }

    private JobGroupTagMappingDto toMappingDto(JobGroupTagMapping entity) {
        JobGroupTagMappingDto dto = new JobGroupTagMappingDto();
        dto.setJgTagId(entity.getJgTagId());
        dto.setGroupTagId(entity.getGroupJobTag().getGroupTagId());
        dto.setJobId(entity.getJob().getJobId());
        return dto;
    }
}
