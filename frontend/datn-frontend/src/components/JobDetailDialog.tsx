import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getJob } from '@/api/recruitApi';
import { getDetailCompanyApi } from '@/api/userApi';
import { MINIO_ENDPOINT } from '@/api/serviceConfig';
import { formatTime } from '@/lib/utils';
import EmployerAppliedCVsDialog from './Employer/EmployerAppliedCVsDialog';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jobId?: string | null;
}

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


const JobDetailDialog: React.FC<Props> = ({ open, onOpenChange, jobId }) => {
    const [job, setJob] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    useEffect(() => {
        if (!open || !jobId) return;
        let mounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const jobRes = await getJob(jobId);
                const jobData = jobRes.data;

                let companyData: any = {};
                if (jobData?.companyId) {
                    try {
                        const compRes = await getDetailCompanyApi(jobData.companyId);
                        companyData = compRes.data;
                    } catch (err) {
                        // ignore company fetch failure
                        console.error('Failed to fetch company detail', err);
                    }
                }

                const merged = {
                    ...jobData,
                    salaryRange: jobData.salaryRange ?? (jobData.minSalary || jobData.maxSalary ? `${jobData.minSalary ?? ''}${jobData.minSalary && jobData.maxSalary ? ' - ' : ''}${jobData.maxSalary ?? ''}` : ''),
                    tags: jobData.jobTagIds ?? [],
                    categories: jobData.groupTagIds ?? [],
                    companyLogo: companyData?.logoUrl ?? '',
                    companySize: companyData?.companySize ?? '',
                    companyName: companyData?.companyName ?? '',
                    companyLocation: companyData?.location ?? '',
                    companyWebsite: companyData?.website ?? '',
                    industry: companyData?.industry ?? '',
                };

                if (mounted) setJob(merged);
            } catch (err) {
                console.error(err);
                if (mounted) setJob(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchData();
        return () => { mounted = false; };
    }, [open, jobId]);
    const openViewCV = (job: any) => {
        setSelectedJob(job.jobId);
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90%] h-[97vh] overflow-y-auto">
                {loading ? (
                    <div className="p-10 text-center">Đang tải...</div>
                ) : !job ? (
                    <div className="p-10 text-center">Không tìm thấy công việc!</div>
                ) : (
                    <>
                        <div className='flex justify-center py-6'>
                            <h1 className="text-2xl md:text-3xl font-semibold text-txt-red">{job.title}</h1>
                        </div>
                        <div className="flex flex-col md:flex-row gap-8 px-[24px] py-6">
                            <div className="md:w-3/4 w-full bg-white rounded-xl shadow p-6 flex flex-col border gap-6">
                                <div className="flex flex-row justify-between gap-6">
                                    <div className="flex flex-row items-center gap-3 text-gray-700 w-1/3">
                                        <div className="flex items-center justify-center w-10 h-10 bg-[#ffe3ea] rounded-full border-2 border-[#d90429] mb-2">
                                            <i className="fa-solid fa-sack-dollar text-[#d90429]"></i>
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className="text-left text-sm">Mức lương</span>
                                            <span className="text-left font-semibold">{job.salaryRange ? `${job.salaryRange} VNĐ` : 'Thoả thuận'}</span>
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
                                <div className="flex justify-between items-center">
                                    <div className="text-gray-600">
                                        Hạn nộp hồ sơ: <span className="font-semibold">{formatTime(job.deadline)}</span>
                                    </div>
                                    <button
                                        onClick={() => openViewCV(job)}
                                        className="px-4 py-2 rounded-xl bg-[#d90429] text-white font-medium 
               hover:bg-[#b80322] transition mr-5 "
                                    >
                                        Xem danh sách CV đã ứng tuyển
                                    </button>
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
                                    <div className='text-center'>
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
                    </>
                )}

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Đóng</Button>
                    </DialogClose>
                </DialogFooter>
                {selectedJob && (
                    <EmployerAppliedCVsDialog
                        jobId={selectedJob}
                        open={!!selectedJob}
                        onClose={() => setSelectedJob(null)}
                        role='admin' />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default JobDetailDialog;
