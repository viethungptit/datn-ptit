package com.ptit.recruitservice.dto;
import lombok.Data;
import java.util.UUID;

@Data
public class CompanyResponse {
    private UUID companyId;
    private String companyName;
    private String logoUrl;

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

    public String getLogoUrl() {return logoUrl;}

    public void setLogoUrl(String logoUrl) {this.logoUrl = logoUrl;}
}
