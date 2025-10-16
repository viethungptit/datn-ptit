package com.ptit.recruitservice.dto;

import java.util.UUID;

public class JobDto {
    private UUID jobId;
    private UUID companyId;
    private String title;
    private String description;
    private String salaryRange;
    private String location;
    private String city;
    private String jobType;
    private String status;
    private boolean isDeleted;
    private Integer quantity;
    private java.sql.Timestamp deadline;

    // Getters and setters
    public UUID getJobId() { return jobId; }
    public void setJobId(UUID jobId) { this.jobId = jobId; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public java.sql.Timestamp getDeadline() { return deadline; }
    public void setDeadline(java.sql.Timestamp deadline) { this.deadline = deadline; }
}
