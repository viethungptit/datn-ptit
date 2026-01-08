import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { getAllEmployersForCompanyApi, getCurrentUserProfile, inviteEmployerApi, upsertEmployerForAdminApi } from "@/api/userApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";


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
    const [profile, setProfile] = useState<any | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const navigate = useNavigate();
    const [openInvite, setOpenInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviting, setInviting] = useState(false);
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await getCurrentUserProfile();
                setProfile(res.data);
                setCompanyId(res.data.company?.companyId);
            } catch (err) {
                toast.error("Không thể tải hồ sơ người dùng");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const fetchEmployers = async () => {
        setLoading(true);
        try {
            const res = await getAllEmployersForCompanyApi(companyId!);
            setEmployers(res.data || []);
        } catch (err: any) {
            toast.error(err?.message || "Không thể tải danh sách nhân viên");
        } finally {
            setLoading(false);
        }
    };
    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            toast.error("Vui lòng nhập email");
            return;
        }

        try {
            setInviting(true);
            await inviteEmployerApi(inviteEmail, companyId!);
            toast.success("Đã gửi lời mời thành công");
            setInviteEmail("");
            setOpenInvite(false);
            fetchEmployers(); // reload list nếu backend trả PENDING
        } catch (err: any) {
            toast.error(err?.message || "Gửi lời mời thất bại");
        } finally {
            setInviting(false);
        }
    };
    useEffect(() => {
        if (!companyId) return;
        fetchEmployers();
    }, [companyId]);

    const handleChangeStatus = async (userId: string, status: Employer["status"]) => {
        try {
            const employer = employers.find(e => e.user.userId === userId);
            if (!employer) return;
            await upsertEmployerForAdminApi(userId, { status, isAdmin: employer.admin, companyId: companyId! });
            setEmployers(prev => prev.map(e => e.user.userId === userId ? { ...e, status } : e));
            toast.success("Cập nhật trạng thái thành công");
        } catch (err: any) {
            toast.error(err?.message || "Cập nhật thất bại");
        }
    };

    // const handleChangeAdmin = async (userId: string, isAdmin: boolean) => {
    //     try {
    //         const employer = employers.find(e => e.user.userId === userId);
    //         if (!employer) return;
    //         await upsertEmployerForAdminApi(userId, { status: employer.status, isAdmin, companyId: companyId! });
    //         setEmployers(prev => prev.map(e => e.user.userId === userId ? { ...e, admin: isAdmin } : e));
    //         toast.success("Cập nhật quyền admin thành công");
    //     } catch (err: any) {
    //         toast.error(err?.message || "Cập nhật thất bại");
    //     }
    // };

    if (!profile?.employer?.admin)
        return (
            <div className="text-center py-10">
                <h1 className="mb-4">Bạn không có quyền truy cập</h1>
                <Button onClick={() => navigate("/employer/profile")}>Trở về</Button>
            </div>
        );

    if (!companyId)
        return (
            <div className="text-center py-10">
                <h1 className="mb-4">Hồ sơ của bạn chưa được xác thực</h1>
                <Button onClick={() => navigate("/employer/profile")}>Xem thông tin</Button>
            </div>
        );

    if (profile?.employer?.status !== 'VERIFIED')
        return (
            <div className="text-center py-10">
                <h1 className="mb-4">Hồ sơ của bạn chưa được xác thực</h1>
                <Button onClick={() => navigate("/employer/profile")}>Xem thông tin</Button>
            </div>
        );

    if (profile?.company?.deleted === true)
        return (
            <div className="text-center py-10">
                <h1 className="mb-4">Công ty của bạn đã giải thể</h1>
                <Button onClick={() => navigate("/employer/profile")}>Xem thông tin</Button>
            </div>
        );

    return (
        <div className="px-4 py-2">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Quản lý nhân viên</h2>
                <Dialog open={openInvite} onOpenChange={setOpenInvite}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">
                            Mời thành viên
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Mời thành viên qua email</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-3">
                            <Input
                                placeholder="Nhập email người cần mời"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                type="email"
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setOpenInvite(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleInvite}
                                disabled={inviting}
                            >
                                {inviting ? "Đang gửi..." : "Gửi lời mời"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
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
                            <TableRow><TableCell colSpan={7} className="text-center">Đang tải...</TableCell></TableRow>
                        ) : employers.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center">Không có dữ liệu</TableCell></TableRow>
                        ) : employers.map(emp => (
                            <TableRow key={emp.userId}>
                                <TableCell className="text-left">{emp.user.email}</TableCell>
                                <TableCell className="text-left">{emp.user.fullName}</TableCell>
                                <TableCell className="text-left">{emp.user.phone}</TableCell>
                                <TableCell className="text-left">{emp.position || ""}</TableCell>
                                <TableCell className="text-left">
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
                                    <Checkbox checked={emp.admin}
                                    // onCheckedChange={value => handleChangeAdmin(emp.user.userId, value as boolean)}
                                    />
                                </TableCell>
                                <TableCell className="text-left">{new Date(emp.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default EmployerManagement;
