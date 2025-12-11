//package com.ptit.recruitservice.utils;
//import org.apache.pdfbox.pdmodel.*;
//import org.apache.pdfbox.pdmodel.common.PDRectangle;
//import org.apache.pdfbox.pdmodel.font.PDType0Font;
//import org.apache.pdfbox.pdmodel.PDPageContentStream.AppendMode;
//import java.awt.Color;
//import java.io.IOException;
//import java.io.InputStream;
//import java.util.List;
//
//public class PdfTableHelper {
//
//    private final PDDocument doc;
//    private final PDType0Font font;
//    private final float margin = 40;
//    private final float rowHeight = 20;
//
//    private PDPage page;
//    private PDPageContentStream cs;
//    private float cursorY;
//
//    private float pageWidth;
//    private float pageHeight;
//
//    private boolean landscapeMode = false;
//
//    public PdfTableHelper(PDDocument doc) throws IOException {
//        this.doc = doc;
//
//        InputStream fontStream = getClass().getResourceAsStream("/fonts/Lexend-Regular.ttf");
//        this.font = PDType0Font.load(doc, fontStream);
//
//        createNewPage();
//    }
//
//    /** ==================== CREATE PAGES ==================== */
//
//    /** Tạo trang portrait bình thường */
//    private void createNewPage() throws IOException {
//        page = new PDPage(PDRectangle.A4);
//        doc.addPage(page);
//
//        if (cs != null) cs.close();
//        cs = new PDPageContentStream(doc, page, AppendMode.OVERWRITE, true);
//
//        pageWidth = page.getMediaBox().getWidth();
//        pageHeight = page.getMediaBox().getHeight();
//        cursorY = pageHeight - margin;
//    }
//
//    /** Tạo trang portrait nhưng bảng nằm landscape (xoay -90 độ) */
//    private void createNewLandscapePage() throws IOException {
//        page = new PDPage(PDRectangle.A4);
//        doc.addPage(page);
//
//        if (cs != null) cs.close();
//        cs = new PDPageContentStream(doc, page, AppendMode.OVERWRITE, true);
//        cs.saveGraphicsState();
//
//        float offsetX = margin;
//        float offsetY = page.getMediaBox().getHeight() - margin - 20;
//
//        cs.transform(org.apache.pdfbox.util.Matrix.getTranslateInstance(offsetX, offsetY));
//        cs.transform(org.apache.pdfbox.util.Matrix.getRotateInstance(Math.toRadians(-90), 0, 0));
//
//        float originalW = page.getMediaBox().getWidth();
//        float originalH = page.getMediaBox().getHeight();
//
//        pageWidth = originalH - 2 * margin;
//        pageHeight = originalW - 2 * margin;
//        cursorY = pageHeight - margin;
//    }
//
//    /** ==================== PAGE HEIGHT CHECK ==================== */
//
//    private void newPageIfNeeded(float neededHeight) throws IOException {
//        if (cursorY - neededHeight < margin) {
//            if (landscapeMode) createNewLandscapePage();
//            else createNewPage();
//        }
//    }
//
//    /** ==================== TITLE (PORTRAIT NORMAL) ==================== */
//
//    public void title(String text) throws IOException {
//        newPageIfNeeded(25);
//        cs.beginText();
//        cs.setFont(font, 16);
//        cs.newLineAtOffset(margin, cursorY);
//        cs.showText(text);
//        cs.endText();
//        cursorY -= 25;
//    }
//
//    /** ==================== TABLE DRAW ==================== */
//
//    public void drawTable(List<String> headers, List<List<String>> rows) throws IOException {
//        tableHeader(headers);
//        for (List<String> row : rows) {
//            tableRow(row);
//        }
//    }
//
//    public void tableHeader(List<String> headers) throws IOException {
//        int cols = headers.size();
//        float tableWidth = pageWidth - 2 * margin;
//
//        float firstColWidth = tableWidth / 3;
//        float otherColWidth = (tableWidth - firstColWidth) / (cols - 1);
//
//        newPageIfNeeded(rowHeight);
//
//        cs.setNonStrokingColor(new Color(220, 220, 220));
//        cs.addRect(margin, cursorY - rowHeight, tableWidth, rowHeight);
//        cs.fill();
//        cs.setNonStrokingColor(Color.BLACK);
//
//        for (int i = 0; i < headers.size(); i++) {
//            float x = margin;
//            for (int j = 0; j < i; j++) x += (j == 0 ? firstColWidth : otherColWidth);
//
//            float y = cursorY - 15;
//            cs.beginText();
//            cs.setFont(font, 11);
//            cs.newLineAtOffset(x + 2, y);
//            cs.showText(headers.get(i));
//            cs.endText();
//        }
//
//        drawTableBordersWithCustomWidths(cols, firstColWidth, otherColWidth, tableWidth);
//        cursorY -= rowHeight;
//    }
//
//    public void tableRow(List<String> row) throws IOException {
//        int cols = row.size();
//        float tableWidth = pageWidth - 2 * margin;
//
//        float firstColWidth = tableWidth / 3;
//        float otherColWidth = (tableWidth - firstColWidth) / (cols - 1);
//
//        newPageIfNeeded(rowHeight);
//
//        for (int i = 0; i < row.size(); i++) {
//            float x = margin;
//            for (int j = 0; j < i; j++) x += (j == 0 ? firstColWidth : otherColWidth);
//
//            float y = cursorY - 15;
//            cs.beginText();
//            cs.setFont(font, 10);
//            cs.newLineAtOffset(x + 2, y);
//            cs.showText(row.get(i));
//            cs.endText();
//        }
//
//        drawTableBordersWithCustomWidths(cols, firstColWidth, otherColWidth, tableWidth);
//        cursorY -= rowHeight;
//    }
//
//    private void drawTableBordersWithCustomWidths(int cols, float firstColWidth, float otherColWidth, float tableWidth) throws IOException {
//        drawLine(margin, cursorY, margin + tableWidth, cursorY);
//        drawLine(margin, cursorY - rowHeight, margin + tableWidth, cursorY - rowHeight);
//
//        float x = margin;
//        for (int i = 0; i <= cols; i++) {
//            drawLine(x, cursorY, x, cursorY - rowHeight);
//            x += (i == 0 ? firstColWidth : otherColWidth);
//        }
//    }
//
//    /** ==================== LANDSCAPE TABLE WITH TITLE ==================== */
//
//    public void drawTableLandscapeOnPortrait(
//            String title,
//            List<String> headers,
//            List<List<String>> rows
//    ) throws IOException {
//
//        landscapeMode = true;
//        createNewLandscapePage(); // start rotated page
//
//        cs.beginText();
//        cs.setFont(font, 14);
//        float titleWidth = font.getStringWidth(title) / 1000 * 14;
//        float centerX = (pageWidth - titleWidth) / 2;
//        cs.newLineAtOffset(centerX, cursorY);
//        cs.showText(title);
//        cs.endText();
//        cursorY -= 30;
//
//        drawTable(headers, rows);
//
//        landscapeMode = false; // turn back if needed later
//    }
//
//    /** ==================== UTILITY ==================== */
//
//    private void drawLine(float x1, float y1, float x2, float y2) throws IOException {
//        cs.moveTo(x1, y1);
//        cs.lineTo(x2, y2);
//        cs.stroke();
//    }
//
//    public void close() throws IOException {
//        if (cs != null) cs.close();
//    }
//}



