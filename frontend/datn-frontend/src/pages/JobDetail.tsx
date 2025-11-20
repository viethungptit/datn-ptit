import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { getJob, addFavorite, getFavorites, removeFavorite } from '@/api/recruitApi';
import { getDetailCompanyApi } from '@/api/userApi';
import { MINIO_ENDPOINT } from '@/api/serviceConfig';
import { formatTime } from '@/lib/utils';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/authSlice';
import { getCurrentUserProfile } from '@/api/userApi';;
import ApplyJobDialog from '@/components/UploadCV/ApplyJobDialog';
import { toast } from 'react-toastify';
import AppliedCVsDialog from '@/components/UploadCV/AppliedCVDialog';

const JOB_TYPE_OPTIONS = [
    { value: 'full_time', label: 'Toàn thời gian' },
    { value: 'part_time', label: 'Bán thời gian' },
    { value: 'internship', label: 'Thực tập' },
    { value: 'freelance', label: 'Freelance' },
];

const EXPERIENCE_OPTIONS = [
    { value: "intern", label: "Thực tập" },
    { value: "fresher", label: "Fresher" },
    { value: "1-2", label: "1-2 năm" },
    { value: "2-3", label: "2-3 năm" },
    { value: "3-4", label: "3-4 năm" },
    { value: "4-5", label: "4-5 năm" },
    { value: "5+", label: "Trên 5 năm" },
];


const JOB_TYPE_MAP = Object.fromEntries(
    JOB_TYPE_OPTIONS.map(item => [item.value, item.label])
);

const EXPERIENCE_MAP = Object.fromEntries(
    EXPERIENCE_OPTIONS.map(item => [item.value, item.label])
);

