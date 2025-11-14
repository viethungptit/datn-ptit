import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { getAllJobs } from '@/api/recruitApi';
import { getAllCompaniesApi } from '@/api/userApi';
import type { Job } from './Admin/JobManagement';
import type { Company } from './Admin/CompanyManagement';
import { MINIO_ENDPOINT } from '@/api/serviceConfig';
import { formatTime } from '@/lib/utils';


const JobDetail = () => {
    const [jobs, setJobs] = useState<any[]>([]);
    
    useEffect(() => {
        Promise.all([getAllJobs(), getAllCompaniesApi()])
            .then(([jobsRes, compRes]) => {
                const jobList = jobsRes.data;
                const companyList = compRes.data;

                const merged = jobList.map((job: Job) => {
                    const company = companyList.find((c: Company) => c.companyId === job.companyId);

                    return {
                        ...job,
                        companyLogo: company?.logoUrl ?? "",
                        companySize: company?.companySize ?? "",
                        companyName: company?.companyName ?? "",
                        companyLocation: company?.companyLocation ?? "",
                        companyWebsite: company?.website ?? "",
                        industry: 'Technology',
                        tags: ['React', 'JavaScript', 'CSS', 'UI/UX'],
                        categories: ['IT', 'Developer', 'Ngôn ngữ', 'Kế toán'],
                    };
                });

                setJobs(merged);
            })
            .catch(console.error);
    }, []);

    const { jobId } = useParams();
    const job = jobs.find((j: Job, index: number) => index === Number(jobId));

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
                                <span className="text-left font-semibold">{job.salaryRange}</span>
                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-3 text-gray-700 w-1/3">
                            <div className="flex items-center justify-center w-10 h-10 bg-[#ffe3ea] rounded-full border-2 border-[#d90429] mb-2">
                                <i className="fa-solid fa-hourglass-half text-[#d90429]"></i>
                            </div>
                            <div className='flex flex-col'>
                                <span className="text-left text-sm">Kinh nghiệm</span>
                                <span className="text-left font-semibold">1 - 2 năm</span>
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
                        <Button variant="seek" className='w-1/3'>Ứng tuyển ngay</Button>
                        <div
                            className="flex items-center cursor-pointer gap-2 px-3 py-2 border-[1px] text-txt-red border-background-red rounded-full hover:border-txt-red hover:text-white hover:bg-background-red transition-colors"
                        >
                            <i className="fa-regular fa-heart text-lg"></i>
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
                                <span className="text-left font-semibold">{job.jobType}</span>
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
                            {job.tags.map((tag: string) => (
                                <span key={tag} className="bg-[#d90429] text-white px-3 py-1 rounded-full text-xs font-medium">{tag}</span>
                            ))}
                        </div>
                        <h2 className="text-base text-left font-semibold mb-2 mt-5">Doanh mục nghề</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.categories.map((category: string) => (
                                <span key={category} className="bg-[#d90429] text-white px-3 py-1 rounded-full text-xs font-medium">{category}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default JobDetail;
