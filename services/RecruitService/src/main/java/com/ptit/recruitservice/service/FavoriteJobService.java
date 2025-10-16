package com.ptit.recruitservice.service;

import com.ptit.recruitservice.dto.FavoriteJobRequest;
import com.ptit.recruitservice.dto.FavoriteJobResponse;
import com.ptit.recruitservice.entity.FavoriteJob;
import com.ptit.recruitservice.entity.Job;
import com.ptit.recruitservice.exception.ResourceNotFoundException;
import com.ptit.recruitservice.repository.FavoriteJobRepository;
import com.ptit.recruitservice.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    public FavoriteJobResponse addFavorite(FavoriteJobRequest request, UUID currentUserId) {
        Job job = jobRepository.findById(request.getJobId()).orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        FavoriteJob favoriteJob = new FavoriteJob();
        favoriteJob.setUserId(currentUserId);
        favoriteJob.setJob(job);
        favoriteJob.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        favoriteJob = favoriteJobRepository.save(favoriteJob);
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