const JobDetail = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [job, setJob] = useState<any | null>(null);
    const [favorite, setFavorite] = useState<any | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const openDialog = () => setIsDialogOpen(true);
    const closeDialog = () => setIsDialogOpen(false);
    const [isAppliedCVsDialogOpen, setIsAppliedCVsDialogOpen] = useState(false);
    const openAppliedCVsDialog = () => setIsAppliedCVsDialogOpen(true);
    const closeAppliedCVsDialog = () => setIsAppliedCVsDialogOpen(false);
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await getCurrentUserProfile();
                setProfile(res.data);
            } catch (err) {
                toast.error("Không thể tải hồ sơ người dùng");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (!jobId) return;

        const fetchData = async () => {
            try {
                // Get job detail
                const jobRes = await getJob(jobId);
                const jobData = jobRes.data;

                // Get company detail using companyId from job
                let companyData: any = {};
                if (jobData?.companyId) {
                    try {
                        const compRes = await getDetailCompanyApi(jobData.companyId);
                        companyData = compRes.data;
                    } catch (err) {
                        console.error('Failed to fetch company detail', err);
                    }
                }

                const merged = {
                    // job fields
                    ...jobData,
                    // fill or rename fields expected by the UI
                    salaryRange: jobData.salaryRange ?? (jobData.minSalary || jobData.maxSalary ? `${jobData.minSalary ?? ''}${jobData.minSalary && jobData.maxSalary ? ' - ' : ''}${jobData.maxSalary ?? ''}` : ''),
                    tags: jobData.jobTagIds ?? [],
                    categories: jobData.groupTagIds ?? [],
                    // company fields
                    companyLogo: companyData?.logoUrl ?? '',
                    companySize: companyData?.companySize ?? '',
                    companyName: companyData?.companyName ?? '',
                    companyLocation: companyData?.location ?? '',
                    companyWebsite: companyData?.website ?? '',
                    industry: companyData?.industry ?? '',
                };

                setJob(merged);
            } catch (err) {
                console.error(err);
                setJob(null);
            } finally {
            }
        };

        fetchData();
    }, [jobId]);

    useEffect(() => {
        if (!jobId || !isAuthenticated) return;
        (async () => {
            try {
                const res = await getFavorites();
                const favList = res?.data || [];
                const found = favList.find((f: any) => f.jobId === jobId);
                setFavorite(found || null);
            } catch (err) {
                console.error('Failed to fetch favorites', err);
            }
        })();
    }, [jobId, isAuthenticated]);

    const toggleFavorite = async () => {
        if (!jobId) return;
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            if (favorite) {
                await removeFavorite(favorite.favoriteId);
                setFavorite(null);
            } else {
                const res = await addFavorite({ jobId });
                setFavorite(res?.data || null);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Thao tác thất bại';
            toast.error(msg);
        }
    };

    if (loading) return <div className="text-center py-10">Đang tải...</div>;
    if (!job) return <div className="p-10 text-center text-xl">Không tìm thấy công việc!</div>;

    return (
        <div>
            <div className='flex justify-center px-[100px] py-14' style={{ background: 'linear-gradient(to bottom, #ff9fb0 0%, #fff 100%)' }}>
                <h1 className="text-3xl font-semibold text-txt-red">{job.title}</h1>
            </div>
            <div className="flex flex-col md:flex-row gap-8 px-[100px] py-10">
                <div className="md:w-3/4 w-full bg-white rounded-xl shadow p-8 flex flex-col border gap-6">
                    <div className="flex flex-row justify-between gap-6">
                        <div className="flex flex-row items-center gap-3 text-gray-700 w-1/3">
                            <div className="flex items-center justify-center w-10 h-10 bg-[#ffe3ea] rounded-full border-2 border-[#d90429] mb-2">
                                <i className="fa-solid fa-sack-dollar text-[#d90429]"></i>
                            </div>
                            <div className='flex flex-col'>
                                <span className="text-left text-sm">Mức lương</span>
                                <span className="text-left font-semibold">{job.salaryRange} VNĐ</span>
                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-3 text-gray-700 w-1/3">
                            <div className="flex items-center justify-center w-10 h-10 bg-[#ffe3ea] rounded-full border-2 border-[#d90429] mb-2">
                                <i className="fa-solid fa-hourglass-half text-[#d90429]"></i>
                            </div>
                            <div className='flex flex-col'>
                                <span className="text-left text-sm">Kinh nghiệm</span>
                                <span className="text-left font-semibold">{job.experience ? (EXPERIENCE_MAP[job.experience] ?? job.experience) : 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-3 text-gray-700 w-1/3">
                            <div className="flex items-center justify-center px-2 w-10 h-10 bg-[#ffe3ea] rounded-full border-2 border-[#d90429] mb-2">
                                <i className="fa-solid fa-location-dot text-[#d90429]"></i>
                            </div>
                            <div className='flex flex-col'>
                                <span className="text-left text-sm">Địa điểm</span>
                                <span className="text-left font-semibold line-clamp-1">{job.location}</span>
                            </div>
                        </div>
                    </div>
                    <span className="text-left text-gray-600">Hạn nộp hồ sơ: <span className="font-semibold">{formatTime(job.deadline)}</span></span>
                    <div className="flex items-center justify-between">
                        <Button variant="seek" className='w-1/3' onClick={openDialog}>Ứng tuyển ngay</Button>
                        {profile?.role === 'candidate' && (
                            <Button variant="outline" className="mt-4" onClick={openAppliedCVsDialog}>
                                Xem CV đã nộp
                            </Button>
                        )}
                        <div
                            onClick={() => toggleFavorite()}
                            className={`flex items-center cursor-pointer gap-2 px-3 py-2 border-[1px] rounded-full transition-colors ${favorite ? 'bg-background-red text-white border-txt-red' : 'text-txt-red border-background-red hover:border-txt-red hover:text-white hover:bg-background-red'}`}
                        >
                            <i className={`${favorite ? 'fa-solid' : 'fa-regular'} fa-heart text-lg`}></i>
                        </div>
                    </div>
                    <div className='text-left border-t-2 pt-5'>
                        <h2 className="text-lg font-semibold mb-2">Chi tiết công việc</h2><br />
                        <p className="text-gray-700 text-base whitespace-pre-line">{job.description}</p>
                    </div>
                </div>
                <div className="md:w-1/4 w-full bg-white rounded-xl shadow p-6 flex flex-col border gap-6">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <img
                            src={job.companyLogo ? `${MINIO_ENDPOINT}/datn/${job.companyLogo}` : '/default-logo.png'}
                            alt="logo" className="h-40 w-40 object-cover rounded-md border" />
                        <div>
                            <h2 className="text-lg font-semibold">{job.companyName}</h2>
                            <div className="text-base mb-1">{job.industry}</div>
                            <div className="text-base mb-1">Quy mô: {job.companySize}</div>
                            <div className="text-base mb-1">{job.companyLocation}</div>
                            <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-base">{job.companyWebsite}</a>
                        </div>
                    </div>
                    <div className="mb-4 flex flex-col gap-3">
                        <div className="flex flex-row items-center gap-3 text-gray-700">
                            <div className="flex items-center justify-center w-9 h-9 bg-[#ffe3ea] rounded-full border-2 border-[#d90429]">
                                <i className="fa-solid fa-users text-[#d90429]"></i>
                            </div>
                            <div className='flex flex-col'>
                                <span className="text-left text-sm">Số lượng</span>
                                <span className="text-left font-semibold">{job.quantity}</span>
                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-3 text-gray-700">
                            <div className="flex items-center justify-center w-9 h-9 bg-[#ffe3ea] rounded-full border-2 border-[#d90429]">
                                <i className="fa-solid fa-briefcase text-[#d90429]"></i>
                            </div>
                            <div className='flex flex-col'>
                                <span className="text-left text-sm">Hình thức</span>
                                <span className="text-left font-semibold">{job.jobType ? (JOB_TYPE_MAP[job.jobType] ?? job.jobType) : 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-3 text-gray-700">
                            <div className="flex items-center justify-center w-9 h-9 bg-[#ffe3ea] rounded-full border-2 border-[#d90429]">
                                <i className="fa-solid fa-calendar-day text-[#d90429]"></i>
                            </div>
                            <div className='flex flex-col'>
                                <span className="text-left text-sm">Hạn nộp</span>
                                <span className="text-left font-semibold">{formatTime(job.deadline)}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-base text-left font-semibold mb-2">Kĩ năng cần có</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.jobTags?.map((tag: any) => (
                                <span key={tag.jobTagId} className="bg-[#d90429] text-white px-3 py-1 rounded-full text-xs font-medium">
                                    {tag.jobName}
                                </span>
                            ))}
                        </div>

                        <h2 className="text-base text-left font-semibold mb-2 mt-5">Ngành nghề</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.groupJobTags?.map((category: any) => (
                                <span key={category.groupTagId} className="bg-[#d90429] text-white px-3 py-1 rounded-full text-xs font-medium">
                                    {category.groupJobName}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <ApplyJobDialog open={isDialogOpen} onClose={closeDialog} jobId={jobId as string} />
            <AppliedCVsDialog
                jobId={jobId as string}
                open={isAppliedCVsDialogOpen}
                onClose={closeAppliedCVsDialog}
            />
            <Footer />
        </div>
    );
};

export default JobDetail;
