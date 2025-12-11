package com.ptit.recruitservice.enums;

public enum ReportType {
    MONTHLY("monthly", "tổng quan hàng tháng"),
    JOB_PERFORMANCE("jobPerformance", "hiệu suất công việc"),
    APPLICANTS("applicants", "danh sách ứng viên"),
    JOB_ENGAGEMENT("jobEngagement", "công việc được quan tâm"),
    ALL("all", "tổng hợp");

    private final String key;
    private final String vn;

    ReportType(String key, String vn) { this.key = key; this.vn = vn; }
    public String key() { return key; }
    public String vn() { return vn; }
    public static ReportType fromKey(String k) {
        if (k == null) return ALL;
        String v = k.trim().toLowerCase();
        for (ReportType t : values()) if (t.key.equals(v)) return t;
        throw new IllegalArgumentException("Unknown report key: " + k);
    }
}
