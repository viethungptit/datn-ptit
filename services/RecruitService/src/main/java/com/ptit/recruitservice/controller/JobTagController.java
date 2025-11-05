package com.ptit.recruitservice.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.ptit.recruitservice.dto.JobTagDto;
import com.ptit.recruitservice.dto.JobTagMappingDto;
import com.ptit.recruitservice.dto.JobTagMappingCreateRequest;
import com.ptit.recruitservice.dto.JobTagUpsertRequest;
import com.ptit.recruitservice.service.JobTagService;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruit-service/job-tag")
public class JobTagController {
    @Autowired
    private JobTagService jobTagService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public JobTagDto createJobTag(@RequestBody JobTagUpsertRequest dto) {
        return jobTagService.createJobTag(dto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{job_tag_id}")
    public JobTagDto deleteJobTag(@PathVariable("job_tag_id") UUID jobTagId) {
        return jobTagService.deleteJobTag(jobTagId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{job_tag_id}")
    public JobTagDto updateJobTag(@PathVariable("job_tag_id") UUID jobTagId, @RequestBody JobTagUpsertRequest dto) {
        return jobTagService.updateJobTag(jobTagId, dto);
    }

    @GetMapping("/all")
    public List<JobTagDto> getAllJobTags() {
        return jobTagService.getAllJobTags();
    }

    @GetMapping("/mapping")
    public List<JobTagMappingDto> getJobTagsByJob(@RequestParam("job_id") UUID jobId) {
        return jobTagService.getJobTagsByJob(jobId);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PostMapping("/mapping")
    public JobTagMappingDto addJobTagMapping(@RequestBody JobTagMappingCreateRequest dto) {
        return jobTagService.addJobTagMapping(dto);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @DeleteMapping("/mapping/{jt_tag_id}")
    public Object deleteJobTagMapping(@PathVariable("jt_tag_id") UUID jtTagId) {
        return java.util.Collections.singletonMap("message", jobTagService.deleteJobTagMapping(jtTagId));
    }
}
