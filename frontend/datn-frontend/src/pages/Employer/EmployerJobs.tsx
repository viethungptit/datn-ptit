import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { getAllCompaniesApi, getCurrentUserProfile } from "@/api/userApi";
import {
    getAllJobsByCompany,
    createJob,
    createJobForAdmin,
    deleteJob,
    closeJob,
    getAllJobTags,
    getAllGroupJobTags,
    updateJobForAdmin,
} from "@/api/recruitApi";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";
import { toast } from "react-toastify";
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
    experience?: string;
    createdBy?: string;
    updatedBy?: string;
};

interface Company {
    companyId: string;
    companyName: string;
    verified?: boolean;
    logoUrl?: string;
}
type JobTag = { jobTagId: string; jobName: string; isDeleted?: boolean };
type GroupTag = { groupTagId: string; groupJobName: string; isDeleted?: boolean };
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
const EmployerJobs: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    // const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
    const [updating, setUpdating] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm] = useState<Partial<Job>>({});
    // const [companies, setCompanies] = useState<Company[]>([]);
    const company: Company | null = profile?.company ?? null;
    const isAdmin = profile?.employer?.admin === true;

    // ========== Load Profile ==========
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await getCurrentUserProfile();
                setProfile(res.data);
            } catch (err) {
                toast.error("Không thể tải hồ sơ người dùng");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // ========== Load Jobs ==========
    useEffect(() => {
        if (!company?.companyId) return;
        (async () => {
            setJobsLoading(true);
            try {
                const res = await getAllJobsByCompany(company.companyId);
                const allJobs: Job[] = res.data || [];
                setJobs(allJobs);
                // setPendingJobs(allJobs.filter((j) => j.status === "pending"));
            } catch (err) {
                toast.error("Không thể tải danh sách công việc");
            } finally {
                setJobsLoading(false);
            }
        })();
    }, [company?.companyId]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [companiesRes, jobTagsRes, groupTagsRes] = await Promise.all([
                    getAllCompaniesApi(),
                    getAllJobTags(),
                    getAllGroupJobTags(),
                ]);
                if (!companiesRes || !companiesRes.data) throw new Error("Failed to fetch companies");
                // setCompanies(companiesRes.data || []);
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
    const handleDelete = async (jobId: string) => {
        if (!window.confirm("Xác nhận xóa công việc này?")) return;
        try {
            await deleteJob(jobId);
            setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
            toast.success("Đã xóa công việc");
        } catch (err) {
            toast.error("Xóa thất bại");
        }
    };

    const handleCloseJob = async (jobId: string) => {
        try {
            await closeJob(jobId);
            setJobs((prev) =>
                prev.map((j) => (j.jobId === jobId ? { ...j, status: "closed" } : j))
            );
            toast.success("Công việc đã được đóng");
        } catch {
            toast.error("Đóng công việc thất bại");
        }
    };

    const handleSubmit = async () => {
        console.log("form ", form)
        if (!form.title) {
            toast.error("Vui lòng nhập tiêu đề công việc");
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
            };
            payload.companyId = company?.companyId;

            let res;
            if (isEdit && form.jobId) {
                res = await updateJobForAdmin(form.jobId, payload);
                const updated = res?.data;
                setJobs(jobs.map(j => (j.jobId === form.jobId ? { ...j, ...updated } : j)));
                toast.success('Cập nhật công việc thành công');
            } else {
                if (isAdmin) {
                    res = await createJobForAdmin(payload as any);
                } else {
                    res = await createJob(payload as any);
                }

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
                        createdBy: newJob.createdBy,
                        updatedBy: newJob.updatedBy,
                        createdAt: newJob.createdAt ?? newJob.created_at,
                    };
                    setJobs(prev => [...prev, mapped]);
                }

                toast.success('Thêm công việc thành công');
            }

            const updatedJob = res?.data;
            if (updatedJob) {
                setJobs((prev) => {
                    const exists = prev.find((j) => j.jobId === updatedJob.jobId);
                    if (exists)
                        return prev.map((j) =>
                            j.jobId === updatedJob.jobId ? { ...j, ...updatedJob } : j
                        );
                    return [...prev, updatedJob];
                });
            }

            setOpenDialog(false);
        } catch (err) {
            toast.error("Lưu thất bại");
        }
    };

    const handleApproveOrReject = async (jobId: string, newStatus: "open" | "closed") => {
        try {
            setUpdating(jobId);


            const job = jobs.find((j) => j.jobId === jobId);
            if (!job) {
                toast.error("Không tìm thấy công việc!");
                return;
            }


            const payload: Partial<Job> = {
                jobId: job.jobId,
                companyId: job.companyId,
                title: job.title,
                description: job.description,
                minSalary: job.minSalary,
                maxSalary: job.maxSalary,
                location: job.location,
                city: job.city,
                jobType: job.jobType,
                quantity: job.quantity,
                deadline: job.deadline,
                status: newStatus,
                deleted: job.deleted,
                groupTagIds: job.groupTagIds,
                jobTagIds: job.jobTagIds,
                experience: job.experience,
                createdBy: job.createdBy,
                updatedBy: job.updatedBy,
            };


            await updateJobForAdmin(jobId, payload);


            toast.success(
                newStatus === "open" ? "Đã duyệt công việc" : "Đã từ chối công việc"
            );

            // setPendingJobs((prev) => prev.filter((j) => j.jobId !== jobId));
            setJobs((prev) =>
                prev.map((j) =>
                    j.jobId === jobId ? { ...j, status: newStatus } : j
                )
            );
        } catch {
            toast.error("Cập nhật trạng thái thất bại");
        } finally {
            setUpdating(null);
        }
    };



    // ========== Giao diện ==========
    if (loading) return <div className="text-center py-10">Đang tải...</div>;

    if (!company)
        return (
            <div className="text-center py-10">
                <h1>Bạn chưa đăng ký công ty</h1>
                <Button onClick={() => navigate("/employer/profile")}>Đăng ký công ty</Button>
            </div>
        );

    if (!company.verified)
        return (
            <div className="text-center py-10">
                <h1>Công ty của bạn chưa được duyệt</h1>
                <Button onClick={() => navigate("/employer/profile")}>Xem thông tin</Button>
            </div>
        );
    if (profile.employer.status !== 'VERIFIED')
        return (
            <div className="text-center py-10">
                <h1>Hồ sơ của bạn chưa được xác thực</h1>
                <Button onClick={() => navigate("/employer/profile")}>Xem thông tin</Button>
            </div>
        );
    return (
        <div className="w-full py-10 flex flex-col items-center px-6">
            <div className="flex justify-between w-full max-w-6xl mb-6">
                <h1 className="text-2xl font-semibold text-txt-red">
                    Quản lý công việc của công ty
                </h1>
                <Button variant="login" onClick={() => openDialogJob()}>
                    + Tạo công việc
                </Button>
            </div>

            <Tabs defaultValue="company-jobs" className="w-full max-w-6xl">
                <TabsList className="flex justify-center mb-8">
                    <TabsTrigger value="company-jobs">Công việc của công ty</TabsTrigger>
                    <TabsTrigger value="pending-jobs">Công việc chờ duyệt</TabsTrigger>
                </TabsList>

                {/* TAB 1 */}
                <TabsContent value="company-jobs">
                    {jobsLoading ? (
                        <div className="text-center py-10">Đang tải công việc...</div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-10">Chưa có công việc nào.</div>
                    ) : (
                        <div className="flex flex-col gap-4 w-full">
                            {jobs.filter((j) => j.status === "open" && profile.employer.status === 'VERIFIED').map((job) => (
                                <div
                                    key={job.jobId}
                                    onClick={() => navigate(`/jobs/${job.jobId}`)}
                                    className="flex justify-between items-center bg-white rounded-xl shadow-md p-5 border hover:bg-gray-50 cursor-pointer transition"
                                >
                                    <div className="flex items-center gap-5">
                                        <img
                                            src={
                                                company.logoUrl
                                                    ? `${MINIO_ENDPOINT}/datn/${company.logoUrl}`
                                                    : "/company-default.svg"
                                            }
                                            alt="Logo công ty"
                                            className="w-16 h-16 rounded-md object-cover border"
                                            onError={(e) => (e.currentTarget.src = "/company-default.svg")}
                                        />
                                        <div>
                                            <h3 className="font-semibold text-lg">{job.title}</h3>
                                            <p className="text-sm text-gray-600">{company.companyName}</p>
                                            <p className="text-txt-red font-medium">
                                                {job.minSalary && job.maxSalary
                                                    ? `${job.minSalary.toLocaleString("vi-VN")} - ${job.maxSalary.toLocaleString("vi-VN")} triệu VNĐ`
                                                    : "Thoả thuận"}
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                Trạng thái: <b>{job.status}</b>
                                            </p>
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <div
                                            className="flex flex-col gap-2 text-right"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openDialogJob(job)}
                                                >
                                                    Sửa
                                                </Button>

                                                {job.status !== "closed" && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleCloseJob(job.jobId)}
                                                    >
                                                        Đóng
                                                    </Button>
                                                )}

                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(job.jobId)}
                                                >
                                                    Xóa
                                                </Button>
                                            </div>
                                            <p className="text-gray-400 text-xs mt-1">
                                                Hạn: {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : ''}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                    )}
                </TabsContent>

                {/* TAB 2 */}
                <TabsContent value="pending-jobs">
                    {jobsLoading ? (
                        <div className="text-center py-10">Đang tải công việc...</div>
                    ) : (
                        <div className="flex flex-col gap-4">

                            {(isAdmin
                                ? jobs.filter((j) => j.status === "pending")
                                : jobs.filter((j) => j.createdBy === profile?.userId && j.status === 'pending')
                            ).map((job) => (
                                <div
                                    key={job.jobId}
                                    onClick={() => navigate(`/jobs/${job.jobId}`)}
                                    className="flex justify-between items-center bg-white rounded-xl shadow-md p-5 border hover:bg-gray-50 cursor-pointer transition"
                                >
                                    <div className="flex items-center gap-5">
                                        <img
                                            src={
                                                company.logoUrl
                                                    ? `${MINIO_ENDPOINT}/datn/${company.logoUrl}`
                                                    : "/company-default.svg"
                                            }
                                            alt="Logo công ty"
                                            className="w-16 h-16 rounded-md object-cover border"
                                            onError={(e) => (e.currentTarget.src = "/company-default.svg")}
                                        />
                                        <div>
                                            <h3 className="font-semibold text-lg">{job.title}</h3>
                                            <p className="text-sm text-gray-600">{company.companyName}</p>
                                            <p className="text-txt-red font-medium">
                                                {job.minSalary && job.maxSalary
                                                    ? `${job.minSalary.toLocaleString("vi-VN")} - ${job.maxSalary.toLocaleString("vi-VN")} triệu VNĐ`
                                                    : "Thoả thuận"}
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                Trạng thái: <b>{job.status}</b>
                                            </p>
                                        </div>
                                    </div>
                                    {isAdmin ? (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="default"
                                                disabled={updating === job.jobId}
                                                onClick={() => handleApproveOrReject(job.jobId, "open")}
                                            >
                                                {updating === job.jobId ? "Đang duyệt..." : "Duyệt"}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                disabled={updating === job.jobId}
                                                onClick={() => handleApproveOrReject(job.jobId, "closed")}
                                            >
                                                {updating === job.jobId ? "Đang xử lý..." : "Từ chối"}
                                            </Button>
                                            <p className="text-gray-400 text-xs mt-1">
                                                Hạn: {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : ''}
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="font-medium capitalize">
                                            {job.status === "open"
                                                ? "Đã duyệt"
                                                : job.status === "closed"
                                                    ? "Đã đóng"
                                                    : "Chờ duyệt"}
                                            <p className="text-gray-400 text-xs mt-1">
                                                Hạn: {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : ''}
                                            </p>
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

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
                            <input
                                id="company"
                                type="text"
                                className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                                value={company?.companyName ?? "Chưa có công ty"}
                                disabled
                            />
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
        </div>
    );
};

export default EmployerJobs;
