package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.dto.*;
import com.ptit.recruitservice.entity.Job;
import com.ptit.recruitservice.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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

    @Value("${internal.secret}")
    private String internalSecret;

    @PreAuthorize("hasRole('EMPLOYER')")
    @PostMapping
    public JobDto createJob(@RequestBody JobCreateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return jobService.createJob(request, UUID.fromString(currentUserId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYER')")
    @PostMapping("/admin")
    public JobDto createJobForAdmin(@RequestBody JobCreateRequestForAdmin request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return jobService.createJobForAdmin(request, UUID.fromString(currentUserId));
    }

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

    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYER')")
    @PutMapping("/admin/{job_id}")
    public JobDto updateJobForAdmin(@PathVariable("job_id") UUID jobId, @RequestBody JobUpdateRequestForAdmin request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return jobService.updateJobForAdmin(jobId, request, UUID.fromString(currentUserId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{job_id}")
    public JobDto deleteJob(@PathVariable("job_id") UUID jobId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return jobService.deleteJob(jobId, UUID.fromString(currentUserId), isAdmin);
    }

    @GetMapping("/all-by-company/{company_id}")
    public List<JobDto> getAllJobsByCompany(@PathVariable("company_id") UUID companyId) {
        return jobService.getAllJobsByCompany(companyId);
    }

    @GetMapping("/all-by-city/{city}")
    public List<JobDto> getAllJobsByCity(@PathVariable("city") String city) {
        return jobService.getAllJobsByCity(city);
    }

    @GetMapping("/all")
    public List<JobDto> getAllJobs() {
        return jobService.getAllJobs();
    }

    @GetMapping("/all/paged")
    public ResponseEntity<Page<JobDto>> getJobsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<JobDto> jobs = jobService.getJobsPaged(page, size);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/filter")
    public List<JobDto> filterJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) List<String> industry,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minSalary,
            @RequestParam(required = false) Integer maxSalary,
            @RequestParam(required = false) String experience
    ) {
        return jobService.filterJobs(keyword, location, industry, tags, type, minSalary, maxSalary,experience);
    }
    @GetMapping("/filter/paged")
    public PaginatedResponse<JobDto> filterJobsPaged(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) List<String> industry,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minSalary,
            @RequestParam(required = false) Integer maxSalary,
            @RequestParam(required = false) String experience,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return jobService.filterJobsPaged(
                keyword, location, industry, tags, type,
                minSalary, maxSalary, experience,
                page, size
        );
    }

    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @PutMapping("/{job_id}/change-status/{status}")
    public JobDto changeJobStatus(@PathVariable("job_id") UUID jobId,
                                  @PathVariable("status") Job.Status status) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return jobService.changeJobStatus(jobId, UUID.fromString(currentUserId), status);
    }

    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @PostMapping("/{job_id}/retry-embedding")
    public JobDto retryEmbedding(@PathVariable("job_id") UUID jobId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return jobService.retryEmbedding(jobId, UUID.fromString(currentUserId), isAdmin);
    }

    @PutMapping("/{job_id}/status-embedding")
    public JobDto updateStatusEmbedding(@PathVariable("job_id") UUID jobId,
                                        @RequestParam("status") Job.StatusEmbedding status,
                                        @RequestHeader("X-Internal-Secret") String secret) {
        if (!internalSecret.equals(secret)) {
            throw new AccessDeniedException("Access denied: invalid internal secret");
        }
        return jobService.updateStatusEmbedding(jobId, status);
    }
}
