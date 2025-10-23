
import { useEffect, useState } from 'react';
import { getCurrentUserProfile } from '../../api/userApi';
import { MINIO_ENDPOINT } from '@/api/serviceConfig';
import { Button } from '@/components/ui/button';

const EmployerProfile: React.FC = () => {
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await getCurrentUserProfile();
                setProfile(res.data);
                console.log('Employer Profile:', res.data);
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
            <div className="w-full p-6 flex flex-col items-center">
                <h1 className="text-xl font-semibold mb-6">Hồ sơ của tôi</h1>
                <div className='flex flex-row justify-between w-full'>
                    <div className="bg-white shadow-lg rounded-lg py-5 px-8 border-2 w-[49%] flex flex-col items-center">
                        <h2 className='font-semibold text-xl mb-3'>Thông tin cá nhân</h2>
                        <span>Đang tải</span>
                    </div>
                    <div className="bg-white shadow-lg rounded-lg px-8 py-5 border-2 w-[49%] flex flex-col items-center">
                        <h2 className='font-semibold text-xl mb-3'>Thông tin công ty</h2>
                        <span>Đang tải</span>
                    </div>
                </div >
            </div >
        );
    }


    if (error) {
        return (
            <div className="w-full p-6 flex flex-col items-center">
                <h1 className="text-xl font-semibold mb-6">Hồ sơ của tôi</h1>
                <div className='flex flex-row justify-between w-full'>
                    <div className="bg-white shadow-lg rounded-lg py-5 px-8 border-2 w-[49%] flex flex-col items-center">
                        <h2 className='font-semibold text-xl mb-3'>Thông tin cá nhân</h2>
                        <span className="text-red-500">{error}</span>
                    </div>
                    <div className="bg-white shadow-lg rounded-lg px-8 py-5 border-2 w-[49%] flex flex-col items-center">
                        <h2 className='font-semibold text-xl mb-3'>Thông tin công ty</h2>
                        <span className="text-red-500">{error}</span>
                    </div>
                </div >
            </div >
        );
    }

    const getValue = (val: any) => (val ? val : 'Chưa cập nhật');
    const employer = profile?.employer || null;
    const company = profile?.company || null;

    return (
        <div className="w-full py-10 px-3 flex flex-col items-center">
            <h1 className="text-xl font-semibold mb-6">Hồ sơ của tôi</h1>
            <div className='flex flex-row justify-between w-full'>
                <div className="bg-white shadow-lg rounded-lg py-5 px-8 border-2 w-[49%] flex flex-col items-center">
                    <h2 className='font-semibold text-lg mb-3'>Thông tin cá nhân</h2>
                    <img
                        src={'/avatar-default.svg'}
                        alt="Avatar"
                        className="w-28 mb-6 h-28 p-2 rounded-full object-cover border-2"
                        onError={e => (e.currentTarget.src = '/avatar-default.svg')}
                    />
                    <div className="w-full">
                        <div className="grid grid-cols-2 gap-4 mb-2 text-left text-sm">
                            <div className="font-medium text-gray-700">Họ và tên:</div>
                            <div className="text-gray-900">{getValue(profile?.fullName)}</div>
                            <div className="font-medium text-gray-700">Ngày tạo tài khoản:</div>
                            <div className="text-gray-900">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                            <div className="font-medium text-gray-700">Trạng thái:</div>
                            <div className="text-gray-900">{profile?.active === true ? 'Hoạt động' : profile?.active === false ? 'Không hoạt động' : 'Chưa cập nhật'}</div>
                            <div className="font-medium text-gray-700">Vị trí:</div>
                            <div className="text-gray-900">{employer?.position || 'Chưa cập nhật'}</div>
                            <div className="font-medium text-gray-700">Trạng thái việc làm:</div>
                            <div className="text-gray-900">
                                {employer?.active == null
                                    ? 'Chưa cập nhật'
                                    : employer.active
                                        ? 'Đang làm việc'
                                        : 'Không làm việc'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white shadow-lg rounded-lg px-8 py-5 border-2 w-[49%] flex flex-col items-center">
                    <h2 className='font-semibold text-lg mb-3'>Thông tin công ty</h2>
                    {
                        company === null ? (
                            <div className="mt-20 flex flex-col items-center gap-3">
                                <span className="font-semibold">Chưa có thông tin công ty</span>
                                <Button variant="seek">Thêm thông tin công ty</Button>
                            </div>
                        )
                            :
                            <div className="w-full">
                                <img
                                    src={
                                        company?.logoUrl
                                            ? `${MINIO_ENDPOINT}/datn/${company.logoUrl}`
                                            : '/default-logo.png'
                                    }
                                    alt="Company Logo"
                                    className="mx-auto mb-2 h-32 object-cover"
                                />

                                <div className="grid grid-cols-[1fr_2fr] gap-4 mb-2 text-left text-sm">
                                    <div className="font-medium text-gray-700">Tên công ty:</div>
                                    <div className="text-gray-900">{company?.companyName || 'Chưa cập nhật'}</div>

                                    <div className="font-medium text-gray-700">Ngành nghề:</div>
                                    <div className="text-gray-900">{company?.industry || 'Chưa cập nhật'}</div>

                                    <div className="font-medium text-gray-700">Quy mô:</div>
                                    <div className="text-gray-900">{company?.companySize ? `${company.companySize} nhân viên` : 'Chưa cập nhật'}</div>

                                    <div className="font-medium text-gray-700">Website:</div>
                                    <div className="text-gray-900">{company?.website || 'Chưa cập nhật'}</div>

                                    <div className="font-medium text-gray-700">Địa điểm:</div>
                                    <div className="text-gray-900">{company?.location || 'Chưa cập nhật'}</div>

                                    <div className="font-medium text-gray-700">Ngày tạo:</div>
                                    <div className="text-gray-900">
                                        {company?.createdAt
                                            ? new Date(company.createdAt).toLocaleDateString('vi-VN')
                                            : 'Chưa cập nhật'}
                                    </div>

                                    <div className="font-medium text-gray-700">Trạng thái:</div>
                                    <div className="text-gray-900">
                                        {company?.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                                    </div>
                                </div>

                            </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default EmployerProfile;