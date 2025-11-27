import React, { useEffect, useState } from "react";
import { getAllApplicationsForCandidate } from "@/api/recruitApi";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";
import { useNavigate } from "react-router-dom";

type CV = {
    cvId: string;
    title?: string;
    dataJson?: any;
    fileUrl?: string | null;
};

type Job = {
    jobId: string;
    companyName?: string;
    title?: string;
    minSalary?: number;
    maxSalary?: number;
    location?: string;
    city?: string;
    jobType?: string;
};

type Company = {
    companyId: string;
    companyName?: string;
    logoUrl?: string;
}

type Application = {
    applicationId: string;
    jobId: string;
    cvId: string;
    status: string;
    appliedAt: string;
    cv?: CV;
    job?: Job;
    company?: Company
};

const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Thỏa thuận";
    const nf = new Intl.NumberFormat("vi-VN");
    if (min && max) return `${nf.format(min)}đ - ${nf.format(max)}đ`;
    if (min) return `${nf.format(min)}đ`;
    return `${nf.format(max as number)}đ`;
};

const mapStatus = (status: string) => {
    switch (status) {
        case "pending":
            return { label: "Chờ duyệt", color: "bg-yellow-500" };
        case "approved":
        case "accepted":
            return { label: "Đã duyệt", color: "bg-green-500" };
        case "rejected":
        case "declined":
            return { label: "Đã từ chối", color: "bg-red-500" };
        default:
            return { label: status, color: "bg-gray-400" };
    }
};

const jobTypeMap: Record<string, string> = {
    full_time: 'Toàn thời gian',
    part_time: 'Bán thời gian',
    internship: 'Thực tập',
    freelance: 'Freelance',
};

const AppliedJobs: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getAllApplicationsForCandidate();
                // API returns array as body
                const data = res?.data ?? [];
                setApplications(data as Application[]);
            } catch (err: any) {
                setError(err?.response?.data?.message || err.message || "Lỗi khi lấy dữ liệu");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <div className="flex flex-col items-center">
            <div className='w-full flex justify-center flex-col py-14' style={{ background: 'linear-gradient(to bottom, #ff9fb0 0%, #fff 100%)' }}>
                <p className="text-2xl font-bold text-txt-red mb-2">Việc làm đã ứng tuyển</p>
            </div>

            <div className="w-full px-[100px] pb-10">
                {loading && <div className="py-8 text-center text-gray-500">Đang tải ứng tuyển...</div>}
                {error && <div className="py-8 text-center text-red-500">{error}</div>}

                {!loading && !error && applications.length === 0 && (
                    <div className="py-8 text-center text-gray-500">Bạn chưa ứng tuyển vào công việc nào.</div>
                )}

                <div className="grid grid-cols-1 gap-8">
                    {applications.map((app) => {
                        const job = app.job;
                        const cv = app.cv;
                        const company = app.company;
                        const status = mapStatus(app.status);
                        const appliedAt = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('vi-VN') : '';
                        const companyName = company?.companyName ?? '';
                        const companyLogo = company?.logoUrl ?? '';
                        const jobTitle = job?.title ?? '—';
                        const salary = formatSalary(job?.minSalary, job?.maxSalary);

                        return (
                            <div key={app.applicationId}
                                className="flex flex-col bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:scale-105 transition-transform">
                                <div className="flex items-center mb-2 justify-between">
                                    <div className="flex flex-row items-center cursor-pointer">
                                        <img src={`${MINIO_ENDPOINT}/datn/${companyLogo}`} alt="#" className="w-24 h-24 rounded-md object-cover" />
                                        <div className="flex flex-col ml-5 text-left" onClick={() => navigate(`/jobs/${job?.jobId}`)}>
                                            <div className="font-semibold text-txt-red text-base line-clamp-2 block">{companyName}</div>
                                            <div className="font-semibold text-lg line-clamp-2 text-left truncate ">{jobTitle}</div>
                                            <div className="text-txt-red text-left">{salary}</div>
                                        </div>
                                    </div>
                                    <span className="flex items-center text-left gap-1">
                                        <span className={`px-3 py-1 rounded-full text-white font-medium ml-2 ${status.color}`}>{status.label}</span>
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <div className="flex gap-2 text-sm text-gray-600 mt-3">
                                        <span className="flex items-center text-left gap-1"><i className="fa fa-list" />{jobTypeMap[job?.jobType ?? '']}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 text-left line-clamp-2">{job?.location ?? job?.city ?? ''}</p>
                                </div>

                                <div className="mt-auto text-sm text-gray-400 flex items-center justify-between">
                                    <span className="flex items-center text-left gap-1"><i className="fa fa-calendar-alt" />Ứng tuyển: {appliedAt}</span>
                                    {cv ? (
                                        <a href={cv.fileUrl ? `${MINIO_ENDPOINT}/datn/${cv.fileUrl}` : `/preview-cvs/${cv.cvId}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-txt-red text-white rounded hover:bg-red-700 transition-colors">Xem CV: {cv.title ?? (cv.dataJson?.name ?? 'CV')}</a>
                                    ) : (
                                        <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded">Không có CV</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AppliedJobs;
