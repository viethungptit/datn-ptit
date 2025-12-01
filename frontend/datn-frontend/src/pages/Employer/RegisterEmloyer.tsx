import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "@/api/userApi";
import { toast } from "react-toastify";

const RegisterEmployer: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerApi({ email, password, fullName, phone, role: 'employer' });
            toast.success('Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP.');
            navigate(`/verify-otp?email=${encodeURIComponent(email)}&type=register`);
        } catch (err: any) {
            console.error('Register failed:', err);
            toast.error(err.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!");
        }
    };

    return (
        <div className="flex items-center justify-center h-full">
            <form
                onSubmit={handleSubmit}
                className="rounded shadow-lg border w-full max-w-md"
            >
                <div className="bg-background-red text-text-white p-5 rounded-t">
                    <h2 className="text-xl font-semibold text-center">Đăng ký tài khoản nhà tuyển dụng</h2>
                </div>
                <div className="p-6">
                    <div className="mb-4">
                        <label htmlFor="fullName" className="text-left block mb-2 text-sm font-medium text-gray-700">
                            Họ và tên
                        </label>
                        <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Nhập họ và tên"
                            required
                            className="w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="text-left block mb-2 text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập email"
                            required
                            className="w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="phone" className="text-left block mb-2 text-sm font-medium text-gray-700">
                            Số điện thoại
                        </label>
                        <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Nhập số điện thoại"
                            required
                            className="w-full"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="text-left block mb-2 text-sm font-medium text-gray-700">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                                required
                                className="w-full"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-txt-red text-sm"
                                onClick={() => setShowPassword((prev) => !prev)}
                                tabIndex={-1}
                            >
                                {showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                            </button>
                        </div>
                    </div>
                    <Button variant="login" type="submit" className="w-full mb-3">
                        Đăng ký
                    </Button>
                    <div className="text-center text-sm text-gray-600 mb-2">
                        Đã có tài khoản?{" "}
                        <Link
                            to="/employer/login"
                            className="text-txt-red font-medium hover:underline"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RegisterEmployer;
