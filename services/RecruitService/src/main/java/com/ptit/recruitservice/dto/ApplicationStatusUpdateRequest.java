package com.ptit.recruitservice.dto;
import com.ptit.recruitservice.entity.Application;

public class ApplicationStatusUpdateRequest {
    private Application.Status status;

    public Application.Status getStatus() {
        return status;
    }

    public void setStatus(Application.Status status) {
        this.status = status;
    }
}

