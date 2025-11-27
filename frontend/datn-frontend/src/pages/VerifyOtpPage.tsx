import React, { useState, useEffect } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { Button } from '../components/ui/button';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyOtpApi, resetOtpApi } from '../api/userApi';
import { toast } from 'react-toastify';

const VerifyOtpPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email') || '';
    const type = searchParams.get('type') || 'register';

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [expired, setExpired] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    console.log('VerifyOtpPage rendered with email:', email, 'expired:', expired);

    useEffect(() => {
        // keep email & type available in url so user can reload and continue
        // no-op here since useSearchParams reads from URL
    }, [email, type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Thiếu email trong tham số URL');
            return;
        }
        setLoading(true);
        try {
            if (type !== 'register') {
                toast.error('Trang này chỉ dành cho kích hoạt tài khoản. Nếu bạn muốn đặt lại mật khẩu, vui lòng sử dụng trang đặt lại mật khẩu.');
                navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(code)}`);
            } else {
                await verifyOtpApi({ email, otp: code });
                toast.success('Xác minh OTP thành công');
                navigate('/login');
            }
        } catch (err: any) {
            console.error('Verify OTP failed:', err);
            const msg = err?.message || 'Xác minh thất bại';
            if (msg === "OTP hết hạn") {
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
            if (type === 'register') {
                await resetOtpApi({ email });
            } else {
                toast.info('Nếu bạn yêu cầu đặt lại mật khẩu, vui lòng sử dụng trang Quên mật khẩu để gửi lại OTP.');
            }
            setExpired(false);
            toast.success('OTP đã được gửi lại tới email của bạn');
        } catch (err: any) {
            console.error('Resend OTP failed:', err);
            const msg = err?.response?.data?.message || err?.message || 'Gửi lại OTP thất bại';
            toast.error(msg);
        } finally {
            setResendLoading(false);
        }
    };


    return (
        <div className="flex items-center justify-center h-full">
            <form onSubmit={handleSubmit} className="rounded shadow-lg border w-full max-w-md">
                <div className="bg-background-red text-text-white p-5 rounded-t">
                    <h2 className="text-xl font-semibold text-center">Xác thực mã OTP</h2>
                </div>
                <div className="p-6">
                    <p className="mb-4 text-sm text-gray-700">Vui lòng nhập mã OTP đã được gửi tới email <strong>{email}</strong></p>
                    <div className="mb-4 flex justify-center">
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
                    <Button variant="login" type="submit" className="w-full mb-3" disabled={loading}>
                        {loading ? 'Đang xác minh...' : 'Xác minh OTP'}
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

export default VerifyOtpPage;
