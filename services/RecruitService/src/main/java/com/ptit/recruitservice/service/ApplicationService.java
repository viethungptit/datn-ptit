package com.ptit.recruitservice.service;

import com.ptit.recruitservice.dto.ApplicationRequest;
import com.ptit.recruitservice.dto.ApplicationStatusUpdateRequest;
import com.ptit.recruitservice.dto.ApplicationResponse;
import com.ptit.recruitservice.entity.Application;
import com.ptit.recruitservice.entity.CV;
import com.ptit.recruitservice.entity.Job;
import com.ptit.recruitservice.exception.BusinessException;
import com.ptit.recruitservice.exception.ResourceNotFoundException;
import com.ptit.recruitservice.repository.ApplicationRepository;
import com.ptit.recruitservice.repository.CVRepository;
import com.ptit.recruitservice.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApplicationService {
    @Autowired
    private ApplicationRepository applicationRepository;
    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private CVRepository cvRepository;

    public ApplicationResponse applyForJob(ApplicationRequest request, UUID userId) {
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        if (job.getStatus() == Job.Status.closed) {
            throw new BusinessException("Job is closed and cannot be applied to");
        }
        CV cv = cvRepository.findById(request.getCvId())
                .orElseThrow(() -> new ResourceNotFoundException("CV not found"));
        if (!cv.getUserId().equals(userId)) {
            throw new BusinessException("CV does not belong to user");
        }
        Application application = new Application();
        application.setJob(job);
        application.setCv(cv);
        application.setStatus(Application.Status.applied);
        application.setIsDeleted(false);
        application.setAppliedAt(new Timestamp(System.currentTimeMillis()));
        application = applicationRepository.save(application);
        // TODO: Publish notification event here
        return toResponse(application);
    }

    public ApplicationResponse updateStatus(UUID applicationId, String status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        application.setStatus(Application.Status.valueOf(status));
        application = applicationRepository.save(application);
        // TODO: Publish notification event here
        return toResponse(application);
    }

    public ApplicationResponse deleteApplication(UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        application.setIsDeleted(true);
        application = applicationRepository.save(application);
        // TODO: Publish notification event here
        return toResponse(application);
    }

    public List<ApplicationResponse> getApplicationsByJobId(UUID jobId) {
        List<Application> applications = applicationRepository.findAll()
                .stream()
                .filter(app -> app.getJob().getJobId().equals(jobId) && !Boolean.TRUE.equals(app.getIsDeleted()))
                .collect(Collectors.toList());
        return applications.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private ApplicationResponse toResponse(Application application) {
        ApplicationResponse response = new ApplicationResponse();
        response.setApplicationId(application.getApplicationId());
        response.setJobId(application.getJob().getJobId());
        response.setCvId(application.getCv().getCvId());
        response.setStatus(application.getStatus().name());
        response.setDeleted(Boolean.TRUE.equals(application.getIsDeleted()));
        response.setAppliedAt(application.getAppliedAt());
        return response;
    }
}
