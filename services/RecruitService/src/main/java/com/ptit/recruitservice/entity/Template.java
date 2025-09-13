package com.ptit.recruitservice.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;

import java.util.UUID;
import java.sql.Timestamp;

@Entity
@Table(name = "templates")
public class Template {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "template_id", nullable = false)
    private UUID templateId;

    @Column(name = "name")
    private String name;

    @Column(name = "layout_json", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private JsonNode layoutJson;

    @Column(name = "theme_json", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private JsonNode themeJson;

    @Column(name = "preview_url")
    private String previewUrl;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "created_at")
    private Timestamp createdAt;

    public UUID getTemplateId() {
        return templateId;
    }
    public void setTemplateId(UUID templateId) {
        this.templateId = templateId;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public JsonNode getLayoutJson() {
        return layoutJson;
    }

    public void setLayoutJson(JsonNode layoutJson) {
        this.layoutJson = layoutJson;
    }

    public JsonNode getThemeJson() {
        return themeJson;
    }

    public void setThemeJson(JsonNode themeJson) {
        this.themeJson = themeJson;
    }

    public String getPreviewUrl() {
        return previewUrl;
    }
    public void setPreviewUrl(String previewUrl) {
        this.previewUrl = previewUrl;
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
