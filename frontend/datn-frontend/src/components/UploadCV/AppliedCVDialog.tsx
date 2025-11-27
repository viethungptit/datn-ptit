import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { exportCV } from '@/api/recruitApi';
import { MINIO_ENDPOINT } from "@/api/serviceConfig";

interface AppliedCVsDialogProps {
    appliedCVs: any[];
    open: boolean;
    onClose: () => void;
}

export default function AppliedCVsDialog({ appliedCVs, open, onClose }: AppliedCVsDialogProps) {

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

    const statusMap: Record<string, { label: string; color: string }> = {
        pending: { label: "Chờ duyệt", color: "text-yellow-500" },
        approved: { label: "Đã duyệt", color: "text-green-600" },
        rejected: { label: "Đã từ chối", color: "text-red-600" },
    };

    const pendingCVs = appliedCVs.filter(app => app.status === "pending");
    const approvedCVs = appliedCVs.filter(app => app.status === "approved");
    const rejectedCVs = appliedCVs.filter(app => app.status === "rejected");

    const renderCVCard = (app: any) => {
        const cv = app.cv;
        return (
            <div key={app.applicationId} className="border rounded p-4 flex flex-col items-center relative">
                <div className="h-32 flex items-center justify-center">
                    <i className="fa-solid fa-file fa-5x text-btn-red"></i>
                </div>

                <span className="font-semibold mb-1 text-center truncate w-[350px]">
                    {cv?.title || "Không có tiêu đề"}
                </span>

                <span className="text-xs text-gray-500 mb-1">
                    Ngày nộp: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('vi-VN') : ''}
                </span>

                <span className="text-sm font-medium mb-2">
                    Trạng thái CV:&nbsp;
                    <span className={`${statusMap[app.status]?.color} font-semibold`}>
                        {statusMap[app.status]?.label}
                    </span>
                </span>

                <button
                    className="absolute bottom-3 right-3 text-gray-700 hover:text-gray-900"
                    onClick={() => handlePreview(app)}
                >
                    <i className="fa-solid fa-eye fa-lg"></i>
                </button>
            </div>
        );
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

                    <TabsContent value="pending" className="py-4 max-h-[500px] overflow-y-auto">
                        {pendingCVs.length === 0 ? (
                            <p>Không có CV chờ duyệt</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {pendingCVs.map(renderCVCard)}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="approved" className="py-4 max-h-[500px] overflow-y-auto">
                        {approvedCVs.length === 0 ? (
                            <p>Chưa có CV nào được duyệt</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {approvedCVs.map(renderCVCard)}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="rejected" className="py-4 max-h-[500px] overflow-y-auto">
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
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
