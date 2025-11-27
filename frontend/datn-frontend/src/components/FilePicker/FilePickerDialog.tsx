import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';
import { getAllFilesByMeApi, uploadFileApi, deleteFileApi } from '../../api/userApi';
import { MINIO_ENDPOINT } from '../../api/serviceConfig';
import { toast } from 'react-toastify';

interface Props {
    onSelect: (fileUrl: string) => void;
    trigger?: React.ReactNode;
    contentClassName?: string;
}

const FilePickerDialog: React.FC<Props> = ({ onSelect, trigger, contentClassName }) => {
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await getAllFilesByMeApi();
            const data = res.data || res.data?.data || [];
            const list = Array.isArray(data) ? data : (res.data?.data || []);
            setFiles(list);
        } catch (err) {
            console.error('Failed to fetch files', err);
            toast.error('Không thể lấy danh sách ảnh');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchFiles();
    }, [open]);

    const handleUpload = async (file: File | null) => {
        if (!file) return;
        try {
            setUploading(true);
            const form = new FormData();
            form.append('file', file);
            await uploadFileApi(form);
            toast.success('Tải ảnh lên thành công');
            await fetchFiles();
        } catch (err: any) {
            console.error('Upload failed', err);
            const msg = err?.response?.data?.message || err?.message || 'Tải lên thất bại';
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileId: string) => {
        try {
            await deleteFileApi(fileId);
            toast.success('Xóa ảnh thành công');
            await fetchFiles();
        } catch (err: any) {
            console.error('Delete failed', err);
            const msg = err?.response?.data?.message || err?.message || 'Xóa thất bại';
            toast.error(msg);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger asChild>{trigger}</DialogTrigger>
            ) : (
                <DialogTrigger asChild>
                    <Button>Chọn ảnh từ hệ thống</Button>
                </DialogTrigger>
            )}

            <DialogContent className={contentClassName}>
                <DialogHeader>
                    <DialogTitle>Chọn ảnh từ hệ thống</DialogTitle>
                </DialogHeader>

                <div className="mb-4">
                    <label className="block mb-2 font-medium">Tải ảnh lên</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUpload(e.target.files?.[0] || null)}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                    />
                </div>

                <div>
                    {loading ? (
                        <div>Đang tải danh sách ảnh...</div>
                    ) : files.length === 0 ? (
                        <div>Không có ảnh nào. Hãy tải ảnh lên.</div>
                    ) : (
                        <div className="grid grid-cols-4 gap-4 overflow-y-auto max-h-[500px]">
                            {files.map((f: any) => (
                                <div key={f.id} className="border rounded p-2">
                                    <img src={`${MINIO_ENDPOINT}/datn/${f.fileUrl}`} alt={f.fileName || 'img'} className="w-full h-40 object-cover rounded" />
                                    <div className="flex items-center justify-between mt-2">
                                        <Button size="sm" onClick={() => { onSelect(`${f.fileUrl}`); setOpen(false); }}>Chọn</Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(f.id)}>Xóa</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-6">
                    <DialogClose asChild>
                        <Button variant="outline">Đóng</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FilePickerDialog;
