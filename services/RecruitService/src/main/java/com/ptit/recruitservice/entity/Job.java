package com.ptit.recruitservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;
import java.sql.Timestamp;

@Entity
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "deadline")
    private Timestamp deadline;

    @Column(name = "salary_range", length = 100)
    private String salaryRange;

    @Column(name = "location", columnDefinition = "TEXT")
    private String location;

    @Column(name = "city", columnDefinition = "TEXT")
    private String city;

    public enum JobType { full_time, part_time, internship, freelance }
    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", length = 20)
    private JobType jobType;

    public enum Status { open, closed }
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private Status status;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "created_at")
    private Timestamp createdAt;

    public UUID getJobId() {
        return jobId;
    }
    public void setJobId(UUID jobId) {
        this.jobId = jobId;
    }
    public UUID getCompanyId() {
        return companyId;
    }
    public void setCompanyId(UUID companyId) {
        this.companyId = companyId;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public Integer getQuantity() {return quantity;}
    public void setQuantity(Integer quantity) {this.quantity = quantity;}
    public Timestamp getDeadline() {return deadline;}
    public void setDeadline(Timestamp deadline) {this.deadline = deadline;}
    public String getSalaryRange() {
        return salaryRange;
    }
    public void setSalaryRange(String salaryRange) {
        this.salaryRange = salaryRange;
    }
    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }
    public String getCity() {
        return city;
    }
    public void setCity(String city) {
        this.city = city;
    }
    public JobType getJobType() {
        return jobType;
    }
    public void setJobType(JobType jobType) {
        this.jobType = jobType;
    }
    public Status getStatus() {
        return status;
    }
    public void setStatus(Status status) {
        this.status = status;
    }
    public Boolean getIsDeleted() {
        return isDeleted;
    }
    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
    public Timestamp getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
