import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { createNewUserApi, deleteUserApi, getAllUsersApi, updateUserApi } from "@/api/userApi";

export type User = {
    userId: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    createdAt: string;
    deleted: boolean;
    active: boolean;
};


const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    // include password in the form for create/update
    const [form, setForm] = useState<Partial<User & { password?: string }>>({});
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await getAllUsersApi();
                if (!res || !res.data) throw new Error("Failed to fetch users");
                setUsers(res.data);
            } catch (err: any) {
                const msg = err?.response?.data?.message || err?.message || "Không thể tải danh sách người dùng";
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Gộp logic mở dialog thêm/sửa vào 1 hàm
    const openDialogUser = (user?: User) => {
        if (user) {
            // don't prefill password when editing
            const { userId, email, fullName, phone, role, createdAt, deleted, active } = user;
            setForm({ userId, email, fullName, phone, role, createdAt, deleted, active });
            setIsEdit(true);
        } else {
            setForm({});
            setIsEdit(false);
        }
        setOpenDialog(true);
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
        try {
            await deleteUserApi(userId);
            setUsers(users.filter(u => u.userId !== userId));
            toast.success("Đã xóa người dùng");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Xóa thất bại";
            toast.error(msg);
        }
    };

    const handleSubmit = async () => {
        try {
            if (isEdit && form.userId) {
                // updateUserApi signature: (userId, { password: string, fullName?: string, phone?: string, role?: string })
                await updateUserApi(form.userId, {
                    password: form.password || '',
                    fullName: form.fullName,
                    phone: form.phone,
                    role: form.role,
                });
                setUsers(users.map(u => (u.userId === form.userId ? { ...u, ...form } as User : u)));
                toast.success("Cập nhật thành công");
            } else {
                // validate required fields for creation
                if (!form.email || !form.password || !form.role) {
                    toast.error('Vui lòng nhập email, mật khẩu và vai trò');
                    return;
                }
                // createNewUserApi expects non-optional fullName and phone, so default to empty strings if not provided
                const payload = {
                    email: form.email,
                    password: form.password,
                    fullName: form.fullName || '',
                    phone: form.phone || '',
                    role: form.role,
                };
                const res = await createNewUserApi(payload);
                const newUser = res?.data;
                if (newUser) setUsers([...users, newUser]);
                toast.success("Thêm thành công");
            }
            setOpenDialog(false);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Lưu thất bại";
            toast.error(msg);
        }
    };

    return (
        <div className="px-4 py-2">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Quản lý người dùng</h2>
                <Button onClick={() => openDialogUser()}>Thêm người dùng</Button>
            </div>
            <div className="border rounded-lg overflow-x-auto">
                <Table className="text-sm text-gray-700">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-left">Email</TableHead>
                            <TableHead className="text-left">Họ tên</TableHead>
                            <TableHead className="text-left">SĐT</TableHead>
                            <TableHead className="text-left">Vai trò</TableHead>
                            <TableHead className="text-left">Ngày tạo</TableHead>
                            <TableHead className="text-left">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">Đang tải...</TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">Không có dữ liệu</TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.userId}>
                                    <TableCell className="text-left">{user.email}</TableCell>
                                    <TableCell className="text-left">{user.fullName}</TableCell>
                                    <TableCell className="text-left">{user.phone}</TableCell>
                                    <TableCell className="text-left">
                                        {user.role === 'admin' ? 'Quản trị viên' : user.role === 'employer' ? 'Nhà tuyển dụng' : user.role === 'candidate' ? 'Ứng viên' : user.role}
                                    </TableCell>
                                    <TableCell className="text-left">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                                    <TableCell className="text-left">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openDialogUser(user)}>Sửa</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(user.userId)}>Xóa</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Sửa người dùng" : "Thêm người dùng"}</DialogTitle>
                        <DialogDescription>
                            {isEdit ? "Chỉnh sửa thông tin người dùng." : "Thêm người dùng mới vào hệ thống."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="Email"
                                value={form.email || ""}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="fullName">Họ tên</Label>
                            <Input
                                id="fullName"
                                placeholder="Họ tên"
                                value={form.fullName || ""}
                                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input
                                id="phone"
                                placeholder="Số điện thoại"
                                value={form.phone || ""}
                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Mật khẩu"
                                value={form.password || ""}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="role">Vai trò</Label>
                            <Select
                                value={form.role || ""}
                                onValueChange={value => setForm(f => ({ ...f, role: value }))}
                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Quản trị viên</SelectItem>
                                    <SelectItem value="employer">Nhà tuyển dụng</SelectItem>
                                    <SelectItem value="candidate">Ứng viên</SelectItem>
                                </SelectContent>
                            </Select>
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

export default UserManagement;
