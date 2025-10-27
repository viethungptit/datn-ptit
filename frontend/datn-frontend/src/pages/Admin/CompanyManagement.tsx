import { useEffect, useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Textarea from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { createCompanyApi, deleteCompanyApi, getAllCompaniesApi, updateCompanyApi, verifyCompanyApi } from "@/api/userApi";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";

export type Company = {
    companyId: string;
    companyName: string;
    industry?: string;
    companySize?: number;
    location?: string;
    website?: string;
    description?: string;
    logoUrl?: string;
    coverImgUrl?: string;
    createdAt?: string;
    verified?: boolean;
};

const CompanyManagement = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [form, setForm] = useState<Partial<Company>>({});
    const [isEdit, setIsEdit] = useState(false);
    const logoRef = useRef<HTMLInputElement | null>(null);
    const coverRef = useRef<HTMLInputElement | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);
    const [coverPreview, setCoverPreview] = useState<string | undefined>(undefined);
    const prevLogoUrlRef = useRef<string | undefined>(undefined);
    const prevCoverUrlRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await getAllCompaniesApi();
                if (!res || !res.data) throw new Error("Failed to fetch companies");
                setCompanies(res.data);
            } catch (err: any) {
                const msg = err?.response?.data?.message || err?.message || "Không thể tải danh sách công ty";
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const openDialogCompany = (company?: Company) => {
        if (company) {
            const { companyId, companyName, industry, companySize, location, website, description, logoUrl, coverImgUrl, createdAt, verified } = company;
            setForm({ companyId, companyName, industry, companySize, location, website, description, logoUrl, coverImgUrl, createdAt, verified });
            setIsEdit(true);
            // set previews from existing URLs
            setLogoPreview(logoUrl ? `${MINIO_ENDPOINT}/datn/${logoUrl}` : undefined);
            setCoverPreview(coverImgUrl ? `${MINIO_ENDPOINT}/datn/${coverImgUrl}` : undefined);
        } else {
            setForm({});
            setLogoPreview(undefined);
            setCoverPreview(undefined);
        }
        // clear file inputs
        if (logoRef.current) logoRef.current.value = "";
        if (coverRef.current) coverRef.current.value = "";
        setOpenDialog(true);
    };

    const handleDelete = async (companyId: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa công ty này?")) return;
        try {
            await deleteCompanyApi(companyId);
            setCompanies(companies.filter(c => c.companyId !== companyId));
            toast.success("Đã xóa công ty");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Xóa thất bại";
            toast.error(msg);
        }
    };

    const handleVerify = async (companyId: string) => {
        try {
            const res = await verifyCompanyApi(companyId);
            const updated = res?.data;
            setCompanies(companies.map(c => (c.companyId === companyId ? { ...c, ...updated } as Company : c)));
            toast.success("Đã xác thực công ty");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Xác thực thất bại";
            toast.error(msg);
        }
    };

    const handleSubmit = async () => {
        try {
            // basic validation
            if (!form.companyName || !form.industry) {
                toast.error('Vui lòng nhập tên công ty và ngành nghề');
                return;
            }

            const fd = new FormData();
            fd.append('companyName', form.companyName || '');
            if (form.industry) fd.append('industry', String(form.industry));
            if (form.companySize !== undefined && form.companySize !== null) fd.append('companySize', String(form.companySize));
            if (form.location) fd.append('location', form.location);
            if (form.website) fd.append('website', form.website);
            if (form.description) fd.append('description', form.description);

            if (logoRef.current && logoRef.current.files && logoRef.current.files[0]) {
                fd.append('logo', logoRef.current.files[0]);
            }
            if (coverRef.current && coverRef.current.files && coverRef.current.files[0]) {
                fd.append('coverImg', coverRef.current.files[0]);
            }

            if (isEdit && form.companyId) {
                const res = await updateCompanyApi(form.companyId, fd);
                const updated = res?.data;
                setCompanies(companies.map(c => (c.companyId === form.companyId ? { ...c, ...updated } as Company : c)));
                toast.success('Cập nhật thành công');
            } else {
                const res = await createCompanyApi(fd);
                const newCompany = res?.data;
                if (newCompany) setCompanies([...companies, newCompany]);
                toast.success('Thêm công ty thành công');
            }
            setOpenDialog(false);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Lưu thất bại";
            toast.error(msg);
        }
    };

    // handle file input changes to show previews
    const onLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // revoke previous blob URL if any
        if (prevLogoUrlRef.current && prevLogoUrlRef.current.startsWith('blob:')) URL.revokeObjectURL(prevLogoUrlRef.current);
        const url = URL.createObjectURL(file);
        prevLogoUrlRef.current = url;
        setLogoPreview(url);
    };

    const onCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (prevCoverUrlRef.current && prevCoverUrlRef.current.startsWith('blob:')) URL.revokeObjectURL(prevCoverUrlRef.current);
        const url = URL.createObjectURL(file);
        prevCoverUrlRef.current = url;
        setCoverPreview(url);
    };

    // cleanup blob URLs on unmount or when dialog closes
    useEffect(() => {
        return () => {
            if (prevLogoUrlRef.current && prevLogoUrlRef.current.startsWith('blob:')) URL.revokeObjectURL(prevLogoUrlRef.current);
            if (prevCoverUrlRef.current && prevCoverUrlRef.current.startsWith('blob:')) URL.revokeObjectURL(prevCoverUrlRef.current);
        };
    }, []);

    // when dialog closes, clear any object URLs created during edit/create
    useEffect(() => {
        if (!openDialog) {
            if (prevLogoUrlRef.current && prevLogoUrlRef.current.startsWith('blob:')) {
                URL.revokeObjectURL(prevLogoUrlRef.current);
                prevLogoUrlRef.current = undefined;
            }
            if (prevCoverUrlRef.current && prevCoverUrlRef.current.startsWith('blob:')) {
                URL.revokeObjectURL(prevCoverUrlRef.current);
                prevCoverUrlRef.current = undefined;
            }
            setLogoPreview(undefined);
            setCoverPreview(undefined);
        }
    }, [openDialog]);

    return (
        <div className="px-4 py-2">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Quản lý công ty</h2>
                <Button variant="login" size="sm" onClick={() => openDialogCompany()}>Thêm công ty</Button>
            </div>
            <div className="border rounded-lg overflow-x-auto">
                <Table className="text-sm text-gray-700">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-left">Tên công ty</TableHead>
                            <TableHead className="text-left">Logo</TableHead>
                            <TableHead className="text-center">Ngành nghề</TableHead>
                            <TableHead className="text-center">Quy mô</TableHead>
                            <TableHead className="text-center">Địa chỉ</TableHead>
                            <TableHead className="text-left">Tình trạng</TableHead>
                            <TableHead className="text-left">Ngày tạo</TableHead>
                            <TableHead className="text-left">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">Đang tải...</TableCell>
                            </TableRow>
                        ) : companies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">Không có dữ liệu</TableCell>
                            </TableRow>
                        ) : (
                            companies.map((c) => (
                                <TableRow key={c.companyId}>
                                    <TableCell className="text-left">{c.companyName}</TableCell>
                                    <TableCell className="text-left">
                                        <img
                                            alt="Company Logo"
                                            className="h-12 object-cover"
                                            src={c.logoUrl ? `${MINIO_ENDPOINT}/datn/${c.logoUrl}` : '/default-logo.png'}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">{c.industry}</TableCell>
                                    <TableCell className="text-center">{c.companySize ?? ''}</TableCell>
                                    <TableCell className="text-center">{c.location}</TableCell>
                                    <TableCell className="text-left">{c.verified ? 'Đã xác thực' : 'Chưa'}</TableCell>
                                    <TableCell className="text-left">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : ''}</TableCell>
                                    <TableCell className="text-left">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openDialogCompany(c)}>Sửa</Button>
                                            {!c.verified && <Button size="sm" variant="secondary" onClick={() => handleVerify(c.companyId)}>Xác thực</Button>}
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(c.companyId)}>Xóa</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Sửa công ty" : "Thêm công ty"}</DialogTitle>
                        <DialogDescription>
                            {isEdit ? "Chỉnh sửa thông tin công ty." : "Thêm công ty mới vào hệ thống."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="companyName">Tên công ty</Label>
                            <Input id="companyName" placeholder="Tên công ty" value={form.companyName || ''} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} />
                        </div>
                        <div>
                            <Label htmlFor="industry">Ngành</Label>
                            <Input id="industry" placeholder="Ngành" value={form.industry || ''} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
                        </div>

                        <div>
                            <Label htmlFor="companySize">Quy mô</Label>
                            <Input id="companySize" type="number" placeholder="Quy mô" value={form.companySize?.toString() || ''} onChange={e => setForm(f => ({ ...f, companySize: e.target.value ? Number(e.target.value) : undefined }))} />
                        </div>
                        <div>
                            <Label htmlFor="location">Vị trí</Label>
                            <Input id="location" placeholder="Vị trí" value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                        </div>

                        <div>
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" placeholder="Website" value={form.website || ''} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
                        </div>
                        <div>
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea id="description" placeholder="Mô tả" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={5} />
                        </div>

                        <div>
                            <Label>Logo</Label>
                            <div className="flex items-center gap-3 mt-1">
                                <input id="logo" ref={logoRef} onChange={onLogoChange} type="file" accept="image/*" className="hidden" />
                                {!logoPreview && (
                                    <Button variant="outline" onClick={() => logoRef.current?.click()}>Chọn logo</Button>
                                )}
                                {logoPreview && (
                                    <div className="relative">
                                        <img alt="Logo preview" src={logoPreview} className="h-20 w-20 object-cover rounded" />
                                        <button type="button" className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow" onClick={() => { if (logoRef.current) logoRef.current.value = ''; setLogoPreview(undefined); prevLogoUrlRef.current && prevLogoUrlRef.current.startsWith('blob:') && URL.revokeObjectURL(prevLogoUrlRef.current); prevLogoUrlRef.current = undefined; }}>
                                            <i className="fa-solid fa-x"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label>Ảnh bìa</Label>
                            <div className="flex items-center gap-3 mt-1">
                                <input id="coverImg" ref={coverRef} onChange={onCoverChange} type="file" accept="image/*" className="hidden" />
                                {!coverPreview && (
                                    <Button variant="outline" onClick={() => coverRef.current?.click()}>Chọn ảnh bìa</Button>
                                )}
                                {coverPreview && (
                                    <div className="relative w-48">
                                        <img alt="Cover preview" src={coverPreview} className="h-20 w-full object-cover rounded" />
                                        <button type="button" className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow" onClick={() => { if (coverRef.current) coverRef.current.value = ''; setCoverPreview(undefined); prevCoverUrlRef.current && prevCoverUrlRef.current.startsWith('blob:') && URL.revokeObjectURL(prevCoverUrlRef.current); prevCoverUrlRef.current = undefined; }}>
                                            <i className="fa-solid fa-x"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Hủy</Button>
                        </DialogClose>
                        <Button onClick={handleSubmit}>{isEdit ? "Lưu" : "Thêm"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CompanyManagement;