package com.ptit.recruitservice.utils;

import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.PDPageContentStream.AppendMode;
import java.awt.Color;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

public class PdfTableHelper {

    private final PDDocument doc;
    private final PDType0Font font;
    private final float margin = 40;
    private final float rowHeight = 20;

    private PDPage page;
    private PDPageContentStream cs;
    private float cursorY;

    private float pageWidth;
    private float pageHeight;

    private boolean landscapeMode = false;
    private boolean pageHasContent = false; // 👉 TRACK

    public PdfTableHelper(PDDocument doc) throws IOException {
        this.doc = doc;
        InputStream fontStream = getClass().getResourceAsStream("/fonts/Lexend-Regular.ttf");
        this.font = PDType0Font.load(doc, fontStream);
        createNewPage();
    }

    /* ==================== PAGE ==================== */

    private void createNewPage() throws IOException {
        // restore nếu đang landscape
        if (cs != null && landscapeMode) {
            try { cs.restoreGraphicsState(); } catch (Exception ignored) {}
            landscapeMode = false;
        }

        if (cs != null) cs.close();

        page = new PDPage(PDRectangle.A4);
        doc.addPage(page);

        cs = new PDPageContentStream(doc, page, AppendMode.OVERWRITE, true);

        pageWidth = page.getMediaBox().getWidth();
        pageHeight = page.getMediaBox().getHeight();
        cursorY = pageHeight - margin;

        pageHasContent = false;
    }

    /** Tạo page landscape mới */
    private void createNewLandscapePage() throws IOException {
        if (cs != null) cs.close();

        page = new PDPage(PDRectangle.A4);
        doc.addPage(page);

        cs = new PDPageContentStream(doc, page, AppendMode.OVERWRITE, true);
        cs.saveGraphicsState();

        float offsetX = margin;
        float offsetY = page.getMediaBox().getHeight() - margin - 20;
        cs.transform(org.apache.pdfbox.util.Matrix.getTranslateInstance(offsetX, offsetY));
        cs.transform(org.apache.pdfbox.util.Matrix.getRotateInstance(Math.toRadians(-90), 0, 0));

        float originalW = page.getMediaBox().getWidth();
        float originalH = page.getMediaBox().getHeight();

        pageWidth = originalH - 2 * margin;
        pageHeight = originalW - 2 * margin;
        cursorY = pageHeight - margin;

        landscapeMode = true;
        pageHasContent = false;
    }

    private void newPageIfNeeded(float neededHeight) throws IOException {
        if (cursorY - neededHeight < margin) {
            if (landscapeMode) createNewLandscapePage();
            else createNewPage();
        }
    }

