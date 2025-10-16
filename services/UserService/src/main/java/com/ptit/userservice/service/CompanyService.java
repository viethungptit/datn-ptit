package com.ptit.userservice.service;

import com.ptit.userservice.dto.CompanyCreateRequest;
import com.ptit.userservice.dto.CompanyUpdateRequest;
import com.ptit.userservice.dto.CompanyResponse;
import com.ptit.userservice.entity.Company;
import com.ptit.userservice.entity.Employer;
import com.ptit.userservice.exception.ResourceNotFoundException;
import com.ptit.userservice.repository.CompanyRepository;
import com.ptit.userservice.repository.EmployerRepository;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
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

    @Value("${minio.bucket}")
    private String bucketName;

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
            throw new RuntimeException("Failed to upload logo to MinIO", e);
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
            System.out.println("Failed to delete logo in MinIO: " + e.getMessage());
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
            throw new RuntimeException("Failed to upload cover image to MinIO", e);
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
            System.out.println("Failed to delete cover image in MinIO: " + e.getMessage());
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

    public CompanyResponse createCompany(CompanyCreateRequest request, boolean isAdmin) {
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
        return toResponse(company);
    }


    public CompanyResponse getCompany(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        return toResponse(company);
    }

    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream()
                .filter(c -> !c.isDeleted())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CompanyResponse updateCompany(UUID companyId, CompanyUpdateRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
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
        return toResponse(company);
    }

    public CompanyResponse verifyCompany(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        company.setVerified(true);
        companyRepository.save(company);
        // Activate all related employers
        List<Employer> employers = employerRepository.findAll().stream()
                .filter(e -> e.getCompany().getCompanyId().equals(companyId))
                .toList();
        for (Employer employer : employers) {
            employer.setActive(true);
            employerRepository.save(employer);
        }
        return toResponse(company);
    }

    public CompanyResponse deleteCompany(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setDeleted(true);
        company = companyRepository.save(company);
        return toResponse(company);
    }

    public CompanyResponse getCompanyByUserId(UUID userId) {
        Employer employer = employerRepository.findAll().stream()
            .filter(e -> e.getUser().getUserId().equals(userId) && e.isActive())
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Active employer not found for userId: " + userId));
        Company company = employer.getCompany();
        return toResponse(company);
    }
}
