package com.ptit.userservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CompanyUpdateRequest {
    private String companyName;
    private String industry;
    private Integer companySize;
    private String location;
    private String website;
    private String description;
    @Schema(type = "string", format = "binary", description = "Logo file")
    private MultipartFile logo;
    @Schema(type = "string", format = "binary", description = "Cover image file")
    private MultipartFile coverImg;
}
