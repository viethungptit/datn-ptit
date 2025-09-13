package com.ptit.adminservice.dto;

import lombok.Data;

@Data
public class CreateSystemStatRequest {
    private int totalUsers;
    private int totalCandidates;
    private int totalEmployers;
    private int totalJobs;
    private int totalCompany;
    private int totalApply;
    private int activeJobs;
    private float avgMatchScore;
    private Long collectedAt; // epoch millis, optional
}

