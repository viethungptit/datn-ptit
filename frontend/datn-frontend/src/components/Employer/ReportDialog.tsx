import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportReports } from '@/api/recruitApi';
import { toast } from 'react-toastify';
import { MINIO_ENDPOINT } from '@/api/serviceConfig';

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onExported?: () => void;
};

const ReportDialog: React.FC<Props> = ({ open, onOpenChange, onExported }) => {
    const now = new Date();
    const [month, setMonth] = useState<number>(now.getMonth() + 1);
    const [year, setYear] = useState<number>(now.getFullYear());
    const [format, setFormat] = useState<string>('excel');
    const [reportType, setReportType] = useState<string>('all');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        const d = new Date();
        setMonth(d.getMonth() + 1);
        setYear(d.getFullYear());
        setFormat('excel');
        setReportType('all');
    }, [open]);

    const handleExport = async () => {
        if (!year || !month) {
            toast.error('Vui lòng chọn tháng và năm');
            return;
        }
        try {
            setSubmitting(true);
            const res = await exportReports(year, month, format, [reportType]);
            const data = res?.data;
            // backend returns FileUploadResponse { url }
            let url: string | undefined;
            if (!data) {
                toast.error('Không nhận được phản hồi từ máy chủ');
            } else if (typeof data === 'string') {
                url = data;
            } else if ((data as any).url) {
                url = (data as any).url;
            } else if ((data as any).fileUrl) {
                url = (data as any).fileUrl;
            }

            if (url) {
                const href = url.startsWith('http') ? url : `${MINIO_ENDPOINT}/datn/${url}`;
                const a = document.createElement('a');
                a.href = href;
                // try to derive filename
                const fileName = href.split('/').pop() || `report-${year}-${month}`;
                a.download = fileName;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                document.body.appendChild(a);
                a.click();
                a.remove();
                toast.success('Tạo báo cáo thành công');
                onExported && onExported();
                onOpenChange(false);
            } else {
                toast.success('Yêu cầu xuất báo cáo đã được gửi');
                onExported && onExported();
                onOpenChange(false);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Xuất báo cáo thất bại';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tạo báo cáo mới</DialogTitle>
                    <DialogDescription>Chọn tháng, năm và định dạng để xuất báo cáo.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 mt-2">
                    <div className="grid grid-cols-2 gap-3 items-end">
                        <div>
                            <Label>Tháng</Label>
                            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[...Array(12)].map((_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Năm</Label>
                            <Input type="number" value={String(year)} onChange={(e) => setYear(Number(e.target.value || 0))} />
                        </div>

                        <div>
                            <Label>Định dạng</Label>
                            <Select value={format} onValueChange={(v) => setFormat(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="excel">Excel</SelectItem>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Loại báo cáo</Label>
                            <Select value={reportType} onValueChange={(v) => setReportType(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Tổng quan hàng tháng</SelectItem>
                                    <SelectItem value="jobPerformance">Hiệu suất công việc</SelectItem>
                                    <SelectItem value="applicants">Danh sách ứng viên</SelectItem>
                                    <SelectItem value="jobEngagement">Các công việc được quan tâm</SelectItem>
                                    <SelectItem value="all">Tổng hợp</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <div className="flex gap-2 w-full justify-end">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                        <Button variant="login" onClick={handleExport} disabled={submitting}>{submitting ? 'Đang xuất báo cáo...' : 'Xuất báo cáo'}</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReportDialog;
