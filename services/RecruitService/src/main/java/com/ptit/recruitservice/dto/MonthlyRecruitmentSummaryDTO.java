package com.ptit.recruitservice.dto;

public class MonthlyRecruitmentSummaryDTO {
    private long openJobs;
    private long jobsCreated;
    private long jobsClosed;
    private long totalApplied;
    private long shortlisted;
    private long rejected;
    private long hired;
    private double hireRate;

    public MonthlyRecruitmentSummaryDTO(long openJobs, long jobsCreated, long jobsClosed, long totalApplied, long shortlisted, long rejected, long hired) {
        this.openJobs = openJobs;
        this.jobsCreated = jobsCreated;
        this.jobsClosed = jobsClosed;
        this.totalApplied = totalApplied;
        this.shortlisted = shortlisted;
        this.rejected = rejected;
        this.hired = hired;
        this.hireRate = totalApplied > 0 ? ((double) hired) / totalApplied : 0.0;
    }

    public long getOpenJobs() { return openJobs; }
    public long getJobsCreated() { return jobsCreated; }
    public long getJobsClosed() { return jobsClosed; }
    public long getTotalApplied() { return totalApplied; }
    public long getShortlisted() { return shortlisted; }
    public long getRejected() { return rejected; }
    public long getHired() { return hired; }
    public double getHireRate() { return hireRate; }
}

