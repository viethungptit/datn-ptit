import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";
import { getReportHistory, deleteReportHistory } from "@/api/recruitApi";
import { getCurrentUserProfile } from "@/api/userApi";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination/Pagination";
import ReportDialog from '@/components/Employer/ReportDialog';

export type ReportItem = {
    id: string;
    reportName: string;
    userId: string;
    reportType: string;
    createdAt: string;
    fileFormat: string;
    fileUrl: string;
};

const REPORT_TYPE = [
    { value: "monthly", label: "Tổng quan hàng tháng" },
    { value: "jobPerformance", label: "Hiệu suất công việc" },
    { value: "applicants", label: "Danh sách ứng viên" },
    { value: "jobEngagement", label: "Các công việc được quan tâm" },
    { value: "all", label: "Tổng hợp" },
];

const REPORT_TYPE_MAP = Object.fromEntries(
    REPORT_TYPE.map(item => [item.value, item.label])
);

const EmployerReports = () => {
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const [reportDialogOpen, setReportDialogOpen] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await getCurrentUserProfile();
            setProfile(res.data);
            setCompanyId(res.data.company?.companyId);
        } catch (err) {
            toast.error("Không thể tải hồ sơ người dùng");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchReports = async (p: number) => {
        setLoading(true);
        try {
            const res = await getReportHistory(p, pageSize);
            const data = res?.data;
            if (!data) {
                setReports([]);
                setTotalPages(1);
                return;
            }
            setReports(data.content || []);
            setTotalPages(data.totalPages || 1);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Không thể tải lịch sử báo cáo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports(page);
    }, [page, pageSize]);

    const getMinioUrl = (fileUrl: string) => `${MINIO_ENDPOINT}/datn/${fileUrl}`;

    const triggerDownload = (fileUrl: string) => {
        const href = getMinioUrl(fileUrl);
        const fileName = fileUrl.split('/').pop() || 'report';
        const a = document.createElement('a');
        a.href = href;
        a.download = fileName;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const handleDelete = async (id: string) => {
        const ok = window.confirm('Bạn có chắc muốn xóa báo cáo này không?');
        if (!ok) return;
        setLoading(true);
        try {
            await deleteReportHistory(id);
            toast.success('Xóa báo cáo thành công');
            // refresh current page
            fetchReports(page);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Xóa thất bại';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!profile?.employer?.admin)
        return (
            <div className="text-center py-10">
                <h1 className="mb-4">Bạn không có quyền truy cập</h1>
                <Button onClick={() => navigate("/employer/profile")}>Trở về</Button>
            </div>
        );

    if (!companyId)
        return (
            <div className="text-center py-10">
                <h1 className="mb-4">Hồ sơ của bạn chưa được xác thực</h1>
                <Button onClick={() => navigate("/employer/profile")}>Xem thông tin</Button>
            </div>
        );

    if (profile?.employer?.status !== 'VERIFIED')
        return (
            <div className="text-center py-10">
                <h1 className="mb-4">Hồ sơ của bạn chưa được xác thực</h1>
                <Button onClick={() => navigate("/employer/profile")}>Xem thông tin</Button>
            </div>
        );

    if (profile?.company?.deleted === true)
        return (
            <div className="text-center py-10">
                <h1 className="mb-4">Công ty của bạn đã giải thể</h1>
                <Button onClick={() => navigate("/employer/profile")}>Xem thông tin</Button>
            </div>
        );

    return (
        <div className="px-4 py-2 relative min-h-screen">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Báo cáo hàng tháng</h2>
                <Button size="sm" variant="login" onClick={() => setReportDialogOpen(true)}>
                    Tạo báo cáo mới
                </Button>
            </div>
            <div className="border rounded-lg overflow-x-auto">
                <Table className="text-sm text-gray-700">
                    <TableHeader>
                        <TableHead>Tên báo cáo</TableHead>
                        <TableHead className="text-center">Loại báo cáo</TableHead>
                        <TableHead className="text-center">Định dạng</TableHead>
                        <TableHead className="text-center">Ngày tạo</TableHead>
                        <TableHead className="text-center">Hành động</TableHead>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} className="text-center">Đang tải...</TableCell></TableRow>
                        ) : reports.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center">Không có dữ liệu</TableCell></TableRow>
                        ) : (
                            reports.map(r => (
                                <TableRow key={r.id}>
                                    <TableCell className="text-left py-6">{r.reportName}</TableCell>
                                    <TableCell className="text-center">{r.reportType ? (REPORT_TYPE_MAP[r.reportType] || '') : ''}</TableCell>
                                    <TableCell className="text-center">{r.fileFormat.toUpperCase()}</TableCell>
                                    <TableCell className="text-center">{new Date(r.createdAt).toLocaleString('vi-VN')}</TableCell>
                                    <TableCell className="text-center">
                                        {r.fileUrl ? (
                                            <div className="flex justify-center gap-2">
                                                <Button variant="login" size="sm"
                                                    className="text-sm text-white px-3 py-1 rounded"
                                                    onClick={() => triggerDownload(r.fileUrl)}
                                                >
                                                    Tải xuống
                                                </Button>
                                                <Button variant="login" size="sm" className="text-sm px-3 py-1 rounded" onClick={() => handleDelete(r.id)}>
                                                    Xóa
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">Không có</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="absolute bottom-3 right-0 left-0">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
            </div>
            <ReportDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen} onExported={() => fetchReports(page)} />
        </div>
    );
};

export default EmployerReports;
