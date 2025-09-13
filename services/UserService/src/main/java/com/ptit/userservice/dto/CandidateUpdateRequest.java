package com.ptit.userservice.dto;

import org.springframework.web.multipart.MultipartFile;

public class CandidateUpdateRequest {
    private String dob; // ISO format string
    private String gender;
    private String address;
    private MultipartFile avatar;

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public MultipartFile getAvatar() { return avatar; }
    public void setAvatar(MultipartFile avatar) { this.avatar = avatar; }
}
