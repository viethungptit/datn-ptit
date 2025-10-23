
import { useEffect, useState } from 'react';
import { getCurrentUserProfile } from '../api/userApi';

const MyProfile: React.FC = () => {
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await getCurrentUserProfile();
                setProfile(res.data);
                console.log('My Profile:', res.data);
                setError(null);
            } catch {
                setError('Không thể tải thông tin hồ sơ');
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="p-6 flex flex-col items-center">
                <h1 className="text-2xl font-semibold mb-6">Hồ sơ của tôi</h1>
                <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl flex flex-col items-center">
                    <span>Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 flex flex-col items-center">
                <h1 className="text-2xl font-semibold mb-6">Hồ sơ của tôi</h1>
                <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl flex flex-col items-center">
                    <span className="text-red-500">{error}</span>
                </div>
            </div>
        );
    }

    const getValue = (val: any) => (val ? val : 'Chưa cập nhật');
    const candidate = profile?.candidate || {};

    return (
        <div className="p-2 flex flex-col items-center">
            <h1 className="text-xl font-semibold mb-2">Hồ sơ của tôi</h1>
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl flex flex-col items-center">
                <img
                    src={getValue(candidate.avatarUrl) !== 'Chưa cập nhật' ? candidate.avatarUrl : '/avatar-default.svg'}
                    alt="Avatar"
                    className="w-32 h-32 p-1 rounded-full object-cover mb-4 border"
                    onError={e => (e.currentTarget.src = '/avatar-default.svg')}
                />
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-1">{getValue(profile?.fullName)}</h2>
                    <span className="font-semibold text-lg">{profile?.role === 'candidate' ? 'Ứng viên' : profile?.role === 'employer' ? 'Nhà tuyển dụng' : 'Chưa cập nhật'}</span>
                </div>
                <div className="w-full">
                    <div className="grid grid-cols-2 gap-4 mb-2 text-left">
                        <div className="font-medium text-gray-700">Email:</div>
                        <div className="text-gray-900">{getValue(profile?.email)}</div>
                        <div className="font-medium text-gray-700">Số điện thoại:</div>
                        <div className="text-gray-900">{getValue(profile?.phone)}</div>
                        <div className="font-medium text-gray-700">Ngày sinh:</div>
                        <div className="text-gray-900">{getValue(candidate.dob)}</div>
                        <div className="font-medium text-gray-700">Giới tính:</div>
                        <div className="text-gray-900">{candidate.gender === 'male' ? 'Nam' : candidate.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}</div>
                        <div className="font-medium text-gray-700">Địa chỉ:</div>
                        <div className="text-gray-900">{getValue(candidate.address)}</div>
                        <div className="font-medium text-gray-700">Ngày tạo tài khoản:</div>
                        <div className="text-gray-900">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                        <div className="font-medium text-gray-700">Trạng thái:</div>
                        <div className="text-gray-900">{profile?.active === true ? 'Hoạt động' : profile?.active === false ? 'Không hoạt động' : 'Chưa cập nhật'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;