package com.ptit.userservice.service;
import com.ptit.userservice.dto.FileResponse;
import com.ptit.userservice.dto.FileUploadRequest;
import com.ptit.userservice.entity.File;
import com.ptit.userservice.entity.User;
import com.ptit.userservice.exception.BusinessException;
import com.ptit.userservice.exception.ResourceNotFoundException;
import com.ptit.userservice.repository.FileRepository;
import com.ptit.userservice.repository.UserRepository;
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
import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

@Service
public class FileService {
    @Autowired
    private FileRepository fileRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MinioClient minioClient;
    @Value("${minio.bucket}")
    private String bucketName;

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
    public FileResponse uploadFile(FileUploadRequest request, UUID userId) {
        MultipartFile multifile = request.getFile();
        if (multifile == null || multifile.isEmpty()) {
            throw new BusinessException("Không tìm thấy file để tải lên");
        }
        User user = userRepository.findById(userId)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        String objectName = uploadAvatar(multifile);
        File file = new File();
        file.setFileName(multifile.getOriginalFilename());
        file.setContentType(multifile.getContentType());
        file.setUser(user);
        file.setFileUrl(objectName);
        file.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        file = fileRepository.save(file);
        return toDto(file);
    }

    @Transactional(readOnly = true)
    public List<FileResponse> getFiles(UUID userId) {
        User user = userRepository.findById(userId)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        List<File> files = fileRepository.findAllByUser_UserId(user.getUserId());
        return files.stream().map(this::toDto).toList();
    }

    @Transactional
    public FileResponse deleteFiles(UUID fileId, UUID userId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy file"));
        if (file.getUser() == null || !file.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("Bạn không có quyền xóa file này");
        }
        deleteAvatarInMinio(file.getFileUrl());
        FileResponse dto = toDto(file);
        fileRepository.delete(file);
        return dto;
    }

    private FileResponse toDto(File file) {
        FileResponse dto = new FileResponse();
        dto.setFileId(file.getFileId());
        dto.setFileUrl(file.getFileUrl());
        dto.setFileName(file.getFileName());
        dto.setContentType(file.getContentType());
        dto.setUserId(file.getUser().getUserId());
        dto.setCreatedAt(file.getCreatedAt());
        return dto;
    }
}
