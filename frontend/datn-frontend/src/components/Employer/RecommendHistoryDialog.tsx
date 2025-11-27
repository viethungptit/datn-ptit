import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { listRecommendBatches, getJobMatch, getRecommendBatch } from '@/api/recommendApi';
import { exportCV, getApplicationsByJob, updateApplicationStatus } from '@/api/recruitApi';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { MINIO_ENDPOINT } from '@/api/serviceConfig';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jobId: string | null;
    recommendNameJobForDialog?: string | null;
}

const RecommendHistoryDialog: React.FC<Props> = ({ open, onOpenChange, jobId, recommendNameJobForDialog }) => {
    const [loading, setLoading] = useState(false);
    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [batchDetails, setBatchDetails] = useState<any | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [running, setRunning] = useState(false);
    const [applications, setApplications] = useState<any[]>([]);
    const statusMap: Record<string, { label: string; color: string }> = {
        pending: { label: 'Chờ duyệt', color: 'text-yellow-500' },
        approved: { label: 'Đã duyệt', color: 'text-green-600' },
        rejected: { label: 'Đã từ chối', color: 'text-red-600' },
    };

    useEffect(() => {
        if (!open) return;
        if (!jobId) return;
        (async () => {
            setLoading(true);
            try {
                const res = await listRecommendBatches(jobId);
                setBatches(res?.data || []);
            } catch (err: any) {
                const msg = err?.response?.data?.message || err?.message || 'Không thể tải lịch sử lọc';
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        })();
    }, [open, jobId]);

    const handleSelect = async (batchId: string) => {
        setSelectedBatchId(batchId);
        const found = batches.find((b: any) => (b.batch_id ?? b.batchId) === batchId);
        // show summary immediately if available
        setBatchDetails(found || null);

        // fetch full detail from detail API
        try {
            setDetailLoading(true);
            const res = await getRecommendBatch(batchId);
            // API may return data in `data` or directly
            setBatchDetails(res?.data || res || null);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Không thể tải chi tiết lần đề xuất';
            toast.error(msg);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        // When a batch is selected, fetch applications for the job so we can map status/appliedAt
        if (!selectedBatchId) return;
        if (!jobId) return;
        (async () => {
            try {
                const res = await getApplicationsByJob(jobId);
                setApplications((res?.data) || []);
            } catch (err: any) {
                // don't block UI, but show a toast
                const msg = err?.response?.data?.message || err?.message || 'Không thể tải ứng dụng cho công việc';
                toast.error(msg);
            }
        })();
    }, [selectedBatchId, jobId]);

    const handleStatusChange = async (applicationId: string, status: string) => {
        try {
            await updateApplicationStatus(applicationId, { status });
            toast.success(status === 'approved' ? 'Đã duyệt' : 'Đã từ chối');
            if (jobId) {
                const res = await getApplicationsByJob(jobId);
                setApplications((res?.data) || []);
            }
        } catch (err: any) {
            console.error('Update status error:', err);
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    const handleRun = async () => {
        if (!jobId) return;
        try {
            setRunning(true);
            const res = await getJobMatch(jobId, 20);
            const newBatch = res?.data;
            if (newBatch) {
                setBatchDetails(newBatch);
                setBatches(prev => [newBatch, ...prev]);
                toast.success('Chạy lọc AI thành công');
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Chạy lọc AI thất bại';
            toast.error(msg);
        } finally {
            setRunning(false);
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw]">
                <DialogHeader>
                    <DialogTitle>Lịch sử đề xuất vị trí: {recommendNameJobForDialog}</DialogTitle>
                    <DialogDescription>Hiển thị các lần đề xuất CV bởi AI</DialogDescription>
                </DialogHeader>

                <div className="flex justify-start">
                    <Button className='w-[230px]' size="default" variant="login" onClick={handleRun} disabled={running}>{running ? 'Đang chạy...' : 'Tạo đề xuất mới'}</Button>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-6">Đang tải...</div>
                    ) : batches.length === 0 ? (
                        <div className="text-center py-6">
                            <p>Chưa có lần đề xuất AI nào.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-4">
                            <div>
                                <ul className='max-h-[600px] overflow-y-auto'>
                                    {batches.map((b: any) => {
                                        const id = b.batch_id ?? b.batchId;
                                        const created = b.created_at ?? b.createdAt;
                                        return (
                                            <li key={id} className={`p-3 mb-2 shadow-md cursor-pointer ${selectedBatchId === id ? 'bg-gray-100' : ''}`} onClick={() => handleSelect(id)}>
                                                <div className="text-base font-medium">{created ? new Date(created).toLocaleString() : id}</div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            <div className="col-span-6 max-h-[550px] overflow-y-auto">
                                {detailLoading ? (
                                    <div className='w-full text-center'>Đang tải...</div>
                                ) : batchDetails ? (
                                    <div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-left">
                                                <thead>
                                                    <tr>
                                                        <th className="px-4 py-2 text-sm ">Tên CV</th>
                                                        <th className="px-4 py-2 text-sm text-center">Độ tương thích</th>
                                                        <th className="px-4 py-2 text-sm ">Trạng thái</th>
                                                        <th className="px-4 py-2 text-sm ">Ngày ứng tuyển</th>
                                                        <th className="px-4 py-2 text-sm ">Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white">
                                                    {(batchDetails.results || batchDetails.data || []).length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} className="py-4 text-center text-sm">
                                                                Không có dữ liệu
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        (batchDetails.results || batchDetails.data || []).map((r: any) => {
                                                            console.log('Processing recommendation record', r);
                                                            const app = applications.find((a: any) => a.applicationId === r.application_id);
                                                            const status = app?.status;
                                                            console.log('Application found for CV', app);
                                                            const applied = app?.appliedAt ?? app?.applied_at ?? r.applied_at ?? r.appliedAt;
                                                            return (
                                                                <tr key={r.cv_id ?? r.cv?.cvId} className="border-t">
                                                                    <td className="px-4 py-3 text-sm font-medium">
                                                                        {r.cv?.title ?? r.cv?.dataJson?.name ?? r.cv_id}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-center">
                                                                        {(r.score ?? r.similarity) !== undefined
                                                                            ? `${((r.score ?? r.similarity) * 100).toFixed(1)}%`
                                                                            : ''}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        <span className={`${statusMap[status]?.color ?? 'text-gray-600'} font-semibold`}>{statusMap[status]?.label ?? status}</span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        {applied ? new Date(applied).toLocaleString() : ''}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm w-64">
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="text-gray-700 hover:text-gray-900"
                                                                                onClick={() => handlePreview(r)}
                                                                                title="Xem trước"
                                                                            >
                                                                                <i className="fa-solid fa-eye"></i> Xem
                                                                            </Button>

                                                                            {app && app.status === 'pending' && (
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
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex justify-center items-center text-base text-center w-full">Chọn một lần đề xuất để xem chi tiết</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Đóng</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RecommendHistoryDialog;
