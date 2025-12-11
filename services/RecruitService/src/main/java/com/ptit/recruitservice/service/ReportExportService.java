package com.ptit.recruitservice.service;
import com.ptit.recruitservice.dto.*;
import com.ptit.recruitservice.enums.ReportType;
import com.ptit.recruitservice.utils.PdfHelper;
import com.ptit.recruitservice.utils.PdfTableHelper;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.List;

@Service
public class ReportExportService {

    @Autowired
    private ReportService reportService;

    private PDType0Font loadUnicodeFont(PDDocument doc) throws IOException {
        return PDType0Font.load(doc, getClass().getResourceAsStream("/fonts/Lexend-Regular.ttf"));
    }

    private String translateStatus(String status) {
        if (status == null) return "";
        return switch (status.toLowerCase()) {
            case "pending" -> "Đang chờ";
            case "approved" -> "Đã duyệt";
            case "rejected" -> "Đã từ chối";
            default -> status; // giữ nguyên nếu không biết
        };
    }

    /* ---------------------------------------------------------
        EXPORT EXCEL
       --------------------------------------------------------- */
    public void exportExcel(List<ReportType> types, int year, int month, OutputStream out) throws IOException {
        if (types == null || types.isEmpty() || types.contains(ReportType.ALL)) {
            types = Arrays.asList(
                    ReportType.MONTHLY,
                    ReportType.JOB_PERFORMANCE,
                    ReportType.APPLICANTS,
                    ReportType.JOB_ENGAGEMENT
            );
        }

        try (Workbook wb = new XSSFWorkbook()) {
            if (types.contains(ReportType.MONTHLY)) createMonthlySheet(wb, year, month);
            if (types.contains(ReportType.JOB_PERFORMANCE)) createJobPerformanceSheet(wb, year, month);
            if (types.contains(ReportType.APPLICANTS)) createApplicantsSheet(wb, year, month);
            if (types.contains(ReportType.JOB_ENGAGEMENT)) createJobEngagementSheet(wb, year, month);
            wb.write(out);
        }
    }

    /* ---------------------------------------------------------
        EXPORT PDF (Unicode)
       --------------------------------------------------------- */
    public void exportPdf(List<ReportType> types, int year, int month, OutputStream out) throws IOException {

        if (types == null || types.isEmpty() || types.contains(ReportType.ALL)) {
            types = Arrays.asList(
                    ReportType.MONTHLY,
                    ReportType.JOB_PERFORMANCE,
                    ReportType.APPLICANTS,
                    ReportType.JOB_ENGAGEMENT
            );
        }

        try (PDDocument doc = new PDDocument()) {
            if (types.contains(ReportType.MONTHLY)) writeMonthlyPdf(doc, year, month);
            if (types.contains(ReportType.JOB_PERFORMANCE)) writeJobPerformancePdf(doc, year, month);
            if (types.contains(ReportType.APPLICANTS)) writeApplicantsPdf(doc, year, month);
            if (types.contains(ReportType.JOB_ENGAGEMENT)) writeJobEngagementPdf(doc, year, month);
            doc.save(out);
        }
    }

