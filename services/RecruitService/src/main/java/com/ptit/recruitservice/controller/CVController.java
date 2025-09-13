package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.dto.*;
import com.ptit.recruitservice.service.CVService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cvs")
public class CVController {
    @Autowired
    private CVService cvService;

    @PostMapping
    public CVDto createCV(@RequestBody CVCreateRequest request, @RequestParam("userId") UUID userId) {
        return cvService.createCV(request, userId);
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public CVDto uploadCV(@RequestParam("user_id") UUID userId, @ModelAttribute CVUploadRequest req) {
        return cvService.uploadCV(req, userId);
    }

    @GetMapping("/{cv_id}")
    public CVDto getCV(@PathVariable("cv_id") UUID cvId) {
        return cvService.getCV(cvId);
    }

    @PutMapping("/{cv_id}")
    public CVDto updateCV(@PathVariable("cv_id") UUID cvId, @RequestBody CVUpdateRequest request) {
        return cvService.updateCV(cvId, request);
    }

    @DeleteMapping("/{cv_id}")
    public CVDto deleteCV(@PathVariable("cv_id") UUID cvId) {
        return cvService.deleteCV(cvId);
    }

    @PostMapping("/{cv_id}/export")
    public CVExportResponse exportCV(@PathVariable("cv_id") UUID cvId) {
        return cvService.exportCV(cvId);
    }

    @GetMapping("/all-by-user")
    public List<CVDto> getAllCVsByUser(@RequestParam("user_id") UUID userId) {
        return cvService.getAllCVsByUser(userId);
    }

    @GetMapping("/all")
    public List<CVDto> getAllCVs() {
        return cvService.getAllCVs();
    }
}

