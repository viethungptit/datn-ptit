import React, { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { requestResetPasswordApi, resetPasswordApi } from '../api/userApi';
import { toast } from 'react-toastify';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email') || '';

    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [expired, setExpired] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Thiếu email trong tham số URL');
            return;
        }
        if (password.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        if (!code) {
            toast.error('Thiếu mã OTP');
            return;
        }
        setLoading(true);
        try {
            await resetPasswordApi({ email, newPassword: password, otp: code });
            toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.');
            navigate('/login');
        } catch (err: any) {
            console.error('Verify OTP failed:', err);
            const msg = err?.message || 'Xác minh thất bại';
            if (msg === "OTP đã hết hạn") {
                setExpired(true);
                toast.error('Mã OTP đã hết hạn. Vui lòng gửi lại OTP.');
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.error('Thiếu email trong tham số URL');
            return;
        }
        setResendLoading(true);
        try {
            await requestResetPasswordApi({ email });
            setExpired(false);
            toast.success('OTP đã được gửi lại tới email của bạn');
        } catch (err: any) {
            console.error('Resend OTP failed:', err);
            const msg = err?.message || 'Gửi lại OTP thất bại';
            toast.error(msg);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-full">
            <form onSubmit={handleSubmit} className="rounded shadow-lg border w-full max-w-md">
                <div className="bg-background-red text-text-white p-5 rounded-t">
                    <h2 className="text-xl font-semibold text-center">Đặt lại mật khẩu</h2>
                </div>
                <div className="p-6">
                    <div className="mb-4 flex flex-col items-center justify-center">
                        <p className="mb-4 text-sm text-gray-700">Vui lòng nhập mã OTP đã được gửi tới email <strong>{email}</strong></p>
                        <label htmlFor="code" className="hidden text-left mb-2 text-sm font-medium text-gray-700">Mã OTP</label>
                        <InputOTP
                            id="code"
                            value={code}
                            onChange={(val: any) => {
                                const raw = String(val ?? '');
                                const digits = raw.replace(/\D/g, '').slice(0, 6);
                                setCode(digits);
                            }}
                            maxLength={6}
                            className="w-full"
                        >
                            <InputOTPGroup>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <InputOTPSlot key={i} index={i} />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    <div>
                        <label htmlFor="password" className="text-left block mb-2 text-sm font-medium text-gray-700">Mật khẩu mới</label>
                        <div className="mb-4 relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
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
                    <Button variant="login" type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
                    </Button>
                    {expired && (
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-red-600 mb-2">Mã OTP đã hết hạn.</p>
                            <span
                                className={`text-red-600 text-sm font-medium cursor-pointer hover:underline ${resendLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={resendLoading ? () => { } : handleResend}
                            >
                                {resendLoading ? 'Đang gửi lại...' : 'Gửi lại OTP'}
                            </span>

                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ResetPasswordPage;
