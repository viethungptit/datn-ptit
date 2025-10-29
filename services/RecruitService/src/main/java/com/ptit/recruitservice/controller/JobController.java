package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.dto.JobCreateRequest;
import com.ptit.recruitservice.dto.JobUpdateRequest;
import com.ptit.recruitservice.dto.JobDto;
import com.ptit.recruitservice.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Query;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruit-service/jobs")
public class JobController {
    @Autowired
    private JobService jobService;

    @PreAuthorize("hasRole('EMPLOYER')")
    @PostMapping
    public JobDto createJob(@RequestBody JobCreateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return jobService.createJob(request, UUID.fromString(currentUserId));
    }

    @PreAuthorize("hasAnyRole('CANDIDATE', 'EMPLOYER', 'ADMIN')")
    @GetMapping("/{job_id}")
    public JobDto getJob(@PathVariable("job_id") UUID jobId) {
        return jobService.getJob(jobId);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PutMapping("/{job_id}")
    public JobDto updateJob(@PathVariable("job_id") UUID jobId, @RequestBody JobUpdateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return jobService.updateJob(jobId, request, UUID.fromString(currentUserId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{job_id}")
    public JobDto deleteJob(@PathVariable("job_id") UUID jobId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return jobService.deleteJob(jobId, UUID.fromString(currentUserId));
    }

    @PreAuthorize("hasAnyRole('CANDIDATE', 'EMPLOYER', 'ADMIN')")
    @GetMapping("/all-by-company/{company_id}")
    public List<JobDto> getAllJobsByCompany(@PathVariable("company_id") UUID companyId) {
        return jobService.getAllJobsByCompany(companyId);
    }

    @PreAuthorize("hasAnyRole('CANDIDATE', 'EMPLOYER', 'ADMIN')")
    @GetMapping("/all-by-city/{city}")
    public List<JobDto> getAllJobsByCity(@PathVariable("city") String city) {
        return jobService.getAllJobsByCity(city);
    }

    @PreAuthorize("hasAnyRole('CANDIDATE', 'EMPLOYER', 'ADMIN')")
    @GetMapping("/all")
    public List<JobDto> getAllJobs() {
        return jobService.getAllJobs();
    }

    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @PutMapping("/{job_id}/close")
    public JobDto closeJob(@PathVariable("job_id") UUID jobId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return jobService.closeJob(jobId, UUID.fromString(currentUserId));
    }
}
