import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Register: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ email, password, full_name: fullName, phone });
    };

    return (
        <div className="flex items-center justify-center h-full">
            <form
                onSubmit={handleSubmit}
                className="rounded shadow-lg border w-full max-w-md"
            >
                <div className="bg-background-red text-text-white p-5 rounded-t">
                    <h2 className="text-xl font-semibold text-center">Đăng ký tài khoản ứng viên</h2>
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
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            required
                            className="w-full"
                        />
                    </div>
                    <Button variant="login" type="submit" className="w-full mb-3">
                        Đăng ký
                    </Button>
                    <div className="text-center text-sm text-gray-600 mb-2">
                        Đã có tài khoản?{" "}
                        <Link
                            to="/login"
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

export default Register;
