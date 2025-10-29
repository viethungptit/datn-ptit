package com.ptit.recruitservice.service;

import com.ptit.recruitservice.config.EventPublisher;
import com.ptit.recruitservice.dto.ActivityEvent;
import com.ptit.recruitservice.dto.CompanyResponse;
import com.ptit.recruitservice.dto.FavoriteJobRequest;
import com.ptit.recruitservice.dto.FavoriteJobResponse;
import com.ptit.recruitservice.entity.FavoriteJob;
import com.ptit.recruitservice.entity.Job;
import com.ptit.recruitservice.exception.ResourceNotFoundException;
import com.ptit.recruitservice.feign.UserServiceFeign;
import com.ptit.recruitservice.repository.FavoriteJobRepository;
import com.ptit.recruitservice.repository.JobRepository;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FavoriteJobService {
    @Autowired
    private FavoriteJobRepository favoriteJobRepository;
    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private UserServiceFeign userServiceFeign;

    @Autowired
    private EventPublisher eventPublisher;

    @Value("${log.exchange}")
    private String logExchange;

    @Value("${log.activity.routing-key}")
    private String logActivityRoutingKey;

    @Value("${internal.secret}")
    private String internalSecret;

    public CompanyResponse getCompanyByCompanyId(UUID companyId) {
        return userServiceFeign.getCompanyByCompanyId(companyId, internalSecret);
    }

    public FavoriteJobResponse addFavorite(FavoriteJobRequest request, UUID currentUserId) {
        Job job = jobRepository.findById(request.getJobId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc này"));
        FavoriteJob favoriteJob = new FavoriteJob();
        favoriteJob.setUserId(currentUserId);
        favoriteJob.setJob(job);
        favoriteJob.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        favoriteJob = favoriteJobRepository.save(favoriteJob);

        // Gửi log sang AdminService
        CompanyResponse company = getCompanyByCompanyId(job.getCompanyId());
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("CANDIDATE")
                        .action("ADD_FAVORITE")
                        .targetType("JOB")
                        .targetId(job.getJobId().toString())
                        .description(String.format("Người dùng %s đã thêm công việc %s tại %s vào danh sách yêu thích",
                                currentUserId, job.getTitle(), company.getCompanyName()))
                        .build()
        );
        return toResponse(favoriteJob);
    }

    public void removeFavorite(UUID favoriteId) {
        favoriteJobRepository.deleteById(favoriteId);
    }

    public List<FavoriteJobResponse> getFavoritesByUser(UUID userId) {
        List<FavoriteJob> favorites = favoriteJobRepository.findByUserId(userId);
        return favorites.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private FavoriteJobResponse toResponse(FavoriteJob favoriteJob) {
        FavoriteJobResponse response = new FavoriteJobResponse();
        response.setFavoriteId(favoriteJob.getFavoriteId());
        response.setUserId(favoriteJob.getUserId());
        response.setJobId(favoriteJob.getJob().getJobId());
        response.setCreatedAt(favoriteJob.getCreatedAt());
        return response;
    }
}

