package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.dto.FileUploadResponse;
import com.ptit.recruitservice.entity.ReportHistory;
import com.ptit.recruitservice.repository.ReportHistoryRepository;
import com.ptit.recruitservice.service.ReportExportService;
import com.ptit.recruitservice.service.ReportStorageService;
import com.ptit.recruitservice.enums.ReportType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recruit-service/reports")
public class ReportExportController {

    @Autowired
    private ReportExportService exportService;

    @Autowired
    private ReportStorageService storageService;

    @Autowired
    private ReportHistoryRepository historyRepository;

    @PreAuthorize("hasRole('EMPLOYER')")
    @GetMapping("/history")
    public Page<ReportHistory> getMyReportHistory(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "10") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return historyRepository.findByUserId(UUID.fromString(currentUserId), pageable);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @GetMapping("/export")
    public FileUploadResponse exportToMinio(@RequestParam int year,
                                           @RequestParam int month,
                                           @RequestParam(defaultValue = "excel") String format,
                                           @RequestParam(name = "report", required = false) List<String> reportKeys) {
        List<ReportType> types;
        if (reportKeys == null || reportKeys.isEmpty()) {
            types = Collections.singletonList(ReportType.ALL);
        } else {
            List<String> expanded = reportKeys.stream()
                    .flatMap(k -> Arrays.stream(k.split(",")))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
            if (expanded.contains("all")) {
                types = Collections.singletonList(ReportType.ALL);
            } else {
                types = expanded.stream().map(ReportType::fromKey).collect(Collectors.toList());
            }
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            String contentType;
            if ("pdf".equalsIgnoreCase(format)) {
                exportService.exportPdf(types, year, month, baos);
                contentType = "application/pdf";
            } else {
                exportService.exportExcel(types, year, month, baos);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            }
            byte[] bytes = baos.toByteArray();

            // get current user id from security context (principal stored as String UUID)
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String principal = auth != null ? (String) auth.getPrincipal() : null;
            UUID userId = principal != null ? UUID.fromString(principal) : null;

            String url = storageService.uploadAndSaveHistory(bytes, contentType,"reports" , userId, types, format, year, month);
            return new FileUploadResponse(url);
        } catch (Exception e) {
            throw new RuntimeException("Export/upload failed: " + e.getMessage(), e);
        }
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @DeleteMapping("/history/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReportHistory(@PathVariable UUID id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String principal = auth != null ? (String) auth.getPrincipal() : null;
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
        }
        UUID userId = UUID.fromString(principal);
        storageService.deleteHistory(id, userId);
    }
}
