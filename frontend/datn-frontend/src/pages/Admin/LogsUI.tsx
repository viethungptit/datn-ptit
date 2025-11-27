import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { toast } from 'react-toastify';
import { getAllLogsApiWithPagination } from '@/api/adminApi';
import Pagination from '@/components/Pagination/Pagination';

type Logs = {
    id: string;
    actorId: string;
    actorRole: string;
    action: string;
    targetType: string;
    targetId: string;
    description: string;
    createdAt: string;
};

const LogsUI: React.FC = () => {
    const [logs, setLogs] = useState<Logs[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const load = async () => {
        setLoading(true);
        try {
            const res = await getAllLogsApiWithPagination(page, pageSize);
            if (!res || !res.data) throw new Error("Failed to fetch logs");
            setLogs(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
            toast.error('Không tải được danh sách logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [page, pageSize]);

    return (
        <div className="px-4 py-2 relative min-h-screen">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-base font-semibold">Quản lý mẫu thông báo</h1>
            </div>

            <div className="overflow-x-auto border bg-white rounded-md shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-left w-[20%]">Hành động</TableHead>
                            <TableHead className="text-left w-[5%]">Vai trò</TableHead>
                            <TableHead className="text-center w-[15%]">Ngày tạo</TableHead>
                            <TableHead className="text-center w-[60%]">Mô tả</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Đang tải...</TableCell>
                            </TableRow>
                        ) : null}

                        {!loading && logs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Không có dữ liệu</TableCell>
                            </TableRow>
                        )}

                        {logs.map((t) => (
                            <TableRow key={t.id} className="border-t">
                                <TableCell className="px-4 py-5 align-top text-left w-[20%]">{t.action}</TableCell>
                                <TableCell className="px-4 py-5 align-top max-w-xs break-words text-left w-[5%]">{t.actorRole}</TableCell>
                                <TableCell className="px-4 py-5 align-top text-center w-[15%]">{t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}</TableCell>
                                <TableCell className="px-4 py-5 align-top max-w-xs break-words text-left w-[60%]">{t.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="absolute bottom-3 right-0 left-0">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
            </div>
        </div>
    );
};

export default LogsUI;
