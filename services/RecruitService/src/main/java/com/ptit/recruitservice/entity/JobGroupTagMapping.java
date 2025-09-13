package com.ptit.recruitservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "job_group_tag_mapping")
public class JobGroupTagMapping {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "jg_tag_id", nullable = false)
    private UUID jgTagId;

    @ManyToOne
    @JoinColumn(name = "job_id", referencedColumnName = "job_id")
    private Job job;

    @ManyToOne
    @JoinColumn(name = "group_tag_id", referencedColumnName = "group_tag_id")
    private GroupJobTag groupJobTag;

    public UUID getJgTagId() {
        return jgTagId;
    }
    public void setJgTagId(UUID jgTagId) {
        this.jgTagId = jgTagId;
    }
    public Job getJob() {
        return job;
    }
    public void setJob(Job job) {
        this.job = job;
    }
    public GroupJobTag getGroupJobTag() {
        return groupJobTag;
    }
    public void setGroupJobTag(GroupJobTag groupJobTag) {
        this.groupJobTag = groupJobTag;
    }
}
