import React, { useEffect, useState } from 'react';
import { deleteEmailDelivery, retrySendEmailDelivery, getAllEmailDeliveriesApiWithPagination } from '@/api/notificationApi';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import Pagination from '@/components/Pagination/Pagination';

type EmailDelivery = {
    emailDeliId: string;
    email: string;
    subject?: string;
    body?: string;
    status?: string;
    sentAt?: string;
};

const NotificationEmails: React.FC = () => {
    const [items, setItems] = useState<EmailDelivery[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<EmailDelivery | null>(null);

    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const load = async () => {
        setLoading(true);
        try {
            const res = await getAllEmailDeliveriesApiWithPagination(page, pageSize);
            if (!res || !res.data) throw new Error("Failed to fetch email deliveries");
            setItems(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
            toast.error('Không tải được danh sách');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [page, pageSize]);

    const handleDelete = async (id?: string) => {
        if (!id) return;
        const ok = window.confirm('Bạn có chắc muốn xóa bản ghi này không?');
        if (!ok) return;
        try {
            await deleteEmailDelivery(id);
            toast.success('Xóa thành công');
            load();
        } catch (err) {
            console.error(err);
            toast.error('Lỗi khi xóa bản ghi');
        }
    };

    const handleRetry = async (id?: string) => {
        if (!id) return;
        try {
            await retrySendEmailDelivery(id);
            toast.success('Đã gửi lại yêu cầu gửi email (retry).');
            load();
        } catch (err) {
            console.error(err);
            toast.error('Lỗi khi gửi lại email');
        }
    };

    return (
        <div className="px-4 py-2 relative min-h-screen">
            <div className="flex items-center justify-between py-1 mb-4">
                <h1 className="text-base font-semibold">Quản lý email gửi đi</h1>
            </div>

            <div className="overflow-x-auto border bg-white rounded-md shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email nhận</TableHead>
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead className="text-center">Trạng thái</TableHead>
                            <TableHead className="text-center">Thời gian</TableHead>
                            <TableHead className="text-center">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Đang tải...</TableCell>
                            </TableRow>
                        ) : null}

                        {!loading && items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Không có dữ liệu</TableCell>
                            </TableRow>
                        )}

                        {items.map((it) => (
                            <TableRow key={it.emailDeliId} className="border-t">
                                <TableCell className="px-4 py-6 align-top max-w-xs break-words text-left">{it.email ? it.email : "Không có người nhận"}</TableCell>
                                <TableCell className="px-4 py-6 align-top max-w-xs break-words text-left">{it.subject}</TableCell>
                                <TableCell className="px-4 py-6 align-top text-center">
                                    <span
                                        className={
                                            it.status === "fail" ? "text-red-600"
                                                : it.status === "success"
                                                    ? "text-green-600"
                                                    : "text-yellow-600"
                                        }
                                    >
                                        {it.status === "fail"
                                            ? "Thất bại"
                                            : it.status === "success"
                                                ? "Thành công"
                                                : "Đang xử lý"}
                                    </span>
                                </TableCell>

                                <TableCell className="px-4 py-6 align-top text-center">{it.sentAt ? new Date(it.sentAt).toLocaleString() : ''}</TableCell>
                                <TableCell className="px-4 py-3 align-top">
                                    <div className="flex justify-center gap-2">
                                        <Dialog open={!!selected && selected.emailDeliId === it.emailDeliId} onOpenChange={(open) => { if (!open) setSelected(null); }}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => setSelected(it)}>Xem</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Chi tiết email</DialogTitle>
                                                    <DialogDescription>{it.subject}</DialogDescription>
                                                </DialogHeader>
                                                <div className="mt-2">
                                                    <p className="text-sm font-medium">Đến: {it.email}</p>
                                                    <div className="mt-3 text-sm whitespace-pre-wrap border rounded p-3 bg-gray-50">{it.body}</div>
                                                </div>
                                                <DialogFooter>
                                                    <div className="flex gap-2 ml-auto">
                                                        <Button variant="destructive" onClick={() => { handleDelete(it.emailDeliId); setSelected(null); }}>Xóa</Button>
                                                        {it.status === 'fail' && (
                                                            <Button variant="login" onClick={() => { handleRetry(it.emailDeliId); setSelected(null); }}>Gửi lại</Button>
                                                        )}
                                                    </div>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(it.emailDeliId)}>Xóa</Button>
                                        {/* {it.status === 'fail' && (
                                            <Button variant="login" size="sm" onClick={() => handleRetry(it.emailDeliId)}>Gửi lại</Button>
                                        )} */}
                                    </div>
                                </TableCell>
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

export default NotificationEmails;
