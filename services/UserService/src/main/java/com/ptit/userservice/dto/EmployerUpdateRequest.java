package com.ptit.userservice.dto;

import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

public class EmployerUpdateRequest {
    private String position;
    private UUID companyId;

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public UUID getCompanyId() { return companyId; }
    public void setCompanyId(UUID companyId) { this.companyId = companyId; }
}