    /* ---------------------------------------------------------
        EXCEL SHEETS
       --------------------------------------------------------- */
    private void createMonthlySheet(Workbook wb, int year, int month) {
        MonthlyRecruitmentSummaryDTO dto = reportService.getMonthlySummary(year, month);
        Sheet s = wb.createSheet("Tổng quan tin tuyển dụng");

        Row titleRow = s.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        String title = "Tổng quan tin tuyển dụng tháng " + month + "/" + year;
        titleCell.setCellValue(title);
        s.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 1));

        int r = 1;
        Row header = s.createRow(r++);
        header.createCell(0).setCellValue("Chỉ tiêu");
        header.createCell(1).setCellValue("Giá trị");

        s.createRow(r++).createCell(0).setCellValue("Tin tuyển dụng đang mở");
        s.getRow(r - 1).createCell(1).setCellValue(dto.getOpenJobs());

        s.createRow(r++).createCell(0).setCellValue("Tin tuyển dụng mới tạo");
        s.getRow(r - 1).createCell(1).setCellValue(dto.getJobsCreated());

        s.createRow(r++).createCell(0).setCellValue("Tin tuyển dụng đã đóng");
        s.getRow(r - 1).createCell(1).setCellValue(dto.getJobsClosed());

        s.createRow(r++).createCell(0).setCellValue("Tổng số lượt ứng tuyển");
        s.getRow(r - 1).createCell(1).setCellValue(dto.getTotalApplied());

        s.createRow(r++).createCell(0).setCellValue("Đơn ứng tuyển đã từ chối");
        s.getRow(r - 1).createCell(1).setCellValue(dto.getRejected());

        s.createRow(r++).createCell(0).setCellValue("Đơn ứng tuyển đã chấp nhận");
        s.getRow(r - 1).createCell(1).setCellValue(dto.getHired());

        s.createRow(r++).createCell(0).setCellValue("Tỉ lệ tuyển thành công");
        s.getRow(r - 1).createCell(1).setCellValue(dto.getHireRate());

        s.autoSizeColumn(0);
        s.autoSizeColumn(1);
    }


    private void createJobPerformanceSheet(Workbook wb, int year, int month) {
        List<JobPerformanceDTO> list = reportService.getJobPerformance(year, month);
        Sheet s = wb.createSheet("Hiệu suất công việc");

        String[] cols = {
                "Tiêu đề công việc", "Lượt ứng tuyển",
                "Từ chối", "Đã tuyển", "Lượt yêu thích", "Tỉ lệ chuyển đổi"
        };

        Row titleRow = s.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        String title = "Hiệu suất công việc tháng " + month + "/" + year;
        titleCell.setCellValue(title);

        s.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, cols.length - 1));

        Row header = s.createRow(1);
        for (int i = 0; i < cols.length; i++) {
            header.createCell(i).setCellValue(cols[i]);
        }

        int r = 2;
        for (JobPerformanceDTO j : list) {
            Row row = s.createRow(r++);
            row.createCell(0).setCellValue(j.getJobTitle());
            row.createCell(1).setCellValue(j.getApplied());
            row.createCell(2).setCellValue(j.getRejected());
            row.createCell(3).setCellValue(j.getHired());
            row.createCell(4).setCellValue(j.getFavorite());
            row.createCell(5).setCellValue(j.getConversionRate());
        }

        // --- Auto size columns ---
        for (int i = 0; i < cols.length; i++) s.autoSizeColumn(i);
    }


    private void createApplicantsSheet(Workbook wb, int year, int month) {
        var page = reportService.getApplicants(year, month, null, PageRequest.of(0, 10000));
        Sheet s = wb.createSheet("Thống kê ứng viên");

        String[] cols = { "Tên CV", "Tiêu đề", "Trạng thái", "Ngày ứng tuyển" };
        Row titleRow = s.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        String title = "Thống kê ứng viên tháng " + month + "/" + year;
        titleCell.setCellValue(title);
        s.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, cols.length - 1));

        Row header = s.createRow(1);
        for (int i = 0; i < cols.length; i++) header.createCell(i).setCellValue(cols[i]);

        int r = 2;
        for (ApplicantDTO a : page.getContent()) {
            Row row = s.createRow(r++);
            row.createCell(0).setCellValue(a.getCandidateName());
            row.createCell(1).setCellValue(a.getJobTitle());
            row.createCell(2).setCellValue(translateStatus(a.getStatus()));
            row.createCell(3).setCellValue(a.getAppliedAt() != null ? a.getAppliedAt().toString() : "");
        }
        for (int i = 0; i < cols.length; i++) s.autoSizeColumn(i);
    }

    private void createJobEngagementSheet(Workbook wb, int year, int month) {
        List<JobEngagementDTO> list = reportService.getJobEngagement(year, month);
        Sheet s = wb.createSheet("Công việc được quan tâm");

        String[] cols = { "Tiêu đề công việc", "Lượt yêu thích", "Số ứng tuyển", "Điểm quan tâm" };

        Row titleRow = s.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        String title = "Công việc được quan tâm tháng " + month + "/" + year;
        titleCell.setCellValue(title);
        s.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, cols.length - 1));

        Row header = s.createRow(1);
        for (int i = 0; i < cols.length; i++) header.createCell(i).setCellValue(cols[i]);

        int r = 2;
        for (JobEngagementDTO j : list) {
            Row row = s.createRow(r++);
            row.createCell(0).setCellValue(j.getJobTitle());
            row.createCell(1).setCellValue(j.getFavorites());
            row.createCell(2).setCellValue(j.getApplies());
            row.createCell(3).setCellValue(j.getInterestScore());
        }
        for (int i = 0; i < cols.length; i++) s.autoSizeColumn(i);
    }


    /* ---------------------------------------------------------
        PDF WRITERS (Unicode)
       --------------------------------------------------------- */
    private void writeMonthlyPdf(PDDocument doc, int year, int month) throws IOException {
        PdfHelper pdf = new PdfHelper(doc);

        MonthlyRecruitmentSummaryDTO dto = reportService.getMonthlySummary(year, month);

        pdf.title("Báo cáo tổng quan tuyển dụng tháng " + month + "/" + year);

        pdf.write("Tin tuyển dụng đang mở: " + dto.getOpenJobs());
        pdf.write("Tin tuyển dụng mới tạo: " + dto.getJobsCreated());
        pdf.write("Tin tuyển dụng đã đóng: " + dto.getJobsClosed());
        pdf.write("Tổng số lượt ứng tuyển: " + dto.getTotalApplied());
        pdf.write("Đơn ứng tuyển đã từ chối: " + dto.getRejected());
        pdf.write("Đơn ứng tuyển được chấp nhận: " + dto.getHired());

        pdf.close();
    }


    private void writeJobPerformancePdf(PDDocument doc, int year, int month) throws IOException {
        PdfTableHelper pdf = new PdfTableHelper(doc);
        List<JobPerformanceDTO> list = reportService.getJobPerformance(year, month);
        pdf.drawTableLandscapeOnPortrait(
                String.format("Hiệu suất công việc tháng %d/%d", month, year),
                List.of("Tiêu đề công việc", "Ứng tuyển", "Từ chối", "Đã tuyển", "Yêu thích", "Tỉ lệ tuyển"),
                list.stream().map(j -> List.of(
                        truncate(j.getJobTitle(), 30),
                        String.valueOf(j.getApplied()),
                        String.valueOf(j.getRejected()),
                        String.valueOf(j.getHired()),
                        String.valueOf(j.getFavorite()),
                        String.format("%.2f", j.getConversionRate())
                )).toList()
        );
        pdf.close();
    }


    private void writeApplicantsPdf(PDDocument doc, int year, int month) throws IOException {
        PdfTableHelper pdf = new PdfTableHelper(doc);
        var pageData = reportService.getApplicants(year, month, null, PageRequest.of(0, 10000));
        List<ApplicantDTO> list = pageData.getContent();
        List<String> headers = List.of("Tên CV", "Tiêu đề công việc", "Trạng thái", "Ngày ứng tuyển");
        pdf.drawTableLandscapeOnPortrait(
                String.format("Thống kê danh sách ứng viên tháng %d/%d", month, year),
                headers,
                list.stream().map(a -> List.of(
                        a.getCandidateName(),
                        truncate(a.getJobTitle(), 30),
                        translateStatus(a.getStatus()), // chuyển sang tiếng Việt
                        a.getAppliedAt() != null ? a.getAppliedAt().toString() : ""
                )).toList()
        );

        pdf.close();
    }

    private void writeJobEngagementPdf(PDDocument doc, int year, int month) throws IOException {
        PdfTableHelper pdf = new PdfTableHelper(doc);
        List<JobEngagementDTO> list = reportService.getJobEngagement(year, month);
        pdf.drawTableLandscapeOnPortrait(
                String.format("Danh sách công việc được quan tâm tháng %d/%d", month, year),
                List.of("Tiêu đề công việc", "Lượt yêu thích", "Lượt ứng tuyển", "Điểm quan tâm"),
                list.stream().map(j -> List.of(
                        truncate(j.getJobTitle(), 30),
                        String.valueOf(j.getFavorites()),
                        String.valueOf(j.getApplies()),
                        String.valueOf(j.getInterestScore())
                )).toList()
        );

        pdf.close();
    }


    private String truncate(String s, int len) {
        if (s == null) return "";
        return s.length() <= len ? s : s.substring(0, len - 3) + "...";
    }
}
