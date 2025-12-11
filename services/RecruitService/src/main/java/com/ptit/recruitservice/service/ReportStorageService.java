package com.ptit.recruitservice.service;

import com.ptit.recruitservice.entity.ReportHistory;
import com.ptit.recruitservice.enums.ReportType;
import com.ptit.recruitservice.repository.ReportHistoryRepository;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportStorageService {

    private final MinioClient minioClient;
    private final String bucketName;
    private final String minioUrl;
    private final ReportHistoryRepository historyRepository;

    public ReportStorageService(MinioClient minioClient,
                                @Value("${minio.bucket}") String bucketName,
                                @Value("${minio.url}") String minioUrl,
                                ReportHistoryRepository historyRepository) {
        this.minioClient = minioClient;
        this.bucketName = bucketName;
        this.minioUrl = minioUrl;
        this.historyRepository = historyRepository;
    }

    // include year and month so caller can control the report period
    public String uploadAndSaveHistory(byte[] data, String contentType, String prefix, UUID userId, List<ReportType> types, String format, int year, int month) {
        if (data == null || data.length == 0) throw new IllegalArgumentException("Empty report data");
        try (ByteArrayInputStream is = new ByteArrayInputStream(data)) {
            String ext = "";
            if (contentType != null && contentType.contains("pdf")) ext = ".pdf"; else ext = ".xlsx";
            String objectName = (prefix == null ? "reports/" : (prefix.endsWith("/") ? prefix : prefix + "/"))
                    + "report-" + UUID.randomUUID() + ext;

            PutObjectArgs args = PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(is, data.length, -1)
                    .contentType(contentType != null ? contentType : "application/octet-stream")
                    .build();
            minioClient.putObject(args);

            String url = objectName;

            // Persist history
            ReportHistory h = new ReportHistory();
            h.setUserId(userId);
            // join types into comma-separated (keys)
            String typeStr = types == null || types.isEmpty() ? "all" : String.join(",", types.stream().map(ReportType::key).toList());
            h.setReportType(typeStr);

            // Build Vietnamese report name: "Báo cáo {type_vn} {month}/{year}"
            int m = month;
            int y = year;
            String typeVn;
            if (types == null || types.isEmpty()) {
                typeVn = ReportType.ALL.vn();
            } else if (types.size() == 1) {
                typeVn = types.get(0).vn();
            } else {
                typeVn = types.stream().map(ReportType::vn).collect(Collectors.joining(", "));
            }
            String reportName = "Báo cáo " + typeVn + " " + m + "/" + y;
            h.setReportName(reportName);

            h.setCreatedAt(Timestamp.from(Instant.now()));
            h.setFileFormat(format);
            h.setFileUrl(url);
            historyRepository.save(h);

            return url;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload report to MinIO: " + e.getMessage(), e);
        }
    }

    // Delete history and underlying object; enforce ownership
    public void deleteHistory(UUID id, UUID userId) {
        ReportHistory history = historyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report history not found"));

        if (history.getUserId() == null || !history.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own report history");
        }

        String objectName = history.getFileUrl();
        if (objectName != null && !objectName.isBlank()) {
            try {
                minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucketName).object(objectName).build());
            } catch (Exception ignored) {
                // ignore deletion errors; still delete DB record
            }
        }

        historyRepository.deleteById(id);
    }
}
