package com.ptit.adminservice.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class SystemStatDto {
    private int totalAdmins;
    private int totalCandidates;
    private int totalEmployers;
    private int totalJobs;
    private int totalCompanies;
    private int totalApplies;
    private int activeJobs;
    private float avgMatchScore;
    private Instant collectedAt;
}

