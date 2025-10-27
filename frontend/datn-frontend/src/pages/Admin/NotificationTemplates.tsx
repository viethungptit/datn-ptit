import React, { useEffect, useState } from 'react';
import {
    getAllTemplates,
    createTemplate,
    updateTemplate as apiUpdateTemplate,
    deleteTemplate as apiDeleteTemplate,
} from '@/api/notificationApi';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import { toast } from 'react-toastify';

type Template = {
    templateId: string;
    eventType: string;
    emailSubjectTemplate?: string;
    emailBodyTemplate?: string;
    inappBodyTemplate?: string;
    isDeleted?: boolean;
    createdAt?: string;
};

const emptyForm = {
    eventType: '',
    emailSubjectTemplate: '',
    emailBodyTemplate: '',
    inappBodyTemplate: '',
};

const NotificationTemplates: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Template | null>(null);
    const [form, setForm] = useState(() => ({ ...emptyForm }));

    const load = async () => {
        setLoading(true);
        try {
            const res = await getAllTemplates();
            setTemplates(res?.data ?? []);
        } catch (err) {
            console.error(err);
            toast.error('Không tải được danh sách mẫu thông báo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...emptyForm });
        setDialogOpen(true);
    };

    const openEdit = (t: Template) => {
        setEditing(t);
        setForm({
            eventType: t.eventType || '',
            emailSubjectTemplate: t.emailSubjectTemplate || '',
            emailBodyTemplate: t.emailBodyTemplate || '',
            inappBodyTemplate: t.inappBodyTemplate || '',
        });
        setDialogOpen(true);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        try {
            if (editing) {
                await apiUpdateTemplate(editing.templateId, form);
                toast.success('Cập nhật mẫu thông báo thành công');
            } else {
                await createTemplate(form);
                toast.success('Tạo mẫu thông báo thành công');
            }
            setDialogOpen(false);
            load();
        } catch (err) {
            console.error(err);
            toast.error('Lỗi khi lưu mẫu thông báo');
        }
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;
        const ok = window.confirm('Bạn có chắc muốn xóa mẫu thông báo này không?');
        if (!ok) return;
        try {
            await apiDeleteTemplate(id);
            toast.success('Xóa mẫu thông báo thành công');
            load();
        } catch (err) {
            console.error(err);
            toast.error('Lỗi khi xóa mẫu thông báo');
        }
    };

    return (
        <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-base font-semibold">Quản lý mẫu thông báo</h1>
                <div className="flex items-center gap-2">
                    <Button variant="login" size="sm" onClick={openCreate}>Tạo mẫu thông báo</Button>
                </div>
            </div>

            <div className="overflow-x-auto border bg-white rounded-md shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã sự kiện</TableHead>
                            <TableHead>Tiêu đề email</TableHead>
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

                        {!loading && templates.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Không có dữ liệu</TableCell>
                            </TableRow>
                        )}

                        {templates.map((t) => (
                            <TableRow key={t.templateId} className="border-t">
                                <TableCell className="px-4 py-3 align-top max-w-xs break-words text-left">{t.eventType}</TableCell>
                                <TableCell className="px-4 py-3 align-top max-w-xs break-words text-left">{t.emailSubjectTemplate}</TableCell>
                                <TableCell className="px-4 py-3 align-top text-center">{t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}</TableCell>
                                <TableCell className="px-4 py-3 align-top">
                                    <div className="flex justify-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(t)}>Sửa</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(t.templateId)}>Xóa</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
                <DialogTrigger asChild>
                    <span />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Chỉnh sửa mẫu thông báo' : 'Tạo mẫu thông báo mới'}</DialogTitle>
                        <DialogDescription>{editing ? 'Cập nhật mẫu thông báo' : 'Tạo mẫu thông báo mới'}</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Mã sự kiện</label>
                            <Input value={form.eventType} onChange={(e) => setForm(s => ({ ...s, eventType: e.target.value }))} placeholder="user.register" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tiêu đề email</label>
                            <Input value={form.emailSubjectTemplate} onChange={(e) => setForm(s => ({ ...s, emailSubjectTemplate: e.target.value }))} placeholder='Tiêu đề email gửi đi' />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nội dung email</label>
                            <p className='text-xs pb-2'>
                                Bạn có thể chèn các biến động trong nội dung bằng cú pháp{" "}
                                <code className="px-1 rounded">
                                    {"{{giá trị biến}}"}
                                </code>.
                            </p>
                            <Textarea value={form.emailBodyTemplate} onChange={(e) => setForm(s => ({ ...s, emailBodyTemplate: e.target.value }))} rows={7}
                                placeholder='Xin chào {{name}}, Bạn vừa yêu cầu mã xác thực cho tài khoản {{email}}.' />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nội dung thông báo</label>
                            <Input value={form.inappBodyTemplate} onChange={(e) => setForm(s => ({ ...s, inappBodyTemplate: e.target.value }))} placeholder='Nội dung thông báo' />
                        </div>

                        <DialogFooter>
                            <div className="flex gap-2 ml-auto">
                                <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Hủy</Button>
                                <Button type="submit" variant="default">{editing ? 'Cập nhật' : 'Tạo'}</Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NotificationTemplates;
