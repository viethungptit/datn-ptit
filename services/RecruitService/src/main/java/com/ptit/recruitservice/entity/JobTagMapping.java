package com.ptit.recruitservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "job_tag_mapping")
public class JobTagMapping {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "jt_tag_id", nullable = false)
    private UUID jtTagId;

    @ManyToOne
    @JoinColumn(name = "job_id", referencedColumnName = "job_id")
    private Job job;

    @ManyToOne
    @JoinColumn(name = "job_tag_id", referencedColumnName = "job_tag_id")
    private JobTag jobTag;

    public UUID getJtTagId() {
        return jtTagId;
    }
    public void setJtTagId(UUID jtTagId) {
        this.jtTagId = jtTagId;
    }
    public Job getJob() {
        return job;
    }
    public void setJob(Job job) {
        this.job = job;
    }
    public JobTag getJobTag() {
        return jobTag;
    }
    public void setJobTag(JobTag jobTag) {
        this.jobTag = jobTag;
    }
}
