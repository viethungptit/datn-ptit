package com.ptit.recruitservice.dto;
import com.ptit.recruitservice.entity.Job;

import java.util.List;
import java.util.UUID;

public class JobUpdateRequestForAdmin {
    private UUID companyId;
    private String title;
    private Job.Status status;
    private String description;
    private Integer minSalary;
    private Integer maxSalary;
    private String location;
    private String city;
    private String experience;
    private String jobType;
    private List<UUID> groupTagIds;
    private List<UUID> jobTagIds;
    private Integer quantity;
    private java.sql.Timestamp deadline;

    // Getters and setters

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public UUID getCompanyId() { return companyId; }
    public void setCompanyId(UUID companyId) { this.companyId = companyId; }
    public Job.Status getStatus() {return status;}
    public void setStatus(Job.Status status) {this.status = status;}
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getMinSalary() {
        return minSalary;
    }

    public void setMinSalary(Integer minSalary) {
        this.minSalary = minSalary;
    }

    public Integer getMaxSalary() {
        return maxSalary;
    }

    public void setMaxSalary(Integer maxSalary) {
        this.maxSalary = maxSalary;
    }

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
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public java.sql.Timestamp getDeadline() { return deadline; }
    public void setDeadline(java.sql.Timestamp deadline) { this.deadline = deadline; }
}

