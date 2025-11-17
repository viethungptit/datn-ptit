import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { toast } from 'react-toastify';
import { getAllLogsApi } from '@/api/adminApi';

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

    const load = async () => {
        setLoading(true);
        try {
            const res = await getAllLogsApi();
            setLogs(res?.data ?? []);
        } catch (err) {
            console.error(err);
            toast.error('Không tải được danh sách logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-base font-semibold">Quản lý mẫu thông báo</h1>
            </div>

            <div className="overflow-x-auto border bg-white rounded-md shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã người dùng</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead className="text-center">Ngày tạo</TableHead>
                            <TableHead className="text-center">Hành động</TableHead>
                            <TableHead className="text-center">Mô tả</TableHead>
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
                                <TableCell className="px-4 py-3 align-top max-w-xs break-words text-left">{t.actorId}</TableCell>
                                <TableCell className="px-4 py-3 align-top max-w-xs break-words text-left">{t.actorRole}</TableCell>
                                <TableCell className="px-4 py-3 align-top text-center">{t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}</TableCell>
                                <TableCell className="px-4 py-3 align-top text-center">{t.action}</TableCell>
                                <TableCell className="px-4 py-3 align-top max-w-xs break-words text-left">{t.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default LogsUI;
