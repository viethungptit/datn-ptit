package com.ptit.recruitservice.dto;

import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

public class CVUploadRequest {
    private MultipartFile cv;

    public MultipartFile getCv() { return cv; }
    public void setCv(MultipartFile cv) { this.cv = cv; }
}

