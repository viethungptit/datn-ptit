import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "../../components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import {
    getAllJobTags,
    createJobTag,
    updateJobTag,
    deleteJobTag,
    getAllGroupJobTags,
    createGroupJobTag,
    updateGroupJobTag,
    deleteGroupJobTag,
} from "../../api/recruitApi";
import { toast } from "react-toastify";

type JobTag = { id: string; jobName: string };
type GroupTag = { id: string; groupJobName: string };

const TagManagement: React.FC = () => {
    const [dialogTarget, setDialogTarget] = useState<"job" | "group">("job");
    const [jobTags, setJobTags] = useState<JobTag[]>([]);
    const [groupTags, setGroupTags] = useState<GroupTag[]>([]);
    const [loading, setLoading] = useState(false);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [nameValue, setNameValue] = useState("");

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [jobsRes, groupsRes] = await Promise.all([
                getAllJobTags(),
                getAllGroupJobTags(),
            ]);

            const jobsData = (jobsRes as any).data ?? jobsRes;
            const groupsData = (groupsRes as any).data ?? groupsRes;

            setJobTags(
                Array.isArray(jobsData)
                    ? jobsData.map((j: any) => ({ id: j.id ?? j.jobTagId ?? j.job_tag_id ?? String(j), jobName: j.jobName ?? j.job_name ?? j.name ?? "" }))
                    : []
            );
            setGroupTags(
                Array.isArray(groupsData)
                    ? groupsData.map((g: any) => ({ id: g.id ?? g.groupTagId ?? g.group_tag_id ?? String(g), groupJobName: g.groupJobName ?? g.group_job_name ?? g.name ?? "" }))
                    : []
            );
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải danh sách thẻ");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = (tab: "job" | "group") => {
        setDialogTarget(tab);
        setIsEditing(false);
        setCurrentId(null);
        setNameValue("");
        setIsDialogOpen(true);
    };

    const openEdit = (tab: "job" | "group", id: string, name: string) => {
        setDialogTarget(tab);
        setIsEditing(true);
        setCurrentId(id);
        setNameValue(name);
        setIsDialogOpen(true);
    };

    const onDelete = async (tab: "job" | "group", id: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa mục này?")) return;
        try {
            if (tab === "job") {
                await deleteJobTag(id);
                toast.success("Xóa thẻ công việc thành công");
            } else {
                await deleteGroupJobTag(id);
                toast.success("Xóa thẻ ngành nghề thành công");
            }
            fetchAll();
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Xóa thất bại");
        }
    };

    const onSave = async () => {
        const value = nameValue.trim();
        if (!value) {
            toast.warn("Vui lòng nhập tên");
            return;
        }
        try {
            if (dialogTarget === "job") {
                if (isEditing && currentId) {
                    await updateJobTag(currentId, { jobName: value });
                    toast.success("Cập nhật thẻ công việc thành công");
                } else {
                    await createJobTag({ jobName: value });
                    toast.success("Tạo thẻ công việc thành công");
                }
            } else {
                if (isEditing && currentId) {
                    await updateGroupJobTag(currentId, { groupJobName: value });
                    toast.success("Cập nhật thẻ ngành nghề thành công");
                } else {
                    await createGroupJobTag({ groupJobName: value });
                    toast.success("Tạo thẻ ngành nghề thành công");
                }
            }
            setIsDialogOpen(false);
            fetchAll();
        } catch (err: any) {
            toast.error(err?.message || "Lưu thất bại");
        }
    };

    return (
        <div className="px-4 py-2">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Quản lý thẻ</h2>
            </div>

            <div className="flex flex-col justify-between gap-10">
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold">Thẻ công việc</h2>
                        <Button variant="login" size="sm" onClick={() => openCreate("job")}>Thêm thẻ công việc</Button>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm">
                        {loading ? (
                            <div className="p-6 text-center">Đang tải...</div>
                        ) : jobTags.length === 0 ? (
                            <div className="p-6 text-center text-muted-foreground">Không có thẻ nào</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[220px] overflow-y-auto">
                                {jobTags.map((t, idx) => (
                                    <div key={t.id} className="flex items-center justify-between border rounded-md p-4">
                                        <div className="flex flex-row items-center gap-2">
                                            <div className="text-sm text-left text-muted-foreground">#{idx + 1}</div>
                                            <div className="text-sm text-left font-semibold">{t.jobName}</div>
                                        </div>
                                        <div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm"><i className="fa-solid fa-ellipsis" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => openEdit("job", t.id, t.jobName)}>Sửa</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onDelete("job", t.id)}>Xóa</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold">Thẻ ngành nghề</h2>
                        <Button variant="login" size="sm" onClick={() => openCreate("group")}>Thêm thẻ ngành nghề</Button>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm">
                        {loading ? (
                            <div className="p-6 text-center">Đang tải...</div>
                        ) : groupTags.length === 0 ? (
                            <div className="p-6 text-center text-muted-foreground">Không có thẻ nào</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[220px] overflow-y-auto">
                                {groupTags.map((g, idx) => (
                                    <div key={g.id} className="flex items-center justify-between border rounded-md p-4">
                                        <div className="flex flex-row items-center gap-2">
                                            <div className="text-sm text-left text-muted-foreground">#{idx + 1}</div>
                                            <div className="text-sm text-left font-semibold">{g.groupJobName}</div>
                                        </div>
                                        <div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm"><i className="fa-solid fa-ellipsis" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => openEdit("group", g.id, g.groupJobName)}>Sửa</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onDelete("group", g.id)}>Xóa</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Sửa" : "Tạo mới"} {dialogTarget === "job" ? "Thẻ công việc" : "Thẻ ngành nghề"}</DialogTitle>
                        <DialogDescription className="mb-4">Nhập tên thẻ và lưu thay đổi.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tên</label>
                            <Input value={nameValue} onChange={(e) => setNameValue(e.target.value)} placeholder={dialogTarget === "job" ? "VD: Frontend" : "VD: Công nghệ"} />
                        </div>
                    </div>

                    <DialogFooter>
                        <div className="flex gap-2 ml-auto">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                            <Button onClick={onSave}>{isEditing ? "Cập nhật" : "Tạo"}</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TagManagement;
