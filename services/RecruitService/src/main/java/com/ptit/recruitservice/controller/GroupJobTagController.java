package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.dto.JobTagUpsertRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.ptit.recruitservice.dto.GroupJobTagDto;
import com.ptit.recruitservice.dto.GroupJobTagUpsertRequest;
import com.ptit.recruitservice.dto.JobGroupTagMappingDto;
import com.ptit.recruitservice.dto.JobGroupTagMappingCreateRequest;
import com.ptit.recruitservice.service.GroupJobTagService;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruit-service/group-tag")
public class GroupJobTagController {
    @Autowired
    private GroupJobTagService groupJobTagService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public GroupJobTagDto createGroupJobTag(@RequestBody GroupJobTagUpsertRequest dto) {
        return groupJobTagService.createGroupJobTag(dto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{group_tag_id}")
    public GroupJobTagDto deleteGroupJobTag(@PathVariable("group_tag_id") UUID groupTagId) {
        return groupJobTagService.deleteGroupJobTag(groupTagId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{group_tag_id}")
    public GroupJobTagDto updateGroupJobTag(@PathVariable("group_tag_id") UUID groupTagId, @RequestBody GroupJobTagUpsertRequest dto) {
        return groupJobTagService.updateGroupJobTag(groupTagId, dto);
    }

    @GetMapping("/all")
    public List<GroupJobTagDto> getAllGroupJobTags() {
        return groupJobTagService.getAllGroupJobTags();
    }

    @GetMapping("/mapping")
    public List<JobGroupTagMappingDto> getGroupJobTagsByJob(@RequestParam("job_id") UUID jobId) {
        return groupJobTagService.getGroupJobTagsByJob(jobId);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PostMapping("/mapping")
    public JobGroupTagMappingDto addGroupJobTagMapping(@RequestBody JobGroupTagMappingCreateRequest dto) {
        return groupJobTagService.addGroupJobTagMapping(dto);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @DeleteMapping("/mapping/{jg_tag_id}")
    public Object deleteGroupJobTagMapping(@PathVariable("jg_tag_id") UUID jgTagId) {
        return java.util.Collections.singletonMap("message", groupJobTagService.deleteGroupJobTagMapping(jgTagId));
    }
}
