import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();

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
            navigate(`/preview-cvs/${cv.cvId}`);
            return;
        }
        handlePrintClick(cv.cvId);
    };

    const handlePrintClick = async (cvId: string) => {
        try {
            const res = await exportCV(cvId);
            const pdfUrl = res.data.fileUrl;
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
    const renderCVCard = (app: any) => {
        const cv = app.cv;
        return (
            <div
                key={app.applicationId}
                className="border rounded p-4 flex flex-col items-center relative"
            >
                <div className="h-32 flex items-center justify-center">
                    <i className="fa-solid fa-file fa-5x text-btn-red"></i>
                </div>

                <span className="font-semibold mb-1 text-center">
                    {cv?.title || "Không có tiêu đề"}
                </span>

                <span className="text-xs text-gray-500 mb-1">
                    Ngày nộp:{" "}
                    {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString("vi-VN")
                        : ""}
                </span>
                <div className="mt-2 w-full flex justify-center mb-1">
                    <button
                        className="text-gray-700 hover:text-gray-900"
                        onClick={() => handlePreview(app)}
                    >
                        <i className="fa-solid fa-eye fa-lg"></i>
                    </button>
                </div>
                {(role === "employer" || role === 'admin') && (
                    <div className="text-sm font-medium mb-2">
                        Trạng thái:&nbsp;
                        <span className={`${statusMap[app.status]?.color} font-semibold`}>
                            {statusMap[app.status]?.label}
                        </span>

                        {app.status === "pending" && (
                            <div className="flex gap-2 mt-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button size="sm">✔ Duyệt</Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-48">
                                        <p className="text-sm mb-3">Xác nhận duyệt CV này?</p>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm">Hủy</Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleStatusChange(app.applicationId, "approved")}
                                            >
                                                Duyệt
                                            </Button>
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
                                            <Button variant="outline" size="sm">Hủy</Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleStatusChange(app.applicationId, "rejected")}
                                            >
                                                Từ chối
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    </div>
                )}

                {(role !== "employer" && role !== 'admin') && (
                    <span className="text-sm font-medium mb-2">
                        Trạng thái CV:&nbsp;
                        <span className={`${statusMap[app.status]?.color} font-semibold`}>
                            {statusMap[app.status]?.label}
                        </span>
                    </span>
                )}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Danh sách CV đã nộp</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
                        <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
                        <TabsTrigger value="rejected">Đã từ chối</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="py-4">
                        {pendingCVs.length === 0 ? (
                            <p>Không có CV chờ duyệt</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {pendingCVs.map(renderCVCard)}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="approved" className="py-4">
                        {approvedCVs.length === 0 ? (
                            <p>Chưa có CV nào được duyệt</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {approvedCVs.map(renderCVCard)}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="rejected" className="py-4">
                        {rejectedCVs.length === 0 ? (
                            <p>Chưa có CV nào bị từ chối</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {rejectedCVs.map(renderCVCard)}
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
