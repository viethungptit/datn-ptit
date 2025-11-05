package com.ptit.userservice.controller;

import com.ptit.userservice.dto.FileResponse;
import com.ptit.userservice.dto.FileUploadRequest;
import com.ptit.userservice.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-service/files")
public class FileController {
    @Autowired
    private FileService fileService;

    @PreAuthorize("hasRole('CANDIDATE')")
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public FileResponse uploadFile(@ModelAttribute FileUploadRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return fileService.uploadFile(req, UUID.fromString(currentUserId));
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @GetMapping("/me")
    public List<FileResponse> getFilesMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return fileService.getFiles(UUID.fromString(currentUserId));
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @DeleteMapping("/{fileId}")
    public FileResponse deleteFile(@PathVariable("fileId") UUID fileId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return fileService.deleteFiles(fileId, UUID.fromString(currentUserId));
    }
}