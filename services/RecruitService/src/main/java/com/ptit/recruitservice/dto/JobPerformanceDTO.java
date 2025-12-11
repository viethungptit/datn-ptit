package com.ptit.recruitservice.dto;

public class JobPerformanceDTO {
    private String jobId;
    private String jobTitle;
    private long applied;
    private long shortlisted;
    private long rejected;
    private long hired;
    private long favorite;
    private double conversionRate;

    public JobPerformanceDTO(String jobId, String jobTitle, long applied, long shortlisted, long rejected, long hired, long favorite) {
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.applied = applied;
        this.shortlisted = shortlisted;
        this.rejected = rejected;
        this.hired = hired;
        this.favorite = favorite;
        this.conversionRate = applied > 0 ? ((double) hired) / applied : 0.0;
    }

    public String getJobId() { return jobId; }
    public String getJobTitle() { return jobTitle; }
    public long getApplied() { return applied; }
    public long getShortlisted() { return shortlisted; }
    public long getRejected() { return rejected; }
    public long getHired() { return hired; }
    public long getFavorite() { return favorite; }
    public double getConversionRate() { return conversionRate; }
}

