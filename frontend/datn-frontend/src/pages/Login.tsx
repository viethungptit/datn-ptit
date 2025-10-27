import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import React, { useState } from "react";
import { login } from "../redux/authReduxAPI";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setAuthData } from "@/redux/authSlice";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let res = await login({ email, password });
            if (res.role === 'candidate') {
                dispatch(setAuthData(res));
                localStorage.setItem('accessToken', res.accessToken);
                toast.success("Đăng nhập thành công!");
                navigate("/");
            }
            else {
                toast.error("Trang đăng nhập này chỉ dành cho ứng viên!");
            }
        } catch (err: any) {
            console.error("Login failed:", err);
            toast.error(err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-full">
            <form
                onSubmit={handleSubmit}
                className="rounded shadow-lg border w-full max-w-md"
            >
                <div className="bg-background-red text-text-white p-5 rounded-t">
                    <h2 className="text-xl font-semibold text-center">Đăng nhập dành cho ứng viên</h2>
                </div>
                <div className="p-6">
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
                                className="w-full pr-10"
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
                    <Button variant="login" type="submit" className="w-full mb-3" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                    <Link
                        to="/forgot-password"
                        className="text-sm text-txt-red font-medium hover:underline mb-2"
                    >
                        Quên mật khẩu?
                    </Link>
                    <div className="text-center text-sm text-gray-600 ">
                        Chưa có tài khoản?{" "}
                        <Link
                            to="/register"
                            className="text-txt-red font-medium hover:underline"
                        >
                            Đăng ký ngay
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Login;
