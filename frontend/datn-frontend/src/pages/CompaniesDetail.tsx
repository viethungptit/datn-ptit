import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { getAllJobsByCompany, addFavorite, getFavorites, removeFavorite } from '@/api/recruitApi';
import { getDetailCompanyApi } from '@/api/userApi';
import type { Job } from './Admin/JobManagement';
import { MINIO_ENDPOINT } from '@/api/serviceConfig';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/authSlice';
import { toast } from 'react-toastify';

const JOB_TYPE_OPTIONS = [
    { value: 'full_time', label: 'Toàn thời gian' },
    { value: 'part_time', label: 'Bán thời gian' },
    { value: 'internship', label: 'Thực tập' },
    { value: 'freelance', label: 'Freelance' },
];

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'open', label: 'Đang mở' },
    { value: 'closed', label: 'Đã đóng' },
    { value: 'rejected', label: 'Đã từ chối' },
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

const STATUS_MAP = Object.fromEntries(
    STATUS_OPTIONS.map(item => [item.value, item.label])
);

const CompaniesDetail = () => {
    const { companyId } = useParams();
    const [company, setCompany] = useState<any | null>(null);
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [favoritesMap, setFavoritesMap] = useState<Record<string, any>>({});

    useEffect(() => {
        if (!companyId) return;

        const fetchData = async () => {
            try {
                // get company detail
                const compRes = await getDetailCompanyApi(companyId as string);
                const companyData = compRes.data;

                // get jobs for this company
                const jobsRes = await getAllJobsByCompany(companyId as string);
                const jobList = jobsRes.data || [];

                setCompany({ ...companyData, jobs: jobList });
            } catch (err) {
                console.error(err);
                setCompany(null);
            }
        };

        fetchData();
    }, [companyId]);

    useEffect(() => {
        if (!companyId || !isAuthenticated) return;
        (async () => {
            try {
                const res = await getFavorites();
                const favList = res?.data || [];
                const map: Record<string, any> = {};
                favList.forEach((f: any) => { map[f.jobId] = f; });
                setFavoritesMap(map);
            } catch (err) {
                console.error('Failed to load favorites', err);
            }
        })();
    }, [companyId, isAuthenticated]);

    const toggleFavorite = async (jobId: string) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fav = favoritesMap[jobId];
        try {
            if (fav) {
                await removeFavorite(fav.favoriteId);
                setFavoritesMap(prev => {
                    const copy = { ...prev };
                    delete copy[jobId];
                    return copy;
                });
            } else {
                const res = await addFavorite({ jobId });
                const newFav = res?.data;
                setFavoritesMap(prev => ({ ...prev, [jobId]: newFav }));
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Thao tác thất bại';
            toast.error(msg);
        }
    };

    const navigateDetailJob = (jobId: string) => {
        navigate(`/jobs/${jobId}`);
    }

    if (!company) return <div className="p-10 text-center text-xl">Không tìm thấy công ty!</div>;

    return (
        <div>
            <div className="px-[100px] py-10">
                <div className="relative rounded-xl overflow-hidden mb-8">
                    <img
                        src={company.coverImgUrl ? `${MINIO_ENDPOINT}/datn/${company.coverImgUrl}` : '/default-logo.png'}
                        alt="cover" className="w-full h-[400px] object-cover" />
                    <div className="absolute left-[20px] bottom-[20px] w-3/4 flex items-center bg-white rounded-xl shadow-lg p-4">
                        <img src={company.logoUrl ? `${MINIO_ENDPOINT}/datn/${company.logoUrl}` : '/default-logo.png'} alt="logo" className="h-36 w-36 object-cover rounded-lg border-2 mr-6" />
                        <div className='w-full'>
                            <h1 className="text-2xl text-left font-semibold mb-2 line-clamp-2">{company.companyName}</h1>
                            <div className="flex flex-row justify-between text-gray-600">
                                <span className='w-1/3 text-left truncate'><i className="fa-solid fa-industry"></i> {company.industry}</span>
                                <span className='w-1/3 text-left truncate'><i className="fa-solid fa-building"></i> {company.companySize} nhân viên</span>
                                <span className='w-1/3 text-left truncate'><i className="fa-solid fa-link"></i> {company.website}</span>
                            </div>
                            <span className="text-left mt-2 block">{company.location}</span>
                        </div>
                    </div>
                </div>
                <div className="my-10 shadow-lg p-6 rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-3">Giới thiệu công ty</h2>
                    <p className="text-gray-700 text-left">{company.description}</p>
                </div>
                <div className='my-10 shadow-lg p-6 rounded-lg border'>
                    <h2 className="text-xl font-semibold mb-4 border-b pb-3">Danh sách công việc</h2>
                    <div>
                        {
                            company.jobs.filter((job: Job) => job.status === "open").length !== 0
                                ?
                                company.jobs
                                    .filter((job: Job) => job.status === "open")
                                    .map((job: Job, index: number) => (
                                        <div className='flex flex-row px-5 py-10 border-b-2' key={index + job.jobId + job.title + job.companyId}>
                                            <div className="grid grid-cols-2 w-5/6 gap-y-2 text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Vị trí:</span>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {job.title}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <i className="fa-solid fa-layer-group text-gray-500"></i>
                                                    <span className="font-medium">Loại hình:</span> {JOB_TYPE_MAP[job.jobType ?? ""] || "--"}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium"><i className="fa-solid fa-sack-dollar text-gray-500"></i> Mức lương:</span>
                                                    <p className="text-background-red font-semibold text-lg">
                                                        {job.minSalary && job.maxSalary
                                                            ? `${job.minSalary.toLocaleString("vi-VN")} - ${job.maxSalary.toLocaleString("vi-VN")} VNĐ`
                                                            : "Thoả thuận"}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <i className="fa-solid fa-clock text-gray-500"></i>
                                                    <span className="font-medium">Trạng thái:</span> {STATUS_MAP[job.status ?? ""] || "--"}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <i className="fa-solid fa-briefcase-medical text-gray-500"></i>
                                                    <span className="font-medium">Kinh nghiệm:</span> {EXPERIENCE_MAP[job.experience ?? ""] || "--"}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <i className="fa-solid fa-users text-gray-500"></i>
                                                    <span className="font-medium">Số lượng:</span> {job.quantity} người
                                                </div>
                                            </div>

                                            <div className='w-1/6 flex flex-col gap-3 justify-center items-center'>
                                                <div className="flex flex-row items-center gap-2">
                                                    <div
                                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(job.jobId); }}
                                                        className={`flex items-center cursor-pointer gap-2 px-3 py-2 border-[1px] rounded-full transition-colors ${favoritesMap[job.jobId]
                                                            ? 'bg-background-red text-white border-txt-red'
                                                            : 'text-txt-red border-background-red hover:border-txt-red hover:text-white hover:bg-background-red'
                                                            }`}
                                                    >
                                                        <i className={`${favoritesMap[job.jobId] ? 'fa-solid' : 'fa-regular'} fa-heart text-lg`}></i>
                                                    </div>
                                                    <Button variant="seek" onClick={() => navigateDetailJob(job.jobId)}>Ứng tuyển</Button>
                                                </div>

                                                <div className="flex text-sm items-center gap-2 text-gray-500">
                                                    <i className="fa-solid fa-calendar-days text-gray-500"></i>
                                                    <span className="font-medium">Hạn:</span>
                                                    {job.deadline
                                                        ? new Date(job.deadline).toLocaleDateString("vi-VN")
                                                        : "--"}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                :
                                <div>Không có công việc nào</div>
                        }
                    </div>

                </div>
            </div>
            <Footer />
        </div >
    );
};

export default CompaniesDetail;
