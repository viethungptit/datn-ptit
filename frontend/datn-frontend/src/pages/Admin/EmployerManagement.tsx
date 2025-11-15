import { useEffect, useState } from "react";
// import { Button } from "../../components/ui/button";
// import { Input } from "../../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { useParams } from "react-router-dom";
import { getAllEmployersForCompanyApi, upsertEmployerForAdminApi } from "@/api/userApi";


export type Employer = {
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
    }
    admin: boolean;
    createdAt: string;
};

const statusLabels: Record<string, string> = {
    PENDING: "Chờ duyệt",
    VERIFIED: "Đã xác thực",
    REJECTED: "Từ chối",
};

const EmployerManagement = () => {
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [loading, setLoading] = useState(false);
    // const [openDialog, setOpenDialog] = useState(false);
    // const [form, setForm] = useState<Partial<Employer>>({});
    // const [isEdit, setIsEdit] = useState(false);
    const { companyId } = useParams<{ companyId: string }>();
    useEffect(() => {
        fetchEmployers();
    }, [companyId]);

    const fetchEmployers = async () => {
        setLoading(true);
        try {
            const res = await getAllEmployersForCompanyApi(companyId);
            console.log("data", res.data)
            setEmployers(res.data || []);
        } catch (err: any) {
            toast.error(err?.message || "Không thể tải danh sách nhân viên");
        } finally {
            setLoading(false);
        }
    };

    // const openDialogEmployer = (employer?: Employer) => {
    //     if (employer) {
    //         setForm({ ...employer });
    //         setIsEdit(true);
    //     } else {
    //         setForm({});
    //         setIsEdit(false);
    //     }
    //     setOpenDialog(true);
    // };

    // const handleSaveForm = async () => {
    //     if (!form.userId) return;
    //     try {
    //         await upsertEmployerForAdminApi(form.userId, {
    //             position: form.position,
    //             companyId,
    //             status: form.status,
    //             isAdmin: form.isAdmin,
    //         });
    //         toast.success("Cập nhật thành công");
    //         fetchEmployers();
    //         setOpenDialog(false);
    //     } catch (err: any) {
    //         toast.error(err?.message || "Lưu thất bại");
    //     }
    // };

    const handleChangeStatus = async (userId: string, status: Employer["status"]) => {
        try {
            const employer = employers.find(e => e.user.userId === userId);
            if (!employer) return;
            console.log({ status, isAdmin: employer.admin, companyId })
            await upsertEmployerForAdminApi(userId, { status, isAdmin: employer.admin, companyId });
            setEmployers(prev => prev.map(e => e.user.userId === userId ? { ...e, status } : e));
            toast.success("Cập nhật trạng thái thành công");
        } catch (err: any) {
            toast.error(err?.message || "Cập nhật thất bại");
        }
    };

    const handleChangeAdmin = async (userId: string, isAdmin: boolean) => {
        try {
            const employer = employers.find(e => e.user.userId === userId);
            if (!employer) return;
            console.log({ status: employer.status, isAdmin, companyId })
            await upsertEmployerForAdminApi(userId, { status: employer.status, isAdmin, companyId });
            setEmployers(prev => prev.map(e => e.user.userId === userId ? { ...e, admin: isAdmin } : e));
            toast.success("Cập nhật quyền admin thành công");
        } catch (err: any) {
            toast.error(err?.message || "Cập nhật thất bại");
        }
    };

    return (
        <div className="px-4 py-2">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Quản lý nhân viên</h2>
                {/* <Button variant="login" size="sm" onClick={() => openDialogEmployer()}>Thêm nhân viên</Button> */}
            </div>
            <div className="border rounded-lg overflow-x-auto">
                <Table className="text-sm text-gray-700">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Họ tên</TableHead>
                            <TableHead>SĐT</TableHead>
                            <TableHead>Vị trí</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Admin</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={8} className="text-center">Đang tải...</TableCell></TableRow>
                        ) : employers.length === 0 ? (
                            <TableRow><TableCell colSpan={8} className="text-center">Không có dữ liệu</TableCell></TableRow>
                        ) : employers.map(emp => (
                            <TableRow key={emp.userId}>
                                <TableCell>{emp.user.email}</TableCell>
                                <TableCell>{emp.user.fullName}</TableCell>
                                <TableCell>{emp.user.phone}</TableCell>
                                <TableCell>{emp.position || ""}</TableCell>
                                <TableCell>
                                    <Select value={emp.status} onValueChange={value => handleChangeStatus(emp.user.userId, value as Employer["status"])}>
                                        <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDING">{statusLabels.PENDING}</SelectItem>
                                            <SelectItem value="VERIFIED">{statusLabels.VERIFIED}</SelectItem>
                                            <SelectItem value="REJECTED">{statusLabels.REJECTED}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Checkbox checked={emp.admin} onCheckedChange={value => handleChangeAdmin(emp.user.userId, value as boolean)} />
                                </TableCell>
                                <TableCell>{new Date(emp.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                                <TableCell>

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog edit/create employee */}
            {/* <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Sửa nhân viên" : "Thêm nhân viên"}</DialogTitle>
                        <DialogDescription>
                            {isEdit ? "Chỉnh sửa thông tin nhân viên." : "Thêm nhân viên mới vào công ty."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Input
                                placeholder="Email"
                                value={form.email || ""}
                                disabled={isEdit}
                            />
                        </div>
                        <div>
                            <Input
                                placeholder="Họ tên"
                                value={form.fullName || ""}
                                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Input
                                placeholder="Số điện thoại"
                                value={form.phone || ""}
                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Input
                                placeholder="Vị trí"
                                value={form.position || ""}
                                onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
                        <Button onClick={handleSaveForm}>{isEdit ? "Lưu" : "Thêm"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}
        </div>
    );
};

export default EmployerManagement;
