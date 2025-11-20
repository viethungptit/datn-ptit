package com.ptit.recruitservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;
import java.sql.Timestamp;

@Entity
@Table(name = "applications")
public class Application {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "application_id", nullable = false)
    private UUID applicationId;

    @ManyToOne
    @JoinColumn(name = "job_id", referencedColumnName = "job_id")
    private Job job;

    @ManyToOne
    @JoinColumn(name = "cv_id", referencedColumnName = "cv_id")
    private CV cv;

    public enum Status { pending,approved,rejected }
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private Status status;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "applied_at")
    private Timestamp appliedAt;

    public UUID getApplicationId() {
        return applicationId;
    }
    public void setApplicationId(UUID applicationId) {
        this.applicationId = applicationId;
    }
    public Job getJob() {
        return job;
    }
    public void setJob(Job job) {
        this.job = job;
    }
    public CV getCv() {
        return cv;
    }
    public void setCv(CV cv) {
        this.cv = cv;
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
    public Timestamp getAppliedAt() {
        return appliedAt;
    }
    public void setAppliedAt(Timestamp appliedAt) {
        this.appliedAt = appliedAt;
    }
}
