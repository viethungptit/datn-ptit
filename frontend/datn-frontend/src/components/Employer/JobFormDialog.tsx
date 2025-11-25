import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Textarea from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";
import { createJob, createJobForAdmin, updateJobForAdmin } from "@/api/recruitApi";

type Job = {
    jobId?: string;
    companyId?: string;
    title?: string;
    description?: string;
    minSalary?: number;
    maxSalary?: number;
    location?: string;
    city?: string;
    jobType?: string;
    quantity?: number;
    deadline?: string;
    status?: string;
    statusEmbedding?: string;
    deleted?: boolean;
    groupTagIds?: string[];
    jobTagIds?: string[];
    createdAt?: string;
    experience?: string;
    createdBy?: string;
    updatedBy?: string;
};

type Company = {
    companyId: string;
    companyName: string;
};

type JobTag = { jobTagId: string; jobName: string };
type GroupTag = { groupTagId: string; groupJobName: string };

const JOB_TYPE_OPTIONS = [
    { value: 'full_time', label: 'Toàn thời gian' },
    { value: 'part_time', label: 'Bán thời gian' },
    { value: 'internship', label: 'Thực tập' },
    { value: 'freelance', label: 'Freelance' },
];

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'open', label: 'Đang mở' },
    { value: 'closed', label: 'Đã đóng' },
    { value: 'rejected', label: 'Đã từ chối' },
];

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEdit: boolean;
    initialJob?: Job | null;
    company?: Company | null;
    isAdmin?: boolean;
    jobTags: JobTag[];
    groupTags: GroupTag[];
    onSaved?: (job: any) => void;
};

