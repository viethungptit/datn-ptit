package com.ptit.userservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ptit.userservice.entity.enums.EmployerStatus;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

public class EmployerUpdateRequest {
    private String position;
    private UUID companyId;
    private EmployerStatus status;

    @JsonProperty("isAdmin")
    private Boolean isAdmin;

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public UUID getCompanyId() { return companyId; }
    public void setCompanyId(UUID companyId) { this.companyId = companyId; }

    public EmployerStatus getStatus() {
        return status;
    }

    public void setStatus(EmployerStatus status) {
        this.status = status;
    }

    @JsonProperty("isAdmin")
    public Boolean getAdmin() {
        return isAdmin;
    }
    @JsonProperty("isAdmin")
    public void setAdmin(Boolean admin) {
        isAdmin = admin;
    }
}
