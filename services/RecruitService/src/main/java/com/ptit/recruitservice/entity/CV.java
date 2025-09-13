package com.ptit.recruitservice.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "cvs")
public class CV {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "cv_id", nullable = false)
    private UUID cvId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    public enum SourceType { system, upload }
    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 20)
    private SourceType sourceType;

    @ManyToOne
    @JoinColumn(name = "template_id", referencedColumnName = "template_id", nullable = true)
    private Template template;

    @Column(name = "data_json", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private JsonNode dataJson;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "title")
    private String title;

    public enum Status { pending_embbeding, embbeded, failed }
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    private Status status;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "created_at")
    private Timestamp createdAt;

    public UUID getCvId() {
        return cvId;
    }
    public void setCvId(UUID cvId) {
        this.cvId = cvId;
    }
    public UUID getUserId() {
        return userId;
    }
    public void setUserId(UUID userId) {
        this.userId = userId;
    }
    public SourceType getSourceType() {
        return sourceType;
    }
    public void setSourceType(SourceType sourceType) {
        this.sourceType = sourceType;
    }
    public Template getTemplate() {
        return template;
    }
    public void setTemplate(Template template) {
        this.template = template;
    }
    public JsonNode getDataJson() {
        return dataJson;
    }
    public void setDataJson(JsonNode dataJson) {
        this.dataJson = dataJson;
    }
    public String getFileUrl() {
        return fileUrl;
    }
    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
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
