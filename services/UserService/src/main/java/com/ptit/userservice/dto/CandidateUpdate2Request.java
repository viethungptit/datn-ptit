package com.ptit.userservice.dto;

import org.springframework.web.multipart.MultipartFile;

public class CandidateUpdate2Request {
    private String dob; // ISO format string
    private String gender;
    private String address;
    private String avatarUrl;

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}