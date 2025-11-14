package com.ptit.recruitservice.dto;
import lombok.Data;
import java.util.UUID;

@Data
public class CompanyResponse {
    private UUID companyId;
    private String companyName;

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public UUID getCompanyId() {
        return companyId;
    }

    public void setCompanyId(UUID companyId) {
        this.companyId = companyId;
    }
}
