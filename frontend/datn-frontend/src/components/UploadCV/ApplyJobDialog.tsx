import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { applyForJob, exportCV, getCVMe } from '@/api/recruitApi';
import { toast } from "react-toastify";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";

export type CVItem = {
    cvId: string;
    title: string;
    createdAt: string;
    statusEmbedding: string;
    sourceType: 'system' | 'upload';
};

interface ApplyJobDialogProps {
    isAuthenticated: boolean;
    jobId: string;
    open: boolean;
    onClose: () => void;
}

export default function ApplyJobDialog({ isAuthenticated, open, onClose, jobId }: ApplyJobDialogProps) {
    const [selectedCVs, setSelectedCVs] = useState<string[]>([]);
    const [templateCVs, setTemplateCVs] = useState<CVItem[]>([]);
    const [uploadedCVList, setUploadedCVList] = useState<CVItem[]>([]);

    const toggleSelect = (cvId: string) => {
        if (selectedCVs.includes(cvId)) {
            setSelectedCVs([]);
        } else {
            if (selectedCVs.length >= 1) {
                toast.error("Chỉ được chọn 1 CV để ứng tuyển!");
                return;
            }
            setSelectedCVs([cvId]);
        }
    };

    const uploadCV = async () => {
        if (selectedCVs.length === 0) {
            toast.error("Vui lòng chọn một CV để ứng tuyển!");
            return;
        }
        if (selectedCVs.length > 1) {
            toast.error("Chỉ được chọn 1 CV để ứng tuyển!");
            return;
        }

        try {
            const cvId = selectedCVs[0];
            await applyForJob({ jobId, cvId });
            toast.success("Ứng tuyển thành công!");
            setSelectedCVs([]);
            onClose();
        } catch (error: any) {
            console.error("Error applying for job:", error);
            toast.error(error?.message || "Ứng tuyển thất bại!");
        }
    };

    const fetchTemplateCVs = async () => {
        const res = await getCVMe('system');
        setTemplateCVs(res.data);
    };

    const fetchUploadedCVs = async () => {
        const res = await getCVMe('upload');
        setUploadedCVList(res.data);
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

    const handlePreview = (cv: CVItem) => {
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

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchTemplateCVs();
        fetchUploadedCVs();
    }, [isAuthenticated]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Ứng tuyển công việc</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    <div className='shadow-md p-4 rounded-md border'>
                        <h2 className="text-lg font-bold mb-3">CV theo mẫu</h2>
                        <div className="grid grid-cols-3 gap-4 overflow-y-auto max-h-[250px]">
                            {templateCVs.length === 0 ? <p>Chưa có CV nào</p> : (
                                templateCVs.map(cv => (
                                    <div key={cv.cvId} className="border rounded p-4 flex flex-col items-center relative">
                                        <div className="h-20 flex items-center justify-center">
                                            <i className="fa-solid fa-file fa-3x text-btn-red"></i>
                                        </div>
                                        <span className="font-semibold mb-2 text-center line-clamp-2 w-[280px]">{cv.title}</span>
                                        <span className="text-xs text-gray-500 mb-2">Ngày tạo: {new Date(cv.createdAt).toLocaleDateString('vi-VN')}</span>
                                        <button
                                            className="absolute bottom-3 right-3 text-gray-700 hover:text-gray-900"
                                            onClick={() => handlePreview(cv)}
                                        >
                                            <i className="fa-solid fa-eye fa-lg"></i>
                                        </button>
                                        <div className="absolute top-2 right-2">
                                            <Checkbox checked={selectedCVs.includes(cv.cvId)} onCheckedChange={() => toggleSelect(cv.cvId)} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className='shadow-md p-4 rounded-md border'>
                        <h2 className="text-lg font-bold mb-3">CV tải lên từ máy tính</h2>
                        <div className="grid grid-cols-3 gap-4 overflow-y-auto max-h-[250px]">
                            {uploadedCVList.length === 0 ? <p>Chưa có CV nào</p> : (
                                uploadedCVList.map(cv => (
                                    <div key={cv.cvId} className="border rounded p-4 flex flex-col items-center relative">
                                        <div className="h-20 flex items-center justify-center">
                                            <i className="fa-solid fa-folder-open fa-3x text-btn-red"></i>
                                        </div>
                                        <span className="font-semibold mb-2 text-center line-clamp-2 w-[280px]">{cv.title}</span>
                                        <span className="text-xs text-gray-500 mb-2">Ngày tạo: {new Date(cv.createdAt).toLocaleDateString('vi-VN')}</span>
                                        <button
                                            className="absolute bottom-3 right-3 text-gray-700 hover:text-gray-900"
                                            onClick={() => handlePreview(cv)}
                                        >
                                            <i className="fa-solid fa-eye fa-lg"></i>
                                        </button>
                                        <div className="absolute top-2 right-2">
                                            <Checkbox checked={selectedCVs.includes(cv.cvId)} onCheckedChange={() => toggleSelect(cv.cvId)} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button variant="login" onClick={uploadCV}>Ứng tuyển</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
