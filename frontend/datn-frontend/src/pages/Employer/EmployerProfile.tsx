
import { useEffect, useState } from 'react';
import { getCurrentUserProfile, getAllCompaniesApi, upsertEmployerApi, leaveCompanyApi } from '../../api/userApi';
import { MINIO_ENDPOINT } from '@/api/serviceConfig';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import CompanyDialog from '@/components/Company/CompanyDialog';
import { toast } from 'react-toastify';

const EmployerProfile: React.FC = () => {
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [joinOpen, setJoinOpen] = useState(false);
    const [companies, setCompanies] = useState<any[]>([]);
    const [companiesLoading, setCompaniesLoading] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [positionInput, setPositionInput] = useState<string>('');
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);
    const [isHrAdmin, setIsHrAdmin] = useState<boolean>(false);
    const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
    const [leavingCompany, setLeavingCompany] = useState(false);
    const getValue = (val: any) => (val ? val : 'Chưa cập nhật');
    const employer = profile?.employer || null;
    const company = profile?.company || null;

    useEffect(() => {
        if (!joinOpen) return;
        (async () => {
            setCompaniesLoading(true);
            try {
                const res = await getAllCompaniesApi();
                if (res && res.data) setCompanies(res.data);
            } catch (err: any) {
                const msg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách công ty';
                toast.error(msg);
            } finally {
                setCompaniesLoading(false);
            }
        })();
    }, [joinOpen]);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await getCurrentUserProfile();
                setProfile(res.data);
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


    return (
        <div className="w-full py-2 px-4 flex flex-col">
            <h1 className="text-left font-semibold mb-6">Hồ sơ của tôi</h1>
            <div className='flex flex-row items-start justify-between w-full'>
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
                            <div className="font-medium text-gray-700">Quyền hạn:</div>
                            <div className="text-gray-900">{employer?.admin === true ? 'Quản trị nhân sự' : employer?.admin === false ? 'Nhân viên' : 'Chưa cập nhật'}
                            </div>
                            <div className="font-medium text-gray-700">Trạng thái việc làm:</div>
                            <div className="text-gray-900">
                                {employer?.status == null
                                    ? 'Chưa cập nhật'
                                    : employer.status === 'VERIFIED'
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
                                <Dialog open={joinOpen} onOpenChange={(v) => setJoinOpen(v)}>
                                    <DialogTrigger asChild>
                                        <Button variant="seek">Thêm thông tin công ty</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-xl">
                                        <DialogHeader>
                                            <DialogTitle>Thêm thông tin công ty</DialogTitle>
                                            <DialogDescription>
                                                Chọn công ty bạn muốn tham gia và điền vị trí hiện tại (tuỳ chọn).
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="mt-4">
                                            {companiesLoading ? (
                                                <div>Đang tải danh sách công ty...</div>
                                            ) : (
                                                <div className="flex flex-col gap-3 text-sm">
                                                    <label className="text-sm font-medium">Công ty</label>
                                                    <select
                                                        className="border rounded px-3 py-2"
                                                        value={selectedCompanyId ?? ''}
                                                        onChange={(e) => setSelectedCompanyId(e.target.value || null)}
                                                    >
                                                        <option value="">-- Chọn công ty --</option>
                                                        {companies.map((c: any) => (
                                                            <option key={c.companyId ?? c.id ?? c._id} value={c.companyId ?? c.id ?? c._id}>
                                                                {c.companyName}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <label className="text-sm font-medium">Vị trí</label>
                                                    <input
                                                        className="border rounded px-3 py-2"
                                                        placeholder="Vị trí (ví dụ: Nhân viên tuyển dụng)"
                                                        value={positionInput}
                                                        onChange={(e) => setPositionInput(e.target.value)}
                                                    />

                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={isHrAdmin || false}
                                                            onChange={(e) => setIsHrAdmin(e.target.checked)}
                                                        />
                                                        Tôi là HR Admin (có quyền quản lý hồ sơ nhân sự, duyệt đăng tuyển)
                                                    </label>

                                                    {joinError && <div className="text-red-500 text-sm">{joinError}</div>}
                                                </div>
                                            )}
                                        </div>

                                        <DialogFooter>
                                            <div className="flex gap-2 w-full justify-end">
                                                <Button variant="outline" onClick={() => setJoinOpen(false)}>Hủy</Button>
                                                <Button
                                                    onClick={async () => {
                                                        // validate
                                                        if (!selectedCompanyId) {
                                                            setJoinError('Vui lòng chọn công ty');
                                                            return;
                                                        }
                                                        setJoining(true);
                                                        setJoinError(null);
                                                        try {
                                                            await upsertEmployerApi({
                                                                companyId: selectedCompanyId,
                                                                position: positionInput || undefined,
                                                                status: 'PENDING',
                                                                isAdmin: isHrAdmin ?? false
                                                            });

                                                            // refresh profile
                                                            const res = await getCurrentUserProfile();
                                                            setProfile(res.data);
                                                            setJoinOpen(false);
                                                            toast.success('Đã gửi yêu cầu gia nhập / cập nhật hồ sơ thành công');
                                                        } catch (err: any) {
                                                            const msg = err?.response?.data?.message || err?.message || 'Không thể gia nhập công ty';
                                                            setJoinError(msg);
                                                        } finally {
                                                            setJoining(false);
                                                        }
                                                    }}
                                                    disabled={joining}
                                                >
                                                    {joining ? 'Đang xử lý...' : 'Thêm công ty'}
                                                </Button>
                                            </div>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <div className="mt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setJoinOpen(false);
                                            setTimeout(() => setCompanyDialogOpen(true), 180);
                                        }}
                                    >
                                        Tạo công ty mới
                                    </Button>
                                </div>
                            </div>
                        )
                            :
                            (
                                <>
                                    {profile.employer?.status === 'VERIFIED' ? (
                                        <div className="w-full">
                                            {/* Logo công ty */}
                                            <img
                                                src={
                                                    profile.company?.logoUrl
                                                        ? `${MINIO_ENDPOINT}/datn/${profile.company.logoUrl}`
                                                        : '/default-logo.png'
                                                }
                                                alt="Company Logo"
                                                className="mx-auto mb-2 h-32 object-cover"
                                            />

                                            {/* Thông tin công ty */}
                                            <div className="grid grid-cols-[1fr_2fr] gap-4 mb-2 text-left text-sm">
                                                <div className="font-medium text-gray-700">Tên công ty:</div>
                                                <div className="text-gray-900">{profile.company?.companyName || 'Chưa cập nhật'}</div>

                                                <div className="font-medium text-gray-700">Ngành nghề:</div>
                                                <div className="text-gray-900">{profile.company?.industry || 'Chưa cập nhật'}</div>

                                                <div className="font-medium text-gray-700">Quy mô:</div>
                                                <div className="text-gray-900">
                                                    {profile.company?.companySize
                                                        ? `${profile.company.companySize} nhân viên`
                                                        : 'Chưa cập nhật'}
                                                </div>

                                                <div className="font-medium text-gray-700">Website:</div>
                                                <div className="text-gray-900">{profile.company?.website || 'Chưa cập nhật'}</div>

                                                <div className="font-medium text-gray-700">Địa điểm:</div>
                                                <div className="text-gray-900">{profile.company?.location || 'Chưa cập nhật'}</div>

                                                <div className="font-medium text-gray-700">Ngày tạo:</div>
                                                <div className="text-gray-900">
                                                    {profile.company?.createdAt
                                                        ? new Date(profile.company.createdAt).toLocaleDateString('vi-VN')
                                                        : 'Chưa cập nhật'}
                                                </div>

                                                <div className="font-medium text-gray-700">Trạng thái:</div>
                                                <div className="text-gray-900">
                                                    {profile.company?.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                                                </div>
                                            </div>

                                            {/* Nút sửa và rời công ty */}
                                            <div className="mt-4 flex justify-between w-full">
                                                <Button
                                                    variant="login"
                                                    onClick={async () => {
                                                        if (!window.confirm('Bạn có chắc muốn rời công ty này?')) return;
                                                        setLeavingCompany(true);
                                                        try {
                                                            await leaveCompanyApi();
                                                            const res = await getCurrentUserProfile();
                                                            setProfile(res.data);
                                                            toast.success('Bạn đã rời công ty');
                                                        } catch (err: any) {
                                                            const msg = err?.response?.data?.message || err?.message || 'Rời công ty thất bại';
                                                            toast.error(msg);
                                                        } finally {
                                                            setLeavingCompany(false);
                                                        }
                                                    }}
                                                    disabled={leavingCompany}
                                                >
                                                    {leavingCompany ? 'Đang xử lý...' : 'Rời công ty'}
                                                </Button>
                                                {
                                                    profile.employer.admin && (
                                                        <Button variant="outline" onClick={() => setCompanyDialogOpen(true)}>
                                                            Sửa thông tin công ty
                                                        </Button>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    ) : profile.employer.status === 'PENDING' ? (
                                        <div className="mt-20 flex flex-col items-center gap-3">
                                            <span className="font-semibold text-yellow-600">
                                                Yêu cầu gia nhập {profile.company.companyName} đang được xét duyệt
                                            </span>
                                            <Button
                                                variant="login"
                                                onClick={async () => {
                                                    if (!window.confirm('Bạn có chắc muốn huỷ yêu cầu và rời công ty này?')) return;
                                                    setLeavingCompany(true);
                                                    try {
                                                        await leaveCompanyApi();
                                                        const res = await getCurrentUserProfile();
                                                        setProfile(res.data);
                                                        toast.success('Bạn đã huỷ yêu cầu và rời công ty');
                                                    } catch (err: any) {
                                                        const msg = err?.response?.data?.message || err?.message || 'Huỷ yêu cầu và rời công ty thất bại';
                                                        toast.error(msg);
                                                    } finally {
                                                        setLeavingCompany(false);
                                                    }
                                                }}
                                                disabled={leavingCompany}
                                            >
                                                {leavingCompany ? 'Đang xử lý...' : 'Huỷ yêu cầu và rời công ty'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="mt-20 flex flex-col items-center gap-3">
                                            <span className="font-semibold text-red-600">
                                                Yêu cầu gia nhập công ty {profile.company.companyName} bị từ chối
                                            </span>
                                            <Button
                                                variant="login"
                                                onClick={async () => {
                                                    if (!window.confirm('Bạn có chắc muốn huỷ yêu cầu và rời công ty này?')) return;
                                                    setLeavingCompany(true);
                                                    try {
                                                        await leaveCompanyApi();
                                                        const res = await getCurrentUserProfile();
                                                        setProfile(res.data);
                                                        toast.success('Bạn đã huỷ yêu cầu và rời công ty');
                                                    } catch (err: any) {
                                                        const msg = err?.response?.data?.message || err?.message || 'Huỷ yêu cầu và rời công ty thất bại';
                                                        toast.error(msg);
                                                    } finally {
                                                        setLeavingCompany(false);
                                                    }
                                                }}
                                                disabled={leavingCompany}
                                            >
                                                {leavingCompany ? 'Đang xử lý...' : 'Huỷ yêu cầu và rời công ty'}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )
                    }
                </div>

                <CompanyDialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen} company={company ?? undefined} onSaved={async (saved) => {
                    if (saved) {
                        try {
                            const res = await getCurrentUserProfile();
                            setProfile(res.data);
                        } catch (e) {
                            console.log('Error refreshing profile after company save', e);
                        }
                    }
                }} />
            </div>
        </div>
    );
};

export default EmployerProfile;
