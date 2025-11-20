package com.ptit.userservice.service;

import com.ptit.userservice.config.EventPublisher;
import com.ptit.userservice.dto.*;
import com.ptit.userservice.entity.Company;
import com.ptit.userservice.entity.Employer;
import com.ptit.userservice.exception.ResourceNotFoundException;
import com.ptit.userservice.feign.RecruitServiceFeign;
import com.ptit.userservice.repository.CompanyRepository;
import com.ptit.userservice.repository.EmployerRepository;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final EmployerRepository employerRepository ;
    private final MinioClient minioClient;

    @Autowired
    private EventPublisher eventPublisher;

    @Autowired
    private RecruitServiceFeign externalRecruitServiceFeignClient;

    @Value("${internal.secret}")
    private String internalSecret;

    @Value("${log.exchange}")
    private String logExchange;

    @Value("${log.activity.routing-key}")
    private String logActivityRoutingKey;

    @Value("${minio.bucket}")
    private String bucketName;

    public void deleteJobByCompanyId(UUID companyId) {
        externalRecruitServiceFeignClient.softDeleteJobByCompanyId(companyId, internalSecret);
    }

    private String uploadLogo(MultipartFile logo) {
        if (logo == null || logo.isEmpty()) return null;
        try (InputStream is = logo.getInputStream()) {
            String objectName = "logo-company/" + "company-" + UUID.randomUUID() + "-" + logo.getOriginalFilename();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(is, logo.getSize(), -1)
                            .contentType(logo.getContentType())
                            .build()
            );
            return objectName;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new RuntimeException("Lỗi tải ảnh lên MinIO");
        }
    }

    private void deleteLogoInMinio(String objectKey) {
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

    private String uploadCoverImg(MultipartFile coverImg) {
        if (coverImg == null || coverImg.isEmpty()) return null;
        try (InputStream is = coverImg.getInputStream()) {
            String objectName = "cover-company/" + "company-" + UUID.randomUUID() + "-" + coverImg.getOriginalFilename();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(is, coverImg.getSize(), -1)
                            .contentType(coverImg.getContentType())
                            .build()
            );
            return objectName;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new RuntimeException("Lỗi tải ảnh lên MinIO");
        }
    }

    private void deleteCoverImgInMinio(String objectKey) {
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

    private CompanyResponse toResponse(Company company) {
        CompanyResponse response = new CompanyResponse();
        response.setCompanyId(company.getCompanyId());
        response.setCompanyName(company.getCompanyName());
        response.setIndustry(company.getIndustry());
        response.setCompanySize(company.getCompanySize());
        response.setLocation(company.getLocation());
        response.setLogoUrl(company.getLogoUrl());
        response.setCoverImgUrl(company.getCoverImgUrl());
        response.setDescription(company.getDescription());
        response.setWebsite(company.getWebsite());
        response.setVerified(company.isVerified());
        response.setDeleted(company.isDeleted());
        response.setCreatedAt(company.getCreatedAt());
        return response;
    }

    public CompanyResponse createCompany(CompanyCreateRequest request, boolean isAdmin, UUID currentUserId) {
        Company company = new Company();
        company.setCompanyName(request.getCompanyName());
        company.setIndustry(request.getIndustry());
        company.setCompanySize(request.getCompanySize());
        company.setLocation(request.getLocation());
        company.setWebsite(request.getWebsite());
        company.setDescription(request.getDescription());
        company.setCreatedAt(LocalDateTime.now());
        company.setVerified(isAdmin);
        company.setDeleted(false);
        if (request.getLogo() != null && !request.getLogo().isEmpty()) {
            company.setLogoUrl(uploadLogo(request.getLogo()));
        }
        if (request.getCoverImg() != null && !request.getCoverImg().isEmpty()) {
            company.setCoverImgUrl(uploadCoverImg(request.getCoverImg()));
        }
        company = companyRepository.save(company);

        // Gửi log sang AdminService
        String role = isAdmin ? "ADMIN" : "EMPLOYER";
        String desc = String.format("%s %s đã tạo công ty %s",
                isAdmin ? "Quản trị viên" : "Nhà tuyển dụng", currentUserId, company.getCompanyName()
        );

        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole(role)
                        .action("CREATE_COMPANY")
                        .targetType("COMPANY")
                        .targetId(company.getCompanyId().toString())
                        .description(desc)
                        .build()
        );
        return toResponse(company);
    }


    public CompanyResponse getCompany(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin công ty"));
        return toResponse(company);
    }

    public List<CompanyResponse> getAllCompanies() {
        System.out.printf("getAllCompanies()");
        return companyRepository.findAll().stream()
                .filter(c -> !c.isDeleted())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<CompanyResponse> searchCompanies(String keyword) {
        System.out.println("searchCompanies");
        return companyRepository.findAll().stream()
                .filter(c -> !c.isDeleted())
                .filter(c -> keyword == null ||
                        c.getCompanyName().toLowerCase().contains(keyword.toLowerCase()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CompanyResponse updateCompany(UUID companyId, CompanyUpdateRequest request, boolean isAdmin, UUID currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin công ty"));
        if (request.getCompanyName() != null) company.setCompanyName(request.getCompanyName());
        if (request.getIndustry() != null) company.setIndustry(request.getIndustry());
        if (request.getCompanySize() != null) company.setCompanySize(request.getCompanySize());
        if (request.getLocation() != null) company.setLocation(request.getLocation());
        if (request.getWebsite() != null) company.setWebsite(request.getWebsite());
        if (request.getDescription() != null) company.setDescription(request.getDescription());
        if (request.getLogo() != null && !request.getLogo().isEmpty()) {
            if (company.getLogoUrl() != null && !company.getLogoUrl().isEmpty()) {
                deleteLogoInMinio(company.getLogoUrl());
            }
            company.setLogoUrl(uploadLogo(request.getLogo()));
        }
        if (request.getCoverImg() != null && !request.getCoverImg().isEmpty()) {
            if (company.getCoverImgUrl() != null && !company.getCoverImgUrl().isEmpty()) {
                deleteCoverImgInMinio(company.getCoverImgUrl());
            }
            company.setCoverImgUrl(uploadCoverImg(request.getCoverImg()));
        }
        company = companyRepository.save(company);

        // Gửi log sang AdminService
        String role = isAdmin ? "ADMIN" : "EMPLOYER";
        String desc = String.format("%s %s đã cập nhật thông tin công ty %s",
                isAdmin ? "Quản trị viên" : "Nhà tuyển dụng", currentUserId, company.getCompanyName()
        );

        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole(role)
                        .action("UPDATE_COMPANY")
                        .targetType("COMPANY")
                        .targetId(company.getCompanyId().toString())
                        .description(desc)
                        .build()
        );
        return toResponse(company);
    }

    public CompanyResponse verifyCompany(UUID companyId, UUID currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin công ty"));
        company.setVerified(true);
        companyRepository.save(company);
        // Activate all related employers
        List<Employer> employers = employerRepository.findAll().stream()
                .filter(e -> e.getCompany().getCompanyId().equals(companyId))
                .toList();
        for (Employer employer : employers) {
            employerRepository.save(employer);
        }

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("ADMIN")
                        .action("VERIFY_COMPANY")
                        .targetType("COMPANY")
                        .targetId(company.getCompanyId().toString())
                        .description(String.format("Quản trị viên %s đã xác thực công ty %s", currentUserId, company.getCompanyName()))
                        .build()
        );
        return toResponse(company);
    }

    public CompanyResponse deleteCompany(UUID companyId, UUID currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin công ty"));
        company.setDeleted(true);
        company = companyRepository.save(company);

        // Soft delete all related jobs
        deleteJobByCompanyId(companyId);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("ADMIN")
                        .action("DELETE_COMPANY")
                        .targetType("COMPANY")
                        .targetId(company.getCompanyId().toString())
                        .description(String.format("Quản trị viên %s đã xóa công ty %s", currentUserId, company.getCompanyName()))
                        .build()
        );

        return toResponse(company);
    }

    public CompanyResponse getCompanyByUserId(UUID userId) {
        Employer employer = employerRepository.findAll().stream()
            .filter(e -> e.getUser().getUserId().equals(userId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với ID: " + userId));
        Company company = employer.getCompany();
        return toResponse(company);
    }

    public CompanyResponse getCompanyByCompanyId(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin công ty"));
        return toResponse(company);
    }

    public List<EmployerResponse> getAllEmployersByCompany(UUID companyId) {
        // Kiểm tra công ty tồn tại
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công ty với ID: " + companyId));

        // Lấy danh sách employer
        List<Employer> employers = employerRepository.findByCompany_CompanyId(companyId);

        // Map sang DTO
        return employers.stream().map(e -> {
            EmployerResponse response = new EmployerResponse();
            response.setEmployerId(e.getEmployerId());
            response.setPosition(e.getPosition());
            response.setStatus(e.getStatus());
            response.setCreatedAt(e.getCreatedAt());
            response.setAdmin(e.getAdmin());

            EmployerResponse.CompanyInfo companyInfo = new EmployerResponse.CompanyInfo();
            companyInfo.setCompanyId(company.getCompanyId());
            companyInfo.setCompanyName(company.getCompanyName());
            companyInfo.setVerified(company.isVerified());
            response.setCompany(companyInfo);

            // Map user info
            EmployerResponse.UserInfo userInfo = new EmployerResponse.UserInfo();
            userInfo.setUserId(e.getUser().getUserId());
            userInfo.setUsername(e.getUser().getFullName());
            userInfo.setFullName(e.getUser().getFullName());
            userInfo.setEmail(e.getUser().getEmail());
            userInfo.setPhone(e.getUser().getPhone());
            response.setUser(userInfo);

            return response;
        }).collect(Collectors.toList());
    }
}
