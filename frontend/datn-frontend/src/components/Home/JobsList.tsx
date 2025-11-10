import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { filterJobsApi } from "@/api/recruitApi";
import { getAllCompaniesApi } from "@/api/userApi";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";

interface Job {
    jobId: string;
    companyId: string;
    title: string;
    description: string;
    minSalary: number;
    maxSalary: number;
    location: string;
    city: string;
    jobType: string;
    status: string;
    quantity: number;
    deadline: string;
    createdAt: string;
}

interface Company {
    companyId: string;
    companyName: string;
    logoUrl?: string;
    location?: string;
    website?: string;
}

interface MergedJob extends Job {
    company?: Company;
}

interface JobsListProps {
    gridNumber?: number;
    filters?: Record<string, string | string[] | number | undefined>;
}

const JobsList: React.FC<JobsListProps> = ({ gridNumber = 3, filters = {} }) => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<MergedJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [jobRes, companyRes] = await Promise.all([
                    filterJobsApi(filters),
                    getAllCompaniesApi(),
                ]);
                console.log("job", jobRes.data);
                const jobList: Job[] = jobRes.data || [];
                const companyList: Company[] = companyRes.data || [];
                const merged = jobList.map((job) => ({
                    ...job,
                    company: companyList.find((c) => c.companyId === job.companyId),
                }));

                setJobs(merged);
                setError(null);
            } catch (err) {
                console.error("Lỗi khi load việc làm:", err);
                setError("Không thể tải danh sách việc làm");
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filters]);

    const handleViewAll = () => navigate("/jobs");
    const handleViewDetailJob = (jobId: string) => navigate(`/jobs/${jobId}`);

    if (loading) {
        return (
            <div className="py-14 flex flex-col items-center">
                <h2 className="text-3xl font-semibold mb-6 text-txt-red">
                    Việc làm có thể bạn quan tâm
                </h2>
                <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl text-center">
                    <span>Đang tải danh sách việc làm...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-14 flex flex-col items-center">
                <h2 className="text-3xl font-semibold mb-6 text-txt-red">
                    Việc làm có thể bạn quan tâm
                </h2>
                <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl text-center text-red-500">
                    {error}
                </div>
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="py-14 flex flex-col items-center">
                <h2 className="text-3xl font-semibold mb-6 text-txt-red">
                    Việc làm có thể bạn quan tâm
                </h2>
                <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl text-center">
                    <span>Không có công việc phù hợp với bộ lọc hiện tại.</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full ${gridNumber === 3 ? "py-14" : "py-0"} flex flex-col items-center px-[100px]`}>
            <h2 className={`${gridNumber === 3 ? "block" : "hidden"} text-3xl font-semibold mb-10 text-txt-red`}>
                Việc làm có thể bạn quan tâm
            </h2>

            <div className={`grid grid-cols-${gridNumber} gap-8 w-full`}>
                {jobs.map((job) => {
                    const company = job.company;
                    return (
                        <div
                            key={job.jobId}
                            onClick={() => handleViewDetailJob(job.jobId)}
                            className="flex flex-col bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:scale-105 transition-transform cursor-pointer"
                        >
                            <div className="flex items-center mb-4">
                                <img
                                    src={
                                        company?.logoUrl
                                            ? `${MINIO_ENDPOINT}/datn/${company.logoUrl}`
                                            : "/company-default.svg"
                                    }
                                    alt="Logo công ty"
                                    className="w-24 h-24 rounded-md object-cover border"
                                    onError={(e) => (e.currentTarget.src = "/company-default.svg")}
                                />
                                <div className="flex flex-col ml-5 text-left">
                                    <p className="text-sm text-gray-500 mb-1 line-clamp-2">
                                        {company?.location || job.location}
                                    </p>
                                    <span className="font-semibold text-txt-red text-base line-clamp-2 block">
                                        {company?.companyName || "Công ty chưa xác định"}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="font-semibold text-lg line-clamp-2 text-left truncate">
                                    {job.title}
                                </div>
                                <div className="text-txt-red mt-2 mb-5 text-left">
                                    {job.minSalary && job.maxSalary
                                        ? `${Number(job.minSalary).toLocaleString("vi-VN")} VND - ${Number(job.maxSalary).toLocaleString("vi-VN")} VND`
                                        : "Thoả thuận"}
                                </div>
                                <div className="flex gap-2 text-sm text-gray-600 mt-3">
                                    <span className="flex items-center text-left gap-1">
                                        <i className="fa fa-list" />{" "}
                                        {job.jobType === "full_time"
                                            ? "Toàn thời gian"
                                            : job.jobType === "part_time"
                                                ? "Bán thời gian"
                                                : "Khác"}
                                    </span>
                                    <span className="flex items-center text-left gap-1">
                                        <i className="fa fa-location-dot" /> {job.city}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2 text-left line-clamp-2">
                                    {job.description || "Không có mô tả"}
                                </p>
                            </div>

                            <div className="mt-auto text-sm text-gray-400 flex items-center justify-between">
                                <span>
                                    <span className="text-gray-500">Ngày hết hạn: </span>
                                    <span className="text-black">
                                        {(() => {
                                            const date = new Date(job.deadline);
                                            const formatted = date.toLocaleDateString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            });
                                            const today = new Date();
                                            const diffDays = Math.ceil(
                                                (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                                            );
                                            return diffDays > 0
                                                ? `${formatted} (Còn ${diffDays} ngày)`
                                                : `${formatted} (Hết hạn tuyển dụng)`;
                                        })()}
                                    </span>
                                </span>

                                <div className="flex items-center cursor-pointer gap-2 px-3 py-2 border-[1px] text-txt-red border-background-red rounded-full hover:border-txt-red hover:text-white hover:bg-background-red transition-colors">
                                    <i className="fa-regular fa-heart text-lg"></i>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Button onClick={handleViewAll} variant="seek" size="lg" className="mt-10">
                Xem tất cả
            </Button>
        </div>
    );
};

export default JobsList;
