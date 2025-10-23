import React, { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { requestResetPasswordApi } from '../api/userApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await requestResetPasswordApi({ email });
            toast.success('Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra email.');
            // Direct user to reset-password page where they can enter OTP + new password
            navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            console.error('Request reset password failed:', err);
            const msg = err?.response?.data?.message || err || err?.message || 'Yêu cầu thất bại';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-full">
            <form onSubmit={handleSubmit} className="rounded shadow-lg border w-full max-w-md">
                <div className="bg-background-red text-text-white p-5 rounded-t">
                    <h2 className="text-xl font-semibold text-center">Yêu cầu đặt lại mật khẩu</h2>
                </div>
                <div className="p-6">
                    <div className="mb-4">
                        <label htmlFor="email" className="text-left block mb-2 text-sm font-medium text-gray-700">Email</label>
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
                    <Button variant="login" type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ForgotPasswordPage;
