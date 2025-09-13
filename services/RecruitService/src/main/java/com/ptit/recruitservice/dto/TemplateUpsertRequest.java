package com.ptit.recruitservice.dto;

import org.springframework.web.multipart.MultipartFile;

public class TemplateUpsertRequest {
    private String name;
    private String layoutJson;
    private String themeJson;
    private MultipartFile preview;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLayoutJson() {
        return layoutJson;
    }

    public void setLayoutJson(String layoutJson) {
        this.layoutJson = layoutJson;
    }

    public String getThemeJson() {
        return themeJson;
    }

    public void setThemeJson(String themeJson) {
        this.themeJson = themeJson;
    }

    public MultipartFile getPreview() {
        return preview;
    }

    public void setPreview(MultipartFile preview) {
        this.preview = preview;
    }
}
