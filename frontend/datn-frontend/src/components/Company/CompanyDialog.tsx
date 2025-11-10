import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Textarea from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { createCompanyApi, updateCompanyApi } from '@/api/userApi';
import { MINIO_ENDPOINT } from '@/api/serviceConfig';

export type Company = {
    companyId?: string;
    companyName?: string;
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

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    company?: Company | null;
    onSaved?: (company: any) => void;
};

const CompanyDialog: React.FC<Props> = ({ open, onOpenChange, company, onSaved }) => {
    const isEdit = !!company;
    const [form, setForm] = useState<Company>({});
    const logoRef = useRef<HTMLInputElement | null>(null);
    const coverRef = useRef<HTMLInputElement | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);
    const [coverPreview, setCoverPreview] = useState<string | undefined>(undefined);
    const prevLogoUrlRef = useRef<string | undefined>(undefined);
    const prevCoverUrlRef = useRef<string | undefined>(undefined);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        setForm({
            companyId: company?.companyId,
            companyName: company?.companyName,
            industry: company?.industry,
            companySize: company?.companySize,
            location: company?.location,
            website: company?.website,
            description: company?.description,
            logoUrl: company?.logoUrl,
            coverImgUrl: company?.coverImgUrl,
            createdAt: company?.createdAt,
            verified: company?.verified,
        });
        setLogoPreview(company?.logoUrl ? `${MINIO_ENDPOINT}/datn/${company.logoUrl}` : undefined);
        setCoverPreview(company?.coverImgUrl ? `${MINIO_ENDPOINT}/datn/${company.coverImgUrl}` : undefined);
        // clear input values
        if (logoRef.current) logoRef.current.value = '';
        if (coverRef.current) coverRef.current.value = '';
    }, [open, company]);

    useEffect(() => {
        return () => {
            if (prevLogoUrlRef.current && prevLogoUrlRef.current.startsWith('blob:')) URL.revokeObjectURL(prevLogoUrlRef.current);
            if (prevCoverUrlRef.current && prevCoverUrlRef.current.startsWith('blob:')) URL.revokeObjectURL(prevCoverUrlRef.current);
        };
    }, []);

    const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (prevLogoUrlRef.current && prevLogoUrlRef.current.startsWith('blob:')) URL.revokeObjectURL(prevLogoUrlRef.current);
        const url = URL.createObjectURL(file);
        prevLogoUrlRef.current = url;
        setLogoPreview(url);
    };

    const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (prevCoverUrlRef.current && prevCoverUrlRef.current.startsWith('blob:')) URL.revokeObjectURL(prevCoverUrlRef.current);
        const url = URL.createObjectURL(file);
        prevCoverUrlRef.current = url;
        setCoverPreview(url);
    };

    const handleSubmit = async () => {
        try {
            if (!form.companyName || !form.industry) {
                toast.error('Vui lòng nhập tên công ty và ngành nghề');
                return;
            }
            setSubmitting(true);
            const fd = new FormData();
            fd.append('companyName', form.companyName || '');
            if (form.industry) fd.append('industry', String(form.industry));
            if (form.companySize !== undefined && form.companySize !== null) fd.append('companySize', String(form.companySize));
            if (form.location) fd.append('location', form.location);
            if (form.website) fd.append('website', form.website);
            if (form.description) fd.append('description', form.description as string);
            if (logoRef.current && logoRef.current.files && logoRef.current.files[0]) fd.append('logo', logoRef.current.files[0]);
            if (coverRef.current && coverRef.current.files && coverRef.current.files[0]) fd.append('coverImg', coverRef.current.files[0]);

            if (isEdit && form.companyId) {
                const res = await updateCompanyApi(form.companyId, fd);
                const updated = res?.data;
                toast.success('Cập nhật thành công');
                onSaved && onSaved(updated);
            } else {
                const res = await createCompanyApi(fd);
                const newCompany = res?.data;
                toast.success('Thêm công ty thành công');
                onSaved && onSaved(newCompany);
            }
            onOpenChange(false);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Lưu thất bại';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Sửa công ty' : 'Thêm công ty'}</DialogTitle>
                    <DialogDescription>{isEdit ? 'Chỉnh sửa thông tin công ty.' : 'Thêm công ty mới vào hệ thống.'}</DialogDescription>
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
                        <Label htmlFor="location">Địa chỉ</Label>
                        <Input id="location" placeholder="Địa chỉ" value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
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
                    <div className="flex gap-2 w-full justify-end">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                        <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Đang lưu...' : (isEdit ? 'Lưu' : 'Thêm')}</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CompanyDialog;
