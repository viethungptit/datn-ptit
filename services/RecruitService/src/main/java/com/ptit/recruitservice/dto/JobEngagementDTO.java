package com.ptit.recruitservice.dto;

public class JobEngagementDTO {
    private String jobId;
    private String jobTitle;
    private long favorites;
    private long applies;
    private long interestScore;

    public JobEngagementDTO(String jobId, String jobTitle, long favorites, long applies, long interestScore) {
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.favorites = favorites;
        this.applies = applies;
        this.interestScore = interestScore;
    }

    public String getJobId() { return jobId; }
    public String getJobTitle() { return jobTitle; }
    public long getFavorites() { return favorites; }
    public long getApplies() { return applies; }
    public long getInterestScore() { return interestScore; }
}

