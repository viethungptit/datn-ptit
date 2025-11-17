import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";
import { getAllEmployersForCompanyApi, upsertEmployerForAdminApi } from "@/api/userApi";

type Employer = {
    userId: string;
    email: string;
    fullName: string;
    phone: string;
    position?: string;
    status: "PENDING" | "VERIFIED" | "REJECTED";
    user: {
        userId: string;
        email: string;
        phone: string;
        fullName: string;
    };
    admin: boolean;
    createdAt: string;
};

const employerStatusLabels: Record<string, string> = {
    PENDING: "Chờ duyệt",
    VERIFIED: "Đã xác thực",
    REJECTED: "Từ chối",
};

interface Props {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    companyId?: string;
    companyName?: string;
}

export default function EmployerDialog({ open, onOpenChange, companyId, companyName }: Props) {
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (!companyId) return;
        (async () => {
            setLoading(true);
            try {
                const res = await getAllEmployersForCompanyApi(companyId);
                setEmployers(res.data || []);
            } catch (err: any) {
                toast.error(err?.message || "Không thể tải danh sách nhân viên");
            } finally {
                setLoading(false);
            }
        })();
    }, [open, companyId]);

    const handleChangeStatus = async (userId: string, status: Employer["status"]) => {
        try {
            const employer = employers.find((e) => e.user.userId === userId);
            if (!employer) return;
            await upsertEmployerForAdminApi(userId, { status, isAdmin: employer.admin, companyId: companyId ?? undefined });
            setEmployers((prev) => prev.map((e) => (e.user.userId === userId ? { ...e, status } : e)));
            toast.success("Cập nhật trạng thái thành công");
        } catch (err: any) {
            toast.error(err?.message || "Cập nhật thất bại");
        }
    };

    const handleChangeAdmin = async (userId: string, isAdmin: boolean) => {
        try {
            const employer = employers.find((e) => e.user.userId === userId);
            if (!employer) return;
            await upsertEmployerForAdminApi(userId, { status: employer.status, isAdmin, companyId: companyId ?? undefined });
            setEmployers((prev) => prev.map((e) => (e.user.userId === userId ? { ...e, admin: isAdmin } : e)));
            toast.success("Cập nhật quyền admin thành công");
        } catch (err: any) {
            toast.error(err?.message || "Cập nhật thất bại");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl">
                <DialogHeader>
                    <DialogTitle>Quản lý nhân viên {companyName ?? ""}</DialogTitle>
                    <DialogDescription>Quản lý danh sách nhân viên của công ty</DialogDescription>
                </DialogHeader>

                <div className="border rounded-lg overflow-x-auto">
                    <Table className="text-sm text-gray-700">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Họ tên</TableHead>
                                <TableHead>SĐT</TableHead>
                                <TableHead>Vị trí</TableHead>
                                <TableHead className="text-center">Trạng thái</TableHead>
                                <TableHead className="text-center">Admin</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : employers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employers.map((emp) => (
                                    <TableRow key={emp.userId}>
                                        <TableCell className="text-left">{emp.user.email}</TableCell>
                                        <TableCell className="text-left">{emp.user.fullName}</TableCell>
                                        <TableCell className="text-left">{emp.user.phone}</TableCell>
                                        <TableCell className="text-left">{emp.position || ""}</TableCell>
                                        <TableCell className="text-left max-w-28">
                                            <Select value={emp.status} onValueChange={(value) => handleChangeStatus(emp.user.userId, value as Employer["status"])}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn trạng thái" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PENDING">{employerStatusLabels.PENDING}</SelectItem>
                                                    <SelectItem value="VERIFIED">{employerStatusLabels.VERIFIED}</SelectItem>
                                                    <SelectItem value="REJECTED">{employerStatusLabels.REJECTED}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox checked={emp.admin} onCheckedChange={(value) => handleChangeAdmin(emp.user.userId, value as boolean)} />
                                        </TableCell>
                                        <TableCell className="text-left">{new Date(emp.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button size="sm">Đóng</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
