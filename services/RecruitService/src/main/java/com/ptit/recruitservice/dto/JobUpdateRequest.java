package com.ptit.recruitservice.dto;

import java.util.List;
import java.util.UUID;

public class JobUpdateRequest {
    private UUID companyId;
    private String title;
    private String description;
    private String salaryRange;
    private String location;
    private String city;
    private String jobType;
    private List<UUID> groupTagIds;
    private List<UUID> jobTagIds;

    // Getters and setters
    public UUID getCompanyId() { return companyId; }
    public void setCompanyId(UUID companyId) { this.companyId = companyId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }
    public List<UUID> getGroupTagIds() { return groupTagIds; }
    public void setGroupTagIds(List<UUID> groupTagIds) { this.groupTagIds = groupTagIds; }
    public List<UUID> getJobTagIds() { return jobTagIds; }
    public void setJobTagIds(List<UUID> jobTagIds) { this.jobTagIds = jobTagIds; }
}

