package com.ptit.userservice.dto;

import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
public class CompanyResponse {
    private UUID companyId;
    private String companyName;
    private String industry;
    private Integer companySize;
    private String location;
    private String logoUrl;
    private String website;
    private boolean isDeleted;
    private boolean isVerified;
    private LocalDateTime createdAt;
    private String coverImgUrl;
    private String description;
}
