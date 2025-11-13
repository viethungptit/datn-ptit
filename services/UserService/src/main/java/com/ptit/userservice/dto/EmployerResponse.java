package com.ptit.userservice.dto;

import com.ptit.userservice.entity.enums.EmployerStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class EmployerResponse {
    private UUID employerId;
    private String position;
    private EmployerStatus status;
    private LocalDateTime createdAt;
    private CompanyInfo company;
    private UserInfo user;
    private Boolean isAdmin;
    public static class CompanyInfo {
        private UUID companyId;
        private String companyName;
        private boolean isVerified;
        public UUID getCompanyId() { return companyId; }
        public void setCompanyId(UUID companyId) { this.companyId = companyId; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public boolean isVerified() { return isVerified; }
        public void setVerified(boolean verified) { isVerified = verified; }
    }
    public static class UserInfo {
        private UUID userId;
        private String username;
        private String email;
        private String fullName;
        private String phone;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }
    public UUID getEmployerId() { return employerId; }
    public void setEmployerId(UUID employerId) { this.employerId = employerId; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public EmployerStatus getStatus() {
        return status;
    }

    public void setStatus(EmployerStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public CompanyInfo getCompany() { return company; }
    public void setCompany(CompanyInfo company) { this.company = company; }
    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }

    public Boolean getAdmin() {
        return isAdmin;
    }

    public void setAdmin(Boolean admin) {
        isAdmin = admin;
    }
}

