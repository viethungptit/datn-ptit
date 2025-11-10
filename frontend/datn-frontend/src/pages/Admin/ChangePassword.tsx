import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import React, { useState } from "react";
import { changePasswordApi } from "@/api/userApi";
import { toast } from "react-toastify";

const ChangePassword: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Vui lòng điền đầy đủ các trường');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu mới không khớp');
            return;
        }

        try {
            setLoading(true);
            await changePasswordApi({ oldPassword: currentPassword, newPassword });
            toast.success('Đổi mật khẩu thành công');
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            console.error('Change password failed', err);
            const msg = err?.response?.data?.message || err?.message || 'Đổi mật khẩu thất bại';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-full">
            <form onSubmit={handleSubmit} className="rounded shadow-lg border w-full max-w-md">
                <div className="text-black p-5 rounded-t">
                    <h2 className="text-xl font-semibold text-center">Đổi mật khẩu</h2>
                </div>
                <div className="p-6">
                    <div className="mb-4">
                        <label htmlFor="currentPassword" className="text-left block mb-2 text-sm font-medium text-gray-700">
                            Mật khẩu hiện tại
                        </label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Nhập mật khẩu hiện tại"
                                required
                                className="w-full"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-txt-red text-sm"
                                onClick={() => setShowCurrent(prev => !prev)}
                                tabIndex={-1}
                            >
                                {showCurrent ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="newPassword" className="text-left block mb-2 text-sm font-medium text-gray-700">
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                                required
                                className="w-full"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-txt-red text-sm"
                                onClick={() => setShowNew(prev => !prev)}
                                tabIndex={-1}
                            >
                                {showNew ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="text-left block mb-2 text-sm font-medium text-gray-700">
                            Nhập lại mật khẩu mới
                        </label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                required
                                className="w-full"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-txt-red text-sm"
                                onClick={() => setShowConfirm(prev => !prev)}
                                tabIndex={-1}
                            >
                                {showConfirm ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="login" type="submit" className="flex-1" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
