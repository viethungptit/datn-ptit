import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import {
    exportCV,
    getApplicationsByJob,
    updateApplicationStatus,
} from "@/api/recruitApi";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";

interface AppliedCVsDialogProps {
    jobId: string;
    open: boolean;
    onClose: () => void;
    role: "admin" | "employer";
}

export default function EmployerAppliedCVsDialog({
    jobId,
    open,
    onClose,
    role,
}: AppliedCVsDialogProps) {
    const [appliedCVs, setAppliedCVs] = useState<any[]>([]);

    const fetchAppliedCVs = async () => {
        try {
            const res = await getApplicationsByJob(jobId);
            setAppliedCVs(res.data);
        } catch (error) {
            console.error("Failed to fetch applied CVs", error);
            toast.error("Không tải được danh sách CV đã nộp");
        }
    };

    useEffect(() => {
        if (open) fetchAppliedCVs();
    }, [open]);

    // --- Preview ---
    const handlePreview = (application: any) => {
        const cv = application.cv;
        if (!cv) {
            toast.error("Không có dữ liệu CV");
            return;
        }
        if (cv.sourceType === "system") {
            const url = `/preview-cvs/${cv.cvId}`;
            window.open(url, '_blank');
            return;
        }
        handlePrintClick(cv.cvId);
    };

    const handlePrintClick = async (cvId: string) => {
        try {
            const res = await exportCV(cvId);
            const pdfUrl = MINIO_ENDPOINT + "/datn/" + res.data.fileUrl;
            if (pdfUrl) {
                window.open(pdfUrl, "_blank");
            } else {
                toast.error("Không tìm thấy file xem trước");
            }
        } catch (error) {
            console.error("Error exporting CV:", error);
            toast.error("Xem trước thất bại");
        }
    };

    // --- Update status ---
    const handleStatusChange = async (applicationId: string, status: string) => {
        try {
            await updateApplicationStatus(applicationId, { status });
            toast.success(status === "approved" ? "Đã duyệt" : "Đã từ chối");
            fetchAppliedCVs();
        } catch (error) {
            console.error("Update status error:", error);
            toast.error("Không thể cập nhật trạng thái");
        }
    };

    // --- Lọc theo trạng thái ---
    const pendingCVs = appliedCVs.filter((app) => app.status === "pending");
    const approvedCVs = appliedCVs.filter((app) => app.status === "approved");
    const rejectedCVs = appliedCVs.filter((app) => app.status === "rejected");
    const statusMap: Record<string, { label: string; color: string }> = {
        pending: { label: "Chờ duyệt", color: "text-yellow-500" },
        approved: { label: "Đã duyệt", color: "text-green-600" },
        rejected: { label: "Đã từ chối", color: "text-red-600" },
    };
    const renderTableRows = (apps: any[]) => {
        if (!apps || apps.length === 0) return (
            <tr>
                <td colSpan={4} className="py-4 text-center text-sm text-gray-500">Không có dữ liệu</td>
            </tr>
        );

        return apps.map((app) => {
            const cv = app.cv;
            return (
                <tr key={app.applicationId} className="border-t">
                    <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-800">{cv?.title || 'Không có tiêu đề'}</div>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('vi-VN') : ''}
                    </td>

                    <td className="px-4 py-3 text-sm">
                        <div>
                            <span className={`${statusMap[app.status]?.color} font-semibold`}>{statusMap[app.status]?.label}</span>
                        </div>
                    </td>

                    <td className="px-4 py-3 text-sm w-64">
                        <div className="flex items-center justify-between gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-gray-700 hover:text-gray-900"
                                onClick={() => handlePreview(app)}
                                title="Xem trước"
                            >
                                <i className="fa-solid fa-eye"></i> Xem
                            </Button>
                            <div>
                                {(role === 'employer' || role === 'admin') && app.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button size="sm">✔ Duyệt</Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-48">
                                                <p className="text-sm mb-3">Xác nhận duyệt CV này?</p>
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" onClick={() => handleStatusChange(app.applicationId, 'approved')}>Duyệt</Button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="destructive" size="sm">✖ Từ chối</Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-48">
                                                <p className="text-sm mb-3">Xác nhận từ chối CV này?</p>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="destructive" size="sm" onClick={() => handleStatusChange(app.applicationId, 'rejected')}>Từ chối</Button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}

                                {(role !== 'employer' && role !== 'admin') && (
                                    <div className="text-sm text-gray-600">&nbsp;</div>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            );
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl">
                <DialogHeader>
                    <DialogTitle>Danh sách CV đã nộp</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
                        <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
                        <TabsTrigger value="rejected">Đã từ chối</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="py-4 max-h-[75vh] overflow-y-auto">
                        {pendingCVs.length === 0 ? (
                            <p>Không có CV chờ duyệt</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-sm text-gray-500">Tiêu đề</th>
                                            <th className="px-4 py-2 text-sm text-gray-500">Ngày nộp</th>
                                            <th className="px-4 py-2 text-sm text-gray-500">Trạng thái</th>
                                            <th className="px-4 py-2 text-sm text-gray-500">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {renderTableRows(pendingCVs)}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="approved" className="py-4">
                        {approvedCVs.length === 0 ? (
                            <p>Chưa có CV nào được duyệt</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-sm text-gray-500">Tiêu đề</th>
                                            <th className="px-4 py-2 text-sm text-gray-500">Ngày nộp</th>
                                            <th className="px-4 py-2 text-sm text-gray-500">Trạng thái</th>
                                            <th className="px-4 py-2 text-sm text-gray-500">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {renderTableRows(approvedCVs)}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="rejected" className="py-4">
                        {rejectedCVs.length === 0 ? (
                            <p>Chưa có CV nào bị từ chối</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-sm text-gray-500">Tiêu đề</th>
                                            <th className="px-4 py-2 text-sm text-gray-500">Ngày nộp</th>
                                            <th className="px-4 py-2 text-sm text-gray-500">Xem</th>
                                            <th className="px-4 py-2 text-sm text-gray-500">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {renderTableRows(rejectedCVs)}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
