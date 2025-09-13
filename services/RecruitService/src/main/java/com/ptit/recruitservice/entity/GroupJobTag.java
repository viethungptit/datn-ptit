package com.ptit.recruitservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "group_job_tags")
public class GroupJobTag {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "group_tag_id", nullable = false)
    private UUID groupTagId;

    @Column(name = "group_job_name", length = 100)
    private String groupJobName;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    public UUID getGroupTagId() {
        return groupTagId;
    }
    public void setGroupTagId(UUID groupTagId) {
        this.groupTagId = groupTagId;
    }
    public String getGroupJobName() {
        return groupJobName;
    }
    public void setGroupJobName(String groupJobName) {
        this.groupJobName = groupJobName;
    }
    public Boolean getIsDeleted() {
        return isDeleted;
    }
    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
}
