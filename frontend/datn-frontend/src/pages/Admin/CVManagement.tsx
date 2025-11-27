import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { toast } from "react-toastify";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";
import { deleteCV, getAllCVsWithPagination, retryEmbeddingCV } from "@/api/recruitApi";
import { getUserByIdApi } from "@/api/userApi";
import Pagination from "@/components/Pagination/Pagination";

export type CV = {
    cvId: string;
    userId: string;
    sourceType: string | null;
    templateId?: string | null;
    dataJson?: any;
    fileUrl?: string | null;
    title?: string;
    statusEmbedding?: string;
    createdAt?: string;
    deleted?: boolean;
};

const SOURCE_OPTIONS = [
    { value: 'system', label: 'Mẫu hệ thống' },
    { value: 'upload', label: 'Tải lên' },
];

const STATUS_EMBEDDING = [
    { value: "pending", label: "Đang chờ" },
    { value: "embedded", label: "Hoàn tất" },
    { value: "failed", label: "Thất bại" },
];


const SOURCE_MAP = Object.fromEntries(
    SOURCE_OPTIONS.map(item => [item.value, item.label])
);

const STATUS_EMBEDDING_MAP = Object.fromEntries(
    STATUS_EMBEDDING.map(item => [item.value, item.label])
);

const CVManagement = () => {
    const [templates, setTemplates] = useState<CV[]>([]);
    const [loading, setLoading] = useState(false);
    const [userEmails, setUserEmails] = useState<Record<string, string>>({});
    const [retryingEmbeddingsCV, setRetryingEmbeddingsCV] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const previewCV = (cvId: string) => {
        const url = `/preview-cvs/${cvId}`;
        window.open(url, '_blank');
    };

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await getAllCVsWithPagination(page, pageSize);
                if (!res || !res.data) throw new Error("Failed to fetch cvs");
                const cvs = res.data.content;
                setTemplates(cvs);
                setTotalPages(res.data.totalPages)
                const ids = Array.from(new Set((cvs || []).map((x: any) => x.userId).filter(Boolean))) as string[];
                if (ids.length > 0) {
                    const promises = ids.map((id: string) =>
                        getUserByIdApi(id)
                            .then(r => ({ id, email: r?.data?.email }))
                            .catch(() => ({ id, email: undefined }))
                    );
                    const results = await Promise.all(promises);
                    const map: Record<string, string> = {};
                    results.forEach((r: any) => {
                        if (r?.email) map[r.id] = r.email;
                    });
                    setUserEmails(map);
                }
            } catch (err: any) {
                const msg = err?.response?.data?.message || err?.message || "Không thể tải danh sách CV";
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        })();
    }, [page, pageSize]);

    const handleDelete = async (cvId: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa CV này?")) return;
        try {
            await deleteCV(cvId);
            setTemplates(prev => prev.filter(c => c.cvId !== cvId));
            toast.success("Đã xóa CV");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Xóa thất bại";
            toast.error(msg);
        }
    };

    const handleRetryEmbeddingCV = async (cvId: string) => {
        try {
            setRetryingEmbeddingsCV(prev => Array.from(new Set([...prev, cvId])));
            const res = await retryEmbeddingCV(cvId);
            const updated = res?.data;
            if (updated) {
                setTemplates(prev => prev.map(t => (t.cvId === cvId ? { ...t, ...updated } : t)));
            }
            toast.success('Khởi chạy lại embedding CV thành công');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Khởi chạy lại embedding CV thất bại';
            toast.error(msg);
        } finally {
            setRetryingEmbeddingsCV(prev => prev.filter(id => id !== cvId));
        }
    };

    const viewCVFile = (c: CV) => {
        if (c.fileUrl) {
            const url = `${MINIO_ENDPOINT}/datn/${c.fileUrl}`;
            window.open(url, '_blank');
            return;
        }
        else {
            previewCV(c.cvId);
        }
    };

    return (
        <div className="px-4 py-2 relative min-h-screen">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold pb-1">Quản lý CV</h2>
            </div>
            <div className="border rounded-lg overflow-x-auto">
                <Table className="text-sm text-gray-700">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-left">Tên CV</TableHead>
                            <TableHead className="text-left">Email người dùng</TableHead>
                            <TableHead className="text-center">Thể loại</TableHead>
                            <TableHead className="text-center">Trạng thái phân tích</TableHead>
                            <TableHead className="text-center">Ngày tạo</TableHead>
                            <TableHead className="text-center">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">Đang tải...</TableCell>
                            </TableRow>
                        ) : templates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">Không có dữ liệu</TableCell>
                            </TableRow>
                        ) : (
                            templates.map((c) => (
                                <TableRow key={c.cvId}>
                                    <TableCell className="text-left py-6">{c.title}</TableCell>
                                    <TableCell className="text-left">{userEmails[c.userId] || c.userId}</TableCell>
                                    <TableCell className="text-center">{SOURCE_MAP[c.sourceType || ''] || ''}</TableCell>
                                    <TableCell className="text-center">
                                        {STATUS_EMBEDDING_MAP[c.statusEmbedding || ''] || ''}
                                        {c.statusEmbedding === 'failed' && (
                                            <i
                                                role="button"
                                                aria-label="Retry embedding CV"
                                                title="Khởi chạy lại embedding CV"
                                                onClick={() => handleRetryEmbeddingCV(c.cvId)}
                                                className={`ml-1 fa-lg fa-solid fa-arrows-rotate cursor-pointer hover:animate-spin ${retryingEmbeddingsCV.includes(c.cvId) ? 'animate-spin' : ''}`}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : ''}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex gap-2 w-full justify-center">
                                            <Button size="sm" variant="outline" onClick={() => viewCVFile(c)}>Xem</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(c.cvId)}>Xóa</Button>
                                        </div>
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
        </div>
    );
};

export default CVManagement;
