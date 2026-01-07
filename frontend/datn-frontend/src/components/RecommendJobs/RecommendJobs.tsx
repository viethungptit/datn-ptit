import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { getRecommendedJob } from "@/api/recommendApi";
import { getCVMe } from "@/api/recruitApi";
import { getJob } from "@/api/recruitApi";
import { getDetailCompanyApi } from "@/api/userApi";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";
import { selectIsAuthenticated } from "@/redux/authSlice";
import { useSelector } from "react-redux";

interface Job {
    jobId: string;
    companyId: string;
    title: string;
    description?: string;
    minSalary?: number;
    maxSalary?: number;
    location?: string;
    city?: string;
    jobType?: string;
    experience?: string;
    status?: string;
    quantity?: number;
    deadline?: string;
    createdAt?: string;
}

interface Company {
    companyId: string;
    companyName: string;
    logoUrl?: string;
    location?: string;
}

const jobTypeMap: Record<string, string> = {
    full_time: 'Toàn thời gian',
    part_time: 'Bán thời gian',
    internship: 'Thực tập',
    freelance: 'Freelance',
};

const RecommendJobs: React.FC<{ gridNumber?: number }> = ({ gridNumber }) => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [jobs, setJobs] = useState<Array<Job & { company?: Company; score?: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            setError(null);
            try {
                // Load uploaded CVs (user uploads)
                const uploadRes = await getCVMe('upload');
                const uploaded = uploadRes?.data || [];

                // Also fetch template/system CVs in case user has no uploads
                const templateRes = await getCVMe('system');
                const templates = templateRes?.data || [];

                // Extract cv ids (try common keys)
                const uploadedIds: string[] = uploaded
                    .map((c: any) => c.cvId ?? c.id ?? c._id)
                    .filter(Boolean);

                const templateIds: string[] = templates
                    .map((c: any) => c.cvId ?? c.id ?? c._id)
                    .filter(Boolean);

                const cvIds = uploadedIds.length > 0 ? uploadedIds : templateIds.slice(0, 2);
                if (!cvIds || cvIds.length === 0) {
                    setJobs([]);
                    setLoading(false);
                    return;
                }

                const recRes = await getRecommendedJob(cvIds);
                const recList: Array<{ job_id: string; score?: number }> = recRes?.data || [];

                // Take up to full distinct job ids
                const top = recList.map(r => ({ id: r.job_id, score: r.score }));
                const uniqueJobs: string[] = Array.from(new Set(top.map(t => t.id)))

                // Fetch job details + company for each
                const enriched: Array<Job & { company?: Company; score?: number }> = [];
                for (const id of uniqueJobs) {
                    try {
                        const jr = await getJob(id);
                        const jobData: Job = jr?.data?.data ?? jr?.data ?? null;
                        if (!jobData) continue;
                        let company: Company | undefined;
                        try {
                            const cr = await getDetailCompanyApi(jobData.companyId);
                            company = cr?.data?.data ?? cr?.data ?? undefined;
                        } catch (err) {
                            company = undefined;
                        }

                        const scoreObj = recList.find(r => r.job_id === id);

                        enriched.push({ ...(jobData as any), company, score: scoreObj?.score });
                    } catch (err) {
                        // skip this job on error
                        continue;
                    }
                }

                setJobs(enriched);
            } catch (err) {
                console.error('Failed to load recommended jobs', err);
                setError('Không thể tải đề xuất việc làm');
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };
        if (isAuthenticated) {
            fetchRecommendations();
        }
    }, []);

    const handleViewDetailJob = (jobId: string) => navigate(`/jobs/${jobId}`);
    if (isAuthenticated === false) {
        return null;
    }

    if (loading) {
        return (
            <div className="py-8 flex flex-col items-center">
                <h2 className="text-3xl font-semibold mb-10 text-txt-red">Công việc được AI đề xuất</h2>
                <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl text-center">Đang tải đề xuất...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-8 flex flex-col items-center">
                <h2 className="text-3xl font-semibold mb-10 text-txt-red">Công việc được AI đề xuất</h2>
                <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl text-center text-red-500">{error}</div>
            </div>
        );
    }

    if (!jobs || jobs.length === 0) {
        return (
            <div className="py-8 flex flex-col items-center">
                <h2 className="text-3xl font-semibold mb-10 text-txt-red">Công việc được AI đề xuất</h2>
                <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl text-center">Không có đề xuất phù hợp, vui lòng tạo CV trên hệ thống</div>
            </div>
        );
    }

    return (
        <div className={`w-full py-14 ${gridNumber === 2 ? "px-[100px]" : "px-[0px]"} flex flex-col items-center border-t`}>
            <h2 className={`${gridNumber === 2 ? "text-3xl" : "text-2xl"} font-semibold mb-10 text-txt-red`}>Công việc được AI đề xuất</h2>

            <div className={`grid grid-cols-${gridNumber} gap-6 w-full`}>
                {jobs.map((job) => (
                    <div key={job.jobId} className={`flex flex-col bg-white rounded-xl shadow-md shadow-background-red p-6 border border-gray-100 hover:scale-105 transition-transform`}>
                        <div className="flex items-center mb-4">
                            <img
                                src={job.company?.logoUrl ? `${MINIO_ENDPOINT}/datn/${job.company.logoUrl}` : "/company-default.svg"}
                                alt="Logo công ty"
                                className="w-20 h-20 rounded-md object-cover border"
                                onError={(e) => (e.currentTarget.src = "/company-default.svg")}
                            />

                            <div className="flex flex-col ml-5 text-left">
                                <p className="text-sm text-gray-500 mb-1 line-clamp-1">{job.company?.location || job.location}</p>
                                <span className="font-semibold text-txt-red text-base line-clamp-1 block">{job.company?.companyName || "Công ty chưa xác định"}</span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="font-semibold text-lg line-clamp-2 text-left cursor-pointer" onClick={() => handleViewDetailJob(job.jobId)}>
                                {job.title}
                            </div>

                            <div className="text-txt-red mt-2 mb-4 text-left">
                                {job.minSalary && job.maxSalary ? `${Number(job.minSalary).toLocaleString("vi-VN")} - ${Number(job.maxSalary).toLocaleString("vi-VN")} VNĐ` : "Thoả thuận"}
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                                <span className="flex items-center gap-1">
                                    <i className="fa fa-list" />
                                    {job.jobType ? (jobTypeMap[job.jobType] ?? job.jobType) : 'N/A'}
                                </span>

                                <span className="flex items-center gap-1">
                                    <i className="fa fa-location-dot" /> {job.city}
                                </span>

                                <span className="flex items-center gap-1">
                                    <i className="fa fa-user" /> {job.quantity ?? 1} vị trí
                                </span>

                                {job.experience && (
                                    <span className="flex items-center gap-1">
                                        <i className="fa fa-briefcase" />
                                        {(() => {
                                            const expMap: Record<string, string> = {
                                                intern: "Thực tập",
                                                fresher: "Fresher",
                                                "1-2": "1-2 năm",
                                                "2-3": "2-3 năm",
                                                "3-4": "3-4 năm",
                                                "4-5": "4-5 năm",
                                                "5+": "> 5 năm",
                                            };
                                            return expMap[job.experience] ?? job.experience;
                                        })()}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                            <div className="text-base text-txt-red font-semibold">{job.score ? `Độ tương thích: ${(job.score * 100).toFixed(0)}%` : null} <i className="fa-xl fa-solid fa-user-astronaut"></i></div>
                            <Button variant="seek" onClick={() => handleViewDetailJob(job.jobId)}>Ứng tuyển</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendJobs;
