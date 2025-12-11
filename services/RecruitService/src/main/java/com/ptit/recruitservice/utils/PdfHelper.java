package com.ptit.recruitservice.utils;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.PDPageContentStream.AppendMode;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

public class PdfHelper {

    private final PDDocument doc;
    private final PDType0Font font;
    private final float margin = 40;
    private final float lineHeight = 16;
    private PDPage page;
    private PDPageContentStream cs;
    private float cursorY;

    public PdfHelper(PDDocument doc) throws IOException {
        this.doc = doc;

        InputStream fontStream = getClass().getResourceAsStream("/fonts/Lexend-Regular.ttf");
        this.font = PDType0Font.load(doc, fontStream);

        newPage();
    }

    private void newPage() throws IOException {
        if (cs != null) cs.close();

        page = new PDPage(PDRectangle.A4);
        doc.addPage(page);
        cursorY = page.getMediaBox().getHeight() - margin;

        cs = new PDPageContentStream(doc, page, AppendMode.OVERWRITE, true);
    }

    // ---------- TEXT ----------
    public void title(String text) throws IOException {
        writeLine(text, 16, 0);
        cursorY -= 10;
    }

    public void subtitle(String text) throws IOException {
        writeLine(text, 13, 0);
        cursorY -= 5;
    }

    public void write(String text) throws IOException {
        writeLine(text, 11, 0);
    }

    private void writeLine(String text, int fontSize, float indent) throws IOException {
        if (cursorY < margin) newPage();

        cs.beginText();
        cs.setFont(font, fontSize);
        cs.newLineAtOffset(margin + indent, cursorY);
        cs.showText(text);
        cs.endText();

        cursorY -= lineHeight;
    }

    // ---------- TABLE ----------
    public void tableHeader(List<String> columns) throws IOException {
        writeLine(String.join(" | ", columns), 11, 0);
    }

    public void tableRow(List<String> cells) throws IOException {
        writeLine(String.join(" | ", cells), 10, 0);
    }

    public void close() throws IOException {
        if (cs != null) cs.close();
    }
}

