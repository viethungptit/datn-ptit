package com.ptit.adminservice.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class SystemStatDto {
    private int totalUsers;
    private int totalCandidates;
    private int totalEmployers;
    private int totalJobs;
    private int totalCompany;
    private int totalApply;
    private int activeJobs;
    private float avgMatchScore;
    private Instant collectedAt;
}

