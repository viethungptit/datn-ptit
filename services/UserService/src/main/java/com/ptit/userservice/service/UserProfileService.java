package com.ptit.userservice.service;

import com.ptit.userservice.config.EventPublisher;
import com.ptit.userservice.dto.*;
import com.ptit.userservice.entity.Candidate;
import com.ptit.userservice.entity.Employer;
import com.ptit.userservice.entity.User;
import com.ptit.userservice.entity.Candidate.Gender;
import com.ptit.userservice.exception.BusinessException;
import com.ptit.userservice.exception.ResourceNotFoundException;
import com.ptit.userservice.repository.CandidateRepository;
import com.ptit.userservice.repository.EmployerRepository;
import com.ptit.userservice.repository.UserRepository;
import com.ptit.userservice.entity.Company;
import com.ptit.userservice.repository.CompanyRepository;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class UserProfileService {
    @Autowired
    private CandidateRepository candidateRepository;
    @Autowired
    private EmployerRepository employerRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CompanyRepository companyRepository;
    @Autowired
    private MinioClient minioClient;
    @Value("${minio.bucket}")
    private String bucketName;

    @Autowired
    private EventPublisher eventPublisher;

    @Value("${log.exchange}")
    private String logExchange;

    @Value("${log.activity.routing-key}")
    private String logActivityRoutingKey;

    private String uploadAvatar(MultipartFile avatar) {
        if (avatar == null || avatar.isEmpty()) return null;
        try (InputStream is = avatar.getInputStream()) {
            String objectName = "avatar/" + "user-" + UUID.randomUUID() + "-" + avatar.getOriginalFilename();
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(is, avatar.getSize(), -1)
                    .contentType(avatar.getContentType())
                    .build()
            );
            return objectName;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new RuntimeException("Lỗi tải ảnh lên MinIO");
        }
    }

    private void deleteAvatarInMinio(String objectKey) {
        if (objectKey == null || objectKey.isEmpty()) return;
        try {
            minioClient.removeObject(
                RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .build()
            );
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new RuntimeException("Lỗi xóa ảnh trên MinIO");
        }
    }

    @Transactional
    public CandidateResponse upsertCandidateByUserId(UUID userId, UUID currentUserId, CandidateUpdateRequest request, boolean isAdmin) {
        if (!isAdmin && !userId.equals(currentUserId)) {
            throw new AccessDeniedException("Bạn không thể cập nhật thông tin của người khác");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Không thấy người dùng với ID: " + userId));
        Candidate candidate = candidateRepository.findByUser_UserId(userId).orElse(null);
        if (candidate == null) {
            candidate = new Candidate();
            candidate.setUser(user);
        }
        if (request.getDob() != null) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("[yyyy-MM-dd][dd/MM/yyyy][yyyy/MM/dd]");
                candidate.setDob(LocalDate.parse(request.getDob(), formatter));
            } catch (Exception e) {
                throw new BusinessException("Lỗi định dạng ngày sinh: " + request.getDob());
            }
        }

        if (request.getGender() != null) {
            try {
                candidate.setGender(Gender.valueOf(request.getGender()));
            } catch (Exception e) {
                throw new BusinessException("Lỗi giá trị giới tính: " + request.getGender());
            }
        }
        if (request.getAddress() != null) candidate.setAddress(request.getAddress());
        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            if (candidate.getAvatarUrl() != null && !candidate.getAvatarUrl().isEmpty()) {
                deleteAvatarInMinio(candidate.getAvatarUrl());
            }
            candidate.setAvatarUrl(uploadAvatar(request.getAvatar()));
        }
        candidate = candidateRepository.save(candidate);

        // Gửi log sang AdminService
        String role = isAdmin ? "ADMIN" : "CANDIDATE";
        String desc = String.format("%s %s đã cập nhật thông tin người dùng %s",
                isAdmin ? "Quản trị viên" : "Người dùng", currentUserId, user.getUserId()
        );

        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole(role)
                        .action("UPDATE_CANDIDATE_PROFILE")
                        .targetType("CANDIDATE")
                        .targetId(user.getUserId().toString())
                        .description(desc)
                        .build()
        );
        return toCandidateResponse(candidate);
    }

    @Transactional
    public EmployerResponse upsertEmployerByUserId(UUID userId, UUID currentUserId, EmployerUpdateRequest request, boolean isAdmin) {
        if (!isAdmin && !userId.equals(currentUserId)) {
            throw new AccessDeniedException("Bạn không thể cập nhật thông tin của người khác");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với ID: " + userId));
        Employer employer = employerRepository.findByUser_UserId(userId).orElse(null);
        if (employer == null) {
            employer = new Employer();
            employer.setUser(user);
            employer.setCreatedAt(LocalDateTime.now());
        }
        if (request.getCompanyId() == null) {
            throw new BusinessException("ID công ty không được để trống");
        }
        Company company = companyRepository.findById(request.getCompanyId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công ty với ID: " + request.getCompanyId()));
        employer.setCompany(company);
        employer.setActive(company.isVerified());
        if (request.getPosition() != null) employer.setPosition(request.getPosition());
        employer = employerRepository.save(employer);

        // Gửi log sang AdminService
        String role = isAdmin ? "ADMIN" : "EMPLOYER";
        String desc = String.format("%s %s đã cập nhật thông tin nhà tuyển dụng %s",
                isAdmin ? "Quản trị viên" : "Nhà tuyển dụng", currentUserId, user.getUserId()
        );

        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole(role)
                        .action("UPDATE_EMPLOYER_PROFILE")
                        .targetType("EMPLOYER")
                        .targetId(user.getUserId().toString())
                        .description(desc)
                        .build()
        );
        return toEmployerResponse(employer);
    }

    public CandidateResponse toCandidateResponse(Candidate candidate) {
        if (candidate == null) return null;
        CandidateResponse response = new CandidateResponse();
        response.setCandidateId(candidate.getCandidateId());
        response.setDob(candidate.getDob());
        response.setGender(candidate.getGender() != null ? candidate.getGender().name() : null);
        response.setAddress(candidate.getAddress());
        response.setAvatarUrl(candidate.getAvatarUrl());
        CandidateResponse.UserInfo userInfo = null;
        if (candidate.getUser() != null) {
            userInfo = new CandidateResponse.UserInfo();
            userInfo.setUserId(candidate.getUser().getUserId());
            userInfo.setUsername(candidate.getUser().getFullName());
        }
        response.setUser(userInfo);
        return response;
    }

    public EmployerResponse toEmployerResponse(Employer employer) {
        if (employer == null) return null;
        EmployerResponse response = new EmployerResponse();
        response.setEmployerId(employer.getEmployerId());
        response.setPosition(employer.getPosition());
        response.setCreatedAt(employer.getCreatedAt());
        response.setActive(employer.isActive());
        EmployerResponse.CompanyInfo companyInfo = null;
        if (employer.getCompany() != null) {
            companyInfo = new EmployerResponse.CompanyInfo();
            companyInfo.setCompanyId(employer.getCompany().getCompanyId());
            companyInfo.setCompanyName(employer.getCompany().getCompanyName());
            companyInfo.setVerified(employer.getCompany().isVerified());
        }
        response.setCompany(companyInfo);
        EmployerResponse.UserInfo userInfo = null;
        if (employer.getUser() != null) {
            userInfo = new EmployerResponse.UserInfo();
            userInfo.setUserId(employer.getUser().getUserId());
            userInfo.setUsername(employer.getUser().getFullName());
        }
        response.setUser(userInfo);
        return response;
    }

    public CompanyResponse toCompanyResponse(Company company) {
        if (company == null) return null;
        CompanyResponse response = new CompanyResponse();
        response.setCompanyId(company.getCompanyId());
        response.setCompanyName(company.getCompanyName());
        response.setIndustry(company.getIndustry());
        response.setCompanySize(company.getCompanySize());
        response.setLocation(company.getLocation());
        response.setLogoUrl(company.getLogoUrl());
        response.setWebsite(company.getWebsite());
        response.setDeleted(company.isDeleted());
        response.setVerified(company.isVerified());
        response.setCreatedAt(company.getCreatedAt());
        response.setCoverImgUrl(company.getCoverImgUrl());
        response.setDescription(company.getDescription());
        return response;
    }
}