const JobFormDialog: React.FC<Props> = ({ open, onOpenChange, isEdit, initialJob, company, isAdmin, jobTags, groupTags, onSaved }) => {
    const [form, setForm] = useState<Partial<Job>>({});
    useEffect(() => {
        if (initialJob) setForm({ ...initialJob });
        else setForm({});
    }, [initialJob, open]);

    const toggleGroupTag = (id: string, checked: boolean) => {
        setForm(f => {
            const prev = f.groupTagIds || [];
            const next = checked ? Array.from(new Set([...prev, id])) : prev.filter(x => x !== id);
            return { ...f, groupTagIds: next };
        });
    };

    const toggleJobTag = (id: string, checked: boolean) => {
        setForm(f => {
            const prev = f.jobTagIds || [];
            const next = checked ? Array.from(new Set([...prev, id])) : prev.filter(x => x !== id);
            return { ...f, jobTagIds: next };
        });
    };

    const handleSubmit = async () => {
        if (!form.title || !form.jobType || form.minSalary === undefined || form.maxSalary === undefined || !form.location || !form.city || !form.quantity || !form.deadline || !form.experience || !form.description) {
            toast.error("Vui lòng nhập đầy đủ các trường bắt buộc");
            return;
        }
        if (form.quantity! <= 0) {
            toast.error("Vui lòng nhập số lượng hợp lệ");
            return;
        }
        if (form.minSalary! < 0 || form.maxSalary! < 0 || form.minSalary! > form.maxSalary!) {
            toast.error("Vui lòng nhập mức lương hợp lệ, mức lương tối thiểu phải nhỏ hơn hoặc bằng mức lương tối đa");
            return;
        }

        try {
            const payload: any = {
                title: form.title,
                description: form.description,
                minSalary: form.minSalary,
                maxSalary: form.maxSalary,
                location: form.location,
                city: form.city,
                status: form.status || 'pending',
                jobType: form.jobType,
                groupTagIds: form.groupTagIds,
                jobTagIds: form.jobTagIds,
                quantity: form.quantity,
                deadline: form.deadline,
                companyId: company?.companyId,
                experience: form.experience,
            };

            let res;
            if (isEdit && form.jobId) {
                res = await updateJobForAdmin(form.jobId, payload);
                toast.success('Cập nhật công việc thành công');
            } else {
                if (isAdmin) {
                    res = await createJobForAdmin(payload as any);
                } else {
                    res = await createJob(payload as any);
                }
                toast.success('Thêm công việc thành công');
            }

            const updatedJob = res?.data;
            if (updatedJob && onSaved) onSaved(updatedJob);
            onOpenChange(false);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Lưu thất bại';
            toast.error(msg);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Sửa công việc" : "Thêm công việc"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Chỉnh sửa thông tin công việc." : "Thêm công việc mới vào hệ thống."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="title">Tiêu đề</Label>
                        <Input id="title" placeholder="Tiêu đề" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    </div>

                    <div>
                        <Label htmlFor="company">Công ty</Label>
                        <Input
                            id="company"
                            type="text"
                            className="cursor-not-allowed"
                            value={company?.companyName ?? "Chưa có công ty"}
                            disabled
                        />
                    </div>

                    <div className="flex justify-between">
                        <div className="mr-3">
                            <Label htmlFor="minSalary">Mức lương khởi điểm (VNĐ)</Label>
                            <Input
                                id="minSalary"
                                type="number"
                                placeholder="Mức lương khởi điểm"
                                value={form.minSalary ?? ''}
                                onChange={e =>
                                    setForm(f => ({
                                        ...f,
                                        minSalary: e.target.value ? Number(e.target.value) : undefined,
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="maxSalary">Mức lương tối đa (VNĐ)</Label>
                            <Input
                                id="maxSalary"
                                type="number"
                                placeholder="Mức lương tối đa"
                                value={form.maxSalary ?? ''}
                                onChange={e =>
                                    setForm(f => ({
                                        ...f,
                                        maxSalary: e.target.value ? Number(e.target.value) : undefined,
                                    }))
                                }
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="location">Địa điểm</Label>
                        <Input id="location" placeholder="Địa điểm" value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                    </div>

                    <div>
                        <Label htmlFor="city">Thành phố</Label>
                        <Select
                            value={form.city || ""}
                            onValueChange={(value) => setForm(f => ({ ...f, city: value }))}
                        >
                            <SelectTrigger id="city">
                                <SelectValue placeholder="Chọn thành phố" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                                <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
                                <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="jobType">Loại công việc</Label>
                        <Select value={form.jobType ?? ''} onValueChange={v => setForm(f => ({ ...f, jobType: v || undefined }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn loại công việc" />
                            </SelectTrigger>
                            <SelectContent>
                                {JOB_TYPE_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="status">Trạng thái</Label>
                        <Select value={form.status ?? ''} onValueChange={v => setForm(f => ({ ...f, status: v || undefined }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Danh mục ngành nghề</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full text-left">{(form.groupTagIds && form.groupTagIds.length) ? `${form.groupTagIds.length} đã chọn` : 'Chọn ngành nghề'}</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {groupTags.length === 0 ? (
                                    <div className="px-2 py-1 text-sm">Không có thẻ ngành nghề</div>
                                ) : (
                                    groupTags.map(g => (
                                        <DropdownMenuCheckboxItem key={g.groupTagId} checked={form.groupTagIds?.includes(g.groupTagId) ?? false} onCheckedChange={(c) => toggleGroupTag(g.groupTagId, Boolean(c))}>
                                            {g.groupJobName}
                                        </DropdownMenuCheckboxItem>
                                    ))
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div>
                        <Label>Danh mục công việc</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full text-left">{(form.jobTagIds && form.jobTagIds.length) ? `${form.jobTagIds.length} đã chọn` : 'Chọn thẻ công việc'}</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {jobTags.length === 0 ? (
                                    <div className="px-2 py-1 text-sm">Không có thẻ công việc</div>
                                ) : (
                                    jobTags.map(t => (
                                        <DropdownMenuCheckboxItem key={t.jobTagId} checked={form.jobTagIds?.includes(t.jobTagId) ?? false} onCheckedChange={(c) => toggleJobTag(t.jobTagId, Boolean(c))}>
                                            {t.jobName}
                                        </DropdownMenuCheckboxItem>
                                    ))
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div>
                        <Label htmlFor="quantity">Số lượng</Label>
                        <Input id="quantity" type="number" placeholder="Số lượng" value={form.quantity?.toString() || ''} onChange={e => setForm(f => ({ ...f, quantity: e.target.value ? Number(e.target.value) : undefined }))} />
                    </div>
                    <div>
                        <Label htmlFor="deadline">Hạn nộp</Label>
                        <Input id="deadline" type="date" value={form.deadline ? new Date(form.deadline).toISOString().slice(0, 10) : ''} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                    </div>
                    <div>
                        <Label htmlFor="experience">Kinh nghiệm làm việc</Label>
                        <Select
                            value={form.experience || ""}
                            onValueChange={(value) => setForm(f => ({ ...f, experience: value }))}
                        >
                            <SelectTrigger id="experience">
                                <SelectValue placeholder="Chọn kinh nghiệm" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="intern">Thực tập</SelectItem>
                                <SelectItem value="fresher">Fresher</SelectItem>
                                <SelectItem value="1-2">1-2 năm kinh nghiệm</SelectItem>
                                <SelectItem value="2-3">2-3 năm kinh nghiệm</SelectItem>
                                <SelectItem value="3-4">3-4 năm kinh nghiệm</SelectItem>
                                <SelectItem value="4-5">4-5 năm kinh nghiệm</SelectItem>
                                <SelectItem value="5+">Hơn 5 năm kinh nghiệm</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-3">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea id="description" placeholder="Mô tả" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={6} />
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
    );
};

export default JobFormDialog;
