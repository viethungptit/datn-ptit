package com.ptit.recruitservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "job_tags")
public class JobTag {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "job_tag_id", nullable = false)
    private UUID jobTagId;

    @Column(name = "job_name", length = 100)
    private String jobName;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    public UUID getJobTagId() {
        return jobTagId;
    }
    public void setJobTagId(UUID jobTagId) {
        this.jobTagId = jobTagId;
    }
    public String getJobName() {
        return jobName;
    }
    public void setJobName(String jobName) {
        this.jobName = jobName;
    }
    public Boolean getIsDeleted() {
        return isDeleted;
    }
    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
}
