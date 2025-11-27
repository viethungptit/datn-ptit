import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { MINIO_ENDPOINT } from '@/api/serviceConfig';
import { createNewUserApi, deleteUserApi, getAllUsersApiWithPagination, updateUserApi } from "@/api/userApi";
import Pagination from "@/components/Pagination/Pagination";

export type User = {
    userId: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    createdAt: string;
    deleted: boolean;
    active: boolean;
    // optional nested objects returned by API
    candidate?: any;
    employer?: any;
    company?: any;
};


const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    // include password in the form for create/update
    const [form, setForm] = useState<Partial<User & { password?: string }>>({});
    const [isEdit, setIsEdit] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const getValue = (val: any) => (val ? val : 'Chưa cập nhật');

    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await getAllUsersApiWithPagination(page, pageSize);
                if (!res || !res.data) throw new Error("Failed to fetch users");
                setUsers(res.data.content);
                setTotalPages(res.data.totalPages)
            } catch (err: any) {
                const msg = err?.response?.data?.message || err?.message || "Không thể tải danh sách người dùng";
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        })();
    }, [page, pageSize]);

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

    const openViewUser = (user: User) => {
        setSelectedUser(user);
        setViewDialogOpen(true);
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
                if (!form.email || !form.password || !form.role || !form.fullName || !form.phone) {
                    toast.error('Vui lòng nhập đầy đủ thông tin');
                    return;
                }
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
                if (!form.email || !form.password || !form.role || !form.fullName || !form.phone) {
                    toast.error('Vui lòng nhập đầy đủ thông tin');
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
        <div className="px-4 py-2 relative min-h-screen">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Quản lý người dùng</h2>
                <Button variant="login" size="sm" onClick={() => openDialogUser()}>Thêm người dùng</Button>
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
                            <TableHead className="text-center">Hành động</TableHead>
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
                                    <TableCell className="text-left py-6">{user.email}</TableCell>
                                    <TableCell className="text-left">{user.fullName}</TableCell>
                                    <TableCell className="text-left">{user.phone}</TableCell>
                                    <TableCell className="text-left">
                                        {user.role === 'admin' ? 'Quản trị viên' : user.role === 'employer' ? 'Nhà tuyển dụng' : user.role === 'candidate' ? 'Ứng viên' : user.role}
                                    </TableCell>
                                    <TableCell className="text-left">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openViewUser(user)}>Xem</Button>
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
            <div className="absolute bottom-3 right-0 left-0">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
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
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Thông tin người dùng</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {selectedUser ? (
                            selectedUser.role === 'candidate' ? (
                                <div className="flex flex-col items-center">
                                    <img
                                        src={selectedUser.candidate?.avatarUrl ? `${MINIO_ENDPOINT}/datn/${selectedUser.candidate.avatarUrl}` : '/avatar-default.svg'}
                                        alt="Avatar"
                                        className="w-28 h-28 p-1 rounded-full object-cover mb-4 border"
                                        onError={e => (e.currentTarget.src = '/avatar-default.svg')}
                                    />
                                    <h2 className="text-lg font-semibold">{getValue(selectedUser.fullName)}</h2>
                                    <span className="text-sm text-gray-600 mb-3">Ứng viên</span>
                                    <div className="w-full">
                                        <div className="grid grid-cols-2 gap-4 text-left text-sm">
                                            <div className="font-medium text-gray-700">Email:</div>
                                            <div className="text-gray-900">{getValue(selectedUser.email)}</div>
                                            <div className="font-medium text-gray-700">Số điện thoại:</div>
                                            <div className="text-gray-900">{getValue(selectedUser.phone)}</div>
                                            <div className="font-medium text-gray-700">Ngày sinh:</div>
                                            <div className="text-gray-900">{selectedUser.candidate?.dob ? new Date(selectedUser.candidate.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                                            <div className="font-medium text-gray-700">Giới tính:</div>
                                            <div className="text-gray-900">{selectedUser.candidate?.gender === 'male' ? 'Nam' : selectedUser.candidate?.gender === 'female' ? 'Nữ' : selectedUser.candidate?.gender === 'other' ? 'Khác' : 'Chưa cập nhật'}</div>
                                            <div className="font-medium text-gray-700">Địa chỉ:</div>
                                            <div className="text-gray-900">{getValue(selectedUser.candidate?.address)}</div>
                                            <div className="font-medium text-gray-700">Ngày tạo tài khoản:</div>
                                            <div className="text-gray-900">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                                            <div className="font-medium text-gray-700">Trạng thái:</div>
                                            <div className="text-gray-900">{selectedUser.active === true ? 'Hoạt động' : selectedUser.active === false ? 'Không hoạt động' : 'Chưa cập nhật'}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : selectedUser.role === 'employer' ? (
                                <div className="w-full">
                                    <div className="bg-white p-2">
                                        <h3 className="font-semibold mb-2">Thông tin cá nhân</h3>
                                        <div className="grid grid-cols-2 gap-4 text-left text-sm mb-4">
                                            <div className="font-medium text-gray-700">Họ và tên:</div>
                                            <div className="text-gray-900">{getValue(selectedUser.fullName)}</div>
                                            <div className="font-medium text-gray-700">Ngày tạo tài khoản:</div>
                                            <div className="text-gray-900">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                                            <div className="font-medium text-gray-700">Trạng thái:</div>
                                            <div className="text-gray-900">{selectedUser.active === true ? 'Hoạt động' : selectedUser.active === false ? 'Không hoạt động' : 'Chưa cập nhật'}</div>
                                            <div className="font-medium text-gray-700">Vị trí:</div>
                                            <div className="text-gray-900">{selectedUser.employer?.position || 'Chưa cập nhật'}</div>
                                            <div className="font-medium text-gray-700">Quyền hạn:</div>
                                            <div className="text-gray-900">{selectedUser.employer?.admin ? 'Quản trị nhân sự' : selectedUser.employer?.admin === false ? 'Nhân viên' : 'Chưa cập nhật'}</div>
                                        </div>

                                        <h3 className="font-semibold mb-2">Thông tin công ty</h3>
                                        {selectedUser.company ? (
                                            <div className="grid grid-cols-2 gap-4 text-left text-sm">
                                                <div className="font-medium text-gray-700">Tên công ty:</div>
                                                <div className="text-gray-900">{selectedUser.company.companyName || 'Chưa cập nhật'}</div>
                                                <div className="font-medium text-gray-700">Ngành nghề:</div>
                                                <div className="text-gray-900">{selectedUser.company.industry || 'Chưa cập nhật'}</div>
                                                <div className="font-medium text-gray-700">Quy mô:</div>
                                                <div className="text-gray-900">{selectedUser.company.companySize ? `${selectedUser.company.companySize} nhân viên` : 'Chưa cập nhật'}</div>
                                                <div className="font-medium text-gray-700">Website:</div>
                                                <div className="text-gray-900">{selectedUser.company.website || 'Chưa cập nhật'}</div>
                                                <div className="font-medium text-gray-700">Địa điểm:</div>
                                                <div className="text-gray-900">{selectedUser.company.location || 'Chưa cập nhật'}</div>
                                                <div className="font-medium text-gray-700">Ngày tạo:</div>
                                                <div className="text-gray-900">{selectedUser.company.createdAt ? new Date(selectedUser.company.createdAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                                                <div className="font-medium text-gray-700">Trạng thái:</div>
                                                <div className="text-gray-900">{selectedUser.company.verified ? 'Đã xác minh' : 'Chưa xác minh'}</div>
                                            </div>
                                        ) : (
                                            <div className="text-sm">Chưa có thông tin công ty</div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <div className="grid grid-cols-2 gap-4 text-left text-sm">
                                        <div className="font-medium text-gray-700">Email:</div>
                                        <div className="text-gray-900">{getValue(selectedUser.email)}</div>
                                        <div className="font-medium text-gray-700">Họ tên:</div>
                                        <div className="text-gray-900">{getValue(selectedUser.fullName)}</div>
                                        <div className="font-medium text-gray-700">Số điện thoại:</div>
                                        <div className="text-gray-900">{getValue(selectedUser.phone)}</div>
                                        <div className="font-medium text-gray-700">Vai trò:</div>
                                        <div className="text-gray-900">{selectedUser.role ? "Quản trị viên" : 'Chưa cập nhật'}</div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div>Không có dữ liệu</div>
                        )}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Đóng</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;
