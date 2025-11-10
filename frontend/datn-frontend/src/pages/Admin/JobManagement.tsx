import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Textarea from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { getAllCompaniesApi } from "@/api/userApi";
import {
    getAllJobs,
    createJobForAdmin,
    deleteJob,
    closeJob,
    updateJobForAdmin,
    getAllJobTags,
    getAllGroupJobTags,
    approveJob,
} from "@/api/recruitApi";

type JobTag = { jobTagId: string; jobName: string; isDeleted?: boolean };
type GroupTag = { groupTagId: string; groupJobName: string; isDeleted?: boolean };

type Company = {
    companyId: string;
    companyName: string;
};

export type Job = {
    jobId: string;
    companyId?: string;
    title: string;
    description?: string;
    minSalary?: number;
    maxSalary?: number;
    location?: string;
    city?: string;
    jobType?: string; // expected: full_time, part_time, internship, freelance
    quantity?: number;
    deadline?: string;
    status?: string; // pending | closed | open
    deleted?: boolean;
    groupTagIds?: string[];
    jobTagIds?: string[];
    createdAt?: string;
};

const JobManagement = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [form, setForm] = useState<Partial<Job>>({});
    const [isEdit, setIsEdit] = useState(false);

    const JOB_TYPE_OPTIONS = [
        { value: 'full_time', label: 'Toàn thời gian' },
        { value: 'part_time', label: 'Bán thời gian' },
        { value: 'internship', label: 'Thực tập' },
        { value: 'freelance', label: 'Freelance' },
    ];

    const STATUS_OPTIONS = [
        { value: 'open', label: 'Đang mở' },
        { value: 'closed', label: 'Đã đóng' },
    ];

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [jobsRes, companiesRes, jobTagsRes, groupTagsRes] = await Promise.all([
                    getAllJobs(),
                    getAllCompaniesApi(),
                    getAllJobTags(),
                    getAllGroupJobTags(),
                ]);
                if (!jobsRes || !jobsRes.data) throw new Error("Failed to fetch jobs");
                if (!companiesRes || !companiesRes.data) throw new Error("Failed to fetch companies");
                // map jobs to Job[] shape (assume backend returns jobId or id)
                const mappedJobs: Job[] = (jobsRes.data || []).map((j: any) => ({
                    jobId: j.jobId ?? j.id ?? j.job_id,
                    companyId: j.companyId ?? j.company_id,
                    title: j.title,
                    description: j.description,
                    minSalary: j.minSalary,
                    maxSalary: j.maxSalary,
                    location: j.location,
                    city: j.city,
                    jobType: j.jobType,
                    quantity: j.quantity,
                    deadline: j.deadline,
                    status: j.status,
                    deleted: j.deleted,
                    createdAt: j.createdAt ?? j.created_at,
                }));
                setJobs(mappedJobs);
                setCompanies(companiesRes.data || []);
                // map job tags and group tags
                const jobTagsData = (jobTagsRes as any)?.data ?? jobTagsRes ?? [];
                const groupTagsData = (groupTagsRes as any)?.data ?? groupTagsRes ?? [];
                setJobTags(Array.isArray(jobTagsData) ? jobTagsData.map((t: any) => ({ jobTagId: t.jobTagId ?? t.id ?? t.job_tag_id, jobName: t.jobName ?? t.job_name })) : []);
                setGroupTags(Array.isArray(groupTagsData) ? groupTagsData.map((g: any) => ({ groupTagId: g.groupTagId ?? g.id ?? g.group_tag_id, groupJobName: g.groupJobName ?? g.group_job_name })) : []);
            } catch (err: any) {
                const msg = err?.response?.data?.message || err?.message || "Không thể tải dữ liệu";
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const [jobTags, setJobTags] = useState<JobTag[]>([]);
    const [groupTags, setGroupTags] = useState<GroupTag[]>([]);

    const openDialogJob = (job?: Job) => {
        if (job) {
            setForm({ ...job });
            setIsEdit(true);
        } else {
            setForm({});
            setIsEdit(false);
        }
        setOpenDialog(true);
    };

    const handleDelete = async (jobId: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa công việc này?")) return;
        try {
            await deleteJob(jobId);
            setJobs(jobs.filter(j => j.jobId !== jobId));
            toast.success("Đã xóa công việc");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Xóa thất bại";
            toast.error(msg);
        }
    };

    const handleCloseJob = async (jobId: string) => {
        try {
            const res = await closeJob(jobId);
            const updated = res?.data;
            setJobs(jobs.map(j => (j.jobId === jobId ? { ...j, ...updated } : j)));
            toast.success("Công việc đã được đóng");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Đóng công việc thất bại";
            toast.error(msg);
        }
    };

    const handleVerify = async (jobId: string) => {
        try {
            const res = await approveJob(jobId);
            const updated = res?.data;
            setJobs(jobs.map(j => (j.jobId === jobId ? { ...j, ...updated } : j)));
            toast.success('Công việc đã được duyệt');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Duyệt công việc thất bại';
            toast.error(msg);
        }
    };

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
        try {
            if (!form.title) {
                toast.error('Vui lòng nhập tiêu đề công việc');
                return;
            }

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
            };

            // include companyId when provided (admin endpoint)
            if (form.companyId) payload.companyId = form.companyId;

            if (isEdit && form.jobId) {
                const res = await updateJobForAdmin(form.jobId, payload);
                const updated = res?.data;
                setJobs(jobs.map(j => (j.jobId === form.jobId ? { ...j, ...updated } : j)));
                toast.success('Cập nhật công việc thành công');
            } else {
                let res = await createJobForAdmin(payload as any);
                const newJob = res?.data;
                if (newJob) {
                    const mapped: Job = {
                        jobId: newJob.jobId ?? newJob.id ?? newJob.job_id,
                        companyId: newJob.companyId ?? newJob.company_id,
                        title: newJob.title,
                        description: newJob.description,
                        minSalary: newJob.minSalary,
                        maxSalary: newJob.maxSalary,
                        location: newJob.location,
                        city: newJob.city,
                        jobType: newJob.jobType,
                        quantity: newJob.quantity,
                        deadline: newJob.deadline,
                        status: newJob.status,
                        deleted: newJob.deleted,
                        createdAt: newJob.createdAt ?? newJob.created_at,
                    };
                    setJobs(prev => [...prev, mapped]);
                }
                toast.success('Thêm công việc thành công');
            }
            setOpenDialog(false);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Lưu thất bại";
            toast.error(msg);
        }
    };

    const companyNameById = (id?: string) => {
        if (!id) return '';
        const c = companies.find(x => x.companyId === id || (x as any).companyId === id || (x as any).company_id === id);
        return c?.companyName || '';
    };

    const displayStatus = (j: Job) => {
        if (!j.status) return '';
        if (j.status === 'closed') return 'Đã đóng';
        if (j.status === 'pending') return 'Chờ duyệt';
        return 'Đang mở';
    };

    const getJobTypeLabel = (val?: string) => {
        if (!val) return '';
        const found = JOB_TYPE_OPTIONS.find(x => x.value === val);
        return found ? found.label : val;
    };

    return (
        <div className="px-4 py-2">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Quản lý công việc</h2>
                <Button variant="login" size="sm" onClick={() => openDialogJob()}>Thêm công việc</Button>
            </div>
            <div className="border rounded-lg overflow-x-auto">
                <Table className="text-sm text-gray-700">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-left">Tiêu đề</TableHead>
                            <TableHead className="text-left">Công ty</TableHead>
                            <TableHead className="text-center">Lương khởi điểm</TableHead>
                            <TableHead className="text-center">Lương tối đa</TableHead>
                            <TableHead className="text-center">Địa điểm</TableHead>
                            <TableHead className="text-center">Loại</TableHead>
                            <TableHead className="text-left">Trạng thái</TableHead>
                            <TableHead className="text-left">Ngày tạo</TableHead>
                            <TableHead className="text-center">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">Đang tải...</TableCell>
                            </TableRow>
                        ) : jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">Không có dữ liệu</TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((j) => (
                                <TableRow key={j.jobId}>
                                    <TableCell className="text-left">{j.title}</TableCell>
                                    <TableCell className="text-left">{companyNameById(j.companyId)}</TableCell>
                                    <TableCell className="text-center">{j.minSalary}</TableCell>
                                    <TableCell className="text-center">{j.maxSalary}</TableCell>
                                    <TableCell className="text-center">{j.location || j.city}</TableCell>
                                    <TableCell className="text-center">{getJobTypeLabel(j.jobType)}</TableCell>
                                    <TableCell className="text-left">{displayStatus(j)}</TableCell>
                                    <TableCell className="text-left">{j.deadline ? new Date(j.deadline).toLocaleDateString('vi-VN') : ''}</TableCell>
                                    <TableCell className="text-left">{j.createdAt ? new Date(j.createdAt).toLocaleDateString('vi-VN') : ''}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openDialogJob(j)}>Sửa</Button>
                                            {j.status === 'pending' && <Button size="sm" variant="login" onClick={() => handleVerify(j.jobId)}>Xác nhận</Button>}
                                            {!(j.deleted || j.status === 'closed') && <Button size="sm" variant="secondary" onClick={() => handleCloseJob(j.jobId)}>Đóng</Button>}
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(j.jobId)}>Xóa</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
                            <Select value={form.companyId ?? ''} onValueChange={v => setForm(f => ({ ...f, companyId: v === '__none' ? undefined : (v || undefined) }))}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="-- Chọn công ty (tùy chọn) --" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none">-- Không chọn --</SelectItem>
                                    {companies.map(c => (
                                        <SelectItem key={(c as any).companyId} value={(c as any).companyId}>{(c as any).companyName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-between">
                            <div className="mr-3">
                                <Label htmlFor="minSalary">Mức lương khởi điểm</Label>
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
                                <Label htmlFor="maxSalary">Mức lương tối đa</Label>
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
                            <Input id="city" placeholder="Thành phố" value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
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
        </div>
    );
};

export default JobManagement;