    /* ==================== TITLE ==================== */

    public void title(String text) throws IOException {
        newPageIfNeeded(25);
        cs.beginText();
        cs.setFont(font, 16);
        cs.newLineAtOffset(margin, cursorY);
        cs.showText(text);
        cs.endText();
        cursorY -= 25;
        pageHasContent = true; // 👉 MARK
    }

    /* ==================== TABLE ==================== */

    public void drawTable(List<String> headers, List<List<String>> rows) throws IOException {
        tableHeader(headers);
        for (List<String> row : rows) tableRow(row);
    }

    public void tableHeader(List<String> headers) throws IOException {
        int cols = headers.size();
        float tableWidth = pageWidth - 2 * margin;
        float firstColWidth = tableWidth / 3;
        float otherColWidth = (tableWidth - firstColWidth) / (cols - 1);

        newPageIfNeeded(rowHeight);

        cs.setNonStrokingColor(new Color(220, 220, 220));
        cs.addRect(margin, cursorY - rowHeight, tableWidth, rowHeight);
        cs.fill();
        cs.setNonStrokingColor(Color.BLACK);

        for (int i = 0; i < headers.size(); i++) {
            float x = margin;
            for (int j = 0; j < i; j++) x += (j == 0 ? firstColWidth : otherColWidth);
            cs.beginText();
            cs.setFont(font, 11);
            cs.newLineAtOffset(x + 2, cursorY - 15);
            cs.showText(headers.get(i));
            cs.endText();
        }

        drawTableBordersWithCustomWidths(cols, firstColWidth, otherColWidth, tableWidth);
        cursorY -= rowHeight;
        pageHasContent = true; // 👉 MARK
    }

    public void tableRow(List<String> row) throws IOException {
        int cols = row.size();
        float tableWidth = pageWidth - 2 * margin;
        float firstColWidth = tableWidth / 3;
        float otherColWidth = (tableWidth - firstColWidth) / (cols - 1);

        newPageIfNeeded(rowHeight);

        for (int i = 0; i < row.size(); i++) {
            float x = margin;
            for (int j = 0; j < i; j++) x += (j == 0 ? firstColWidth : otherColWidth);

            cs.beginText();
            cs.setFont(font, 10);
            cs.newLineAtOffset(x + 2, cursorY - 15);
            cs.showText(row.get(i));
            cs.endText();
        }

        drawTableBordersWithCustomWidths(cols, firstColWidth, otherColWidth, tableWidth);
        cursorY -= rowHeight;
        pageHasContent = true; // 👉 MARK
    }

    private void drawTableBordersWithCustomWidths(int cols, float firstColWidth, float otherColWidth, float tableWidth) throws IOException {
        drawLine(margin, cursorY, margin + tableWidth, cursorY);
        drawLine(margin, cursorY - rowHeight, margin + tableWidth, cursorY - rowHeight);
        float x = margin;
        for (int i = 0; i <= cols; i++) {
            drawLine(x, cursorY, x, cursorY - rowHeight);
            x += (i == 0 ? firstColWidth : otherColWidth);
        }
    }

    /* ==================== LANDSCAPE ==================== */

    public void drawTableLandscapeOnPortrait(
            String title,
            List<String> headers,
            List<List<String>> rows
    ) throws IOException {

        // 👉 Nếu trang TRỐNG thì xoay luôn trang hiện tại (không tạo trang mới)
        if (!pageHasContent && !landscapeMode) {
            cs.saveGraphicsState();

            float offsetX = margin;
            float offsetY = pageHeight - margin - 20;
            cs.transform(org.apache.pdfbox.util.Matrix.getTranslateInstance(offsetX, offsetY));
            cs.transform(org.apache.pdfbox.util.Matrix.getRotateInstance(Math.toRadians(-90), 0, 0));

            float originalW = page.getMediaBox().getWidth();
            float originalH = page.getMediaBox().getHeight();

            pageWidth = originalH - 2 * margin;
            pageHeight = originalW - 2 * margin;
            cursorY = pageHeight - margin;

            landscapeMode = true;
        } else {
            createNewLandscapePage();
        }

        cs.beginText();
        cs.setFont(font, 14);
        float titleWidth = font.getStringWidth(title) / 1000 * 14;
        float centerX = (pageWidth - titleWidth) / 2;
        cs.newLineAtOffset(centerX, cursorY);
        cs.showText(title);
        cs.endText();
        cursorY -= 30;
        pageHasContent = true;

        drawTable(headers, rows);
    }

    /* ==================== UTILITY ==================== */

    private void drawLine(float x1, float y1, float x2, float y2) throws IOException {
        cs.moveTo(x1, y1);
        cs.lineTo(x2, y2);
        cs.stroke();
        pageHasContent = true;
    }

    public void close() throws IOException {
        if (cs != null) {
            if (landscapeMode) {
                try { cs.restoreGraphicsState(); } catch (Exception ignored) {}
            }
            cs.close();
        }
    }
}
