import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { getJob } from '@/api/recruitApi';
import { getDetailCompanyApi } from '@/api/userApi';
import { MINIO_ENDPOINT } from '@/api/serviceConfig';
import { formatTime } from '@/lib/utils';

const jobTypeMap: Record<string, string> = {
    full_time: 'Toàn thời gian',
    part_time: 'Bán thời gian',
    internship: 'Thực tập',
    freelance: 'Freelance',
};

const JobDetail = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState<any | null>(null);

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
                                <span className="text-left font-semibold">{job.salaryRange} triệu VNĐ</span>
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
                                <span className="text-left font-semibold">{job.jobType ? (jobTypeMap[job.jobType] ?? job.jobType) : 'N/A'}</span>
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
            <Footer />
        </div>
    );
};

export default JobDetail;
