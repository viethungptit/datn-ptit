package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.dto.JobCreateRequest;
import com.ptit.recruitservice.dto.JobUpdateRequest;
import com.ptit.recruitservice.dto.JobDto;
import com.ptit.recruitservice.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Query;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    @Autowired
    private JobService jobService;

    @PostMapping
    public JobDto createJob(@RequestBody JobCreateRequest request, @RequestParam("userId") UUID userId) {
        return jobService.createJob(request, userId);
    }

    @GetMapping("/{job_id}")
    public JobDto getJob(@PathVariable("job_id") UUID jobId) {
        return jobService.getJob(jobId);
    }

    @PutMapping("/{job_id}")
    public JobDto updateJob(@PathVariable("job_id") UUID jobId, @RequestBody JobUpdateRequest request) {
        return jobService.updateJob(jobId, request);
    }

    @DeleteMapping("/{job_id}")
    public JobDto deleteJob(@PathVariable("job_id") UUID jobId) {
        return jobService.deleteJob(jobId);
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
}

