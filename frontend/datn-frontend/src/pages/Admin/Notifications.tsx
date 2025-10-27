import React, { useEffect, useState } from 'react';
import { getAllNotifications, deleteNotification } from '@/api/notificationApi';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { toast } from 'react-toastify';

type Template = {
    templateId: string;
    eventType: string;
    emailSubjectTemplate?: string;
    emailBodyTemplate?: string;
    inappBodyTemplate?: string;
    createdAt?: string;
};

type NotificationItem = {
    notificationId: string;
    userId?: string;
    template?: Template;
    eventType?: string;
    payload?: string;
    createdAt?: string;
};

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [viewOpen, setViewOpen] = useState(false);
    const [viewing, setViewing] = useState<NotificationItem | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await getAllNotifications();
            setNotifications(res?.data ?? []);
        } catch (err) {
            console.error(err);
            toast.error('Không tải được danh sách thông báo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleDelete = async (id?: string) => {
        if (!id) return;
        const ok = window.confirm('Bạn có chắc muốn xóa thông báo này không?');
        if (!ok) return;
        try {
            await deleteNotification(id);
            toast.success('Xóa thông báo thành công');
            load();
        } catch (err) {
            console.error(err);
            toast.error('Lỗi khi xóa thông báo');
        }
    };

    const openView = (n: NotificationItem) => {
        setViewing(n);
        setViewOpen(true);
    };

    const renderPayload = (p?: string) => {
        if (!p) return <span className="text-muted-foreground">-</span>;
        try {
            const obj = JSON.parse(p);
            return <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">{JSON.stringify(obj, null, 2)}</pre>;
        } catch (e) {
            return <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">{p}</pre>;
        }
    };

    return (
        <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-4 py-1">
                <h1 className="text-base font-semibold">Quản lý thông báo</h1>
            </div>

            <div className="overflow-x-auto border bg-white rounded-md shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sự kiện</TableHead>
                            <TableHead>Người nhận</TableHead>
                            <TableHead className="text-center">Ngày tạo</TableHead>
                            <TableHead className="text-center">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Đang tải...</TableCell>
                            </TableRow>
                        ) : null}

                        {!loading && notifications.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Không có dữ liệu</TableCell>
                            </TableRow>
                        )}

                        {notifications.map((n) => (
                            <TableRow key={n.notificationId} className="border-t">
                                <TableCell className="px-4 py-3 align-top max-w-xs break-words text-left">{n.eventType}</TableCell>
                                <TableCell className="px-4 py-3 align-top max-w-xs break-words text-left">
                                    {(() => {
                                        if (!n.payload) return <span className="text-muted-foreground">-</span>;
                                        try {
                                            const obj = JSON.parse(n.payload);
                                            if (obj?.to) return <div className="text-sm">{obj.to}</div>;
                                            if (obj?.data && obj.data.email) return <div className="text-sm">{obj.data.email}</div>;
                                            return <div className="text-sm">{JSON.stringify(obj)}</div>;
                                        } catch (e) {
                                            return <div className="text-sm">{n.payload}</div>;
                                        }
                                    })()}
                                </TableCell>
                                <TableCell className="px-4 py-3 align-top text-center">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</TableCell>
                                <TableCell className="px-4 py-3 align-top">
                                    <div className="flex justify-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openView(n)}>Xem</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(n.notificationId)}>Xóa</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={viewOpen} onOpenChange={(open) => setViewOpen(open)}>
                <DialogTrigger asChild>
                    <span />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chi tiết thông báo</DialogTitle>
                        <DialogDescription>Thông tin chi tiết của thông báo</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Sự kiện</label>
                            <div className="text-sm">{viewing?.eventType}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Mẫu</label>
                            <div className="text-sm max-w-full break-words">
                                {viewing?.template ? (
                                    <>
                                        <div className="text-sm text-muted-foreground">{viewing.template.emailSubjectTemplate}</div>
                                    </>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Dữ liệu</label>
                            {renderPayload(viewing?.payload)}
                        </div>
                    </div>

                    <DialogFooter>
                        <div className="flex gap-2 ml-auto">
                            <Button variant="outline" type="button" onClick={() => setViewOpen(false)}>Đóng</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Notifications;
