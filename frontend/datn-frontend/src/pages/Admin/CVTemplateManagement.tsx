import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { toast } from "react-toastify";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";
import { deleteTemplate, getAllTemplates } from "@/api/recruitApi";
import { useNavigate } from "react-router-dom";

export type Template = {
    templateId: string;
    name: string;
    layoutJson?: string;
    themeJson?: string;
    previewUrl?: string;
    createdAt?: string;
};

const CVTemplateManagement = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await getAllTemplates();
                if (!res || !res.data) throw new Error("Failed to fetch templates");
                setTemplates(res.data);
            } catch (err: any) {
                const msg = err?.response?.data?.message || err?.message || "Không thể tải danh sách mẫu";
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleDelete = async (templateId: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa mẫu này?")) return;
        try {
            await deleteTemplate(templateId);
            setTemplates(templates.filter(c => c.templateId !== templateId));
            toast.success("Đã xóa mẫu");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Xóa thất bại";
            toast.error(msg);
        }
    };

    const createNewTemplate = () => {
        navigate('/admin/templates/new');
    }

    const editCVTemplate = (templateId: string) => {
        navigate(`/admin/templates/${templateId}`);
    };

    return (
        <div className="px-4 py-2 min-h-screen flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Quản lý mẫu CV</h2>
                <Button variant="login" size="sm" onClick={() => createNewTemplate()}>Thêm mẫu CV</Button>
            </div>
            <div className="border rounded-lg">
                <div className="sticky top-0 bg-white z-20">
                    <Table className="text-sm text-gray-700 min-w-full table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-left" style={{ width: '40%' }}>Tên mẫu CV</TableHead>
                                <TableHead className="text-left" style={{ width: '20%' }}>Ảnh minh họa</TableHead>
                                <TableHead className="text-center" style={{ width: '20%' }}>Ngày tạo</TableHead>
                                <TableHead className="text-center" style={{ width: '20%' }}>Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                    </Table>
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
                    <Table className="text-sm text-gray-700 min-w-full table-fixed">
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">Đang tải...</TableCell>
                                </TableRow>
                            ) : templates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">Không có dữ liệu</TableCell>
                                </TableRow>
                            ) : (
                                templates.map((c) => (
                                    <TableRow key={c.templateId}>
                                        <TableCell className="text-left" style={{ width: '40%' }}>{c.name}</TableCell>
                                        <TableCell className="text-left" style={{ width: '20%' }}>
                                            <img
                                                alt="Template Logo"
                                                className="h-28 object-cover"
                                                src={c.previewUrl ? `${MINIO_ENDPOINT}/datn/${c.previewUrl}` : '/default-logo.png'}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center" style={{ width: '20%' }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : ''}</TableCell>
                                        <TableCell className="text-center" style={{ width: '20%' }}>
                                            <div className="flex gap-2 w-full justify-center">
                                                <Button size="sm" variant="outline" onClick={() => editCVTemplate(c.templateId)}>Sửa</Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(c.templateId)}>Xóa</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default CVTemplateManagement;
