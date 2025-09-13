package com.ptit.userservice.dto;

import java.time.LocalDate;
import java.util.UUID;

public class CandidateResponse {
    private UUID candidateId;
    private LocalDate dob;
    private String gender;
    private String address;
    private String avatarUrl;
    private UserInfo user;

    public static class UserInfo {
        private UUID userId;
        private String username;
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }
    public UUID getCandidateId() { return candidateId; }
    public void setCandidateId(UUID candidateId) { this.candidateId = candidateId; }
    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }
}

