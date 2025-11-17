import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { addFavorite, filterJobsApi, getFavorites, removeFavorite } from "@/api/recruitApi";
import { getAllCompaniesApi } from "@/api/userApi";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";
import { selectIsAuthenticated } from "@/redux/authSlice";
import { useSelector } from "react-redux";

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
    experience: string;
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

interface Favorite {
    favoriteId: string;
    jobId: string;
    userId: string;
}

interface MergedJob extends Job {
    company?: Company;
    favorite?: Favorite;
}

interface JobsListProps {
    gridNumber?: number;
    filters?: Record<string, string | string[] | number | undefined>;
    onlyFavorites?: boolean;
}

const jobTypeMap: Record<string, string> = {
    full_time: 'Toàn thời gian',
    part_time: 'Bán thời gian',
    internship: 'Thực tập',
    freelance: 'Freelance',
};

const JobsList: React.FC<JobsListProps> = ({ gridNumber = 3, filters = {}, onlyFavorites = false }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<MergedJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const promises: Promise<any>[] = [
                    filterJobsApi(filters),
                    getAllCompaniesApi(),
                ];
                if (isAuthenticated) {
                    promises.push(getFavorites());
                } else {
                    promises.push(Promise.resolve({ data: [] }));
                }

                const [jobRes, companyRes, favoriteRes] = await Promise.all(promises);
                const jobList: Job[] = jobRes?.data || [];
                const companyList: Company[] = companyRes?.data || [];
                const favoriteList: Favorite[] = favoriteRes?.data || [];

                const merged = jobList.map((job) => ({
                    ...job,
                    company: companyList.find((c) => c.companyId === job.companyId),
                    favorite: favoriteList.find((f) => f.jobId === job.jobId),
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
    }, [filters, isAuthenticated]);

    const handleLoginRedirect = () => navigate('/login');
    const handleViewDetailJob = (jobId: string) => navigate(`/jobs/${jobId}`);

    const displayedJobs = onlyFavorites ? jobs.filter(job => job.favorite) : jobs;

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

    if (displayedJobs.length === 0) {
        return (
            <div className="w-full py-14 flex flex-col items-center px-[100px]">
                {
                    !onlyFavorites &&
                    <h2 className="text-3xl font-semibold mb-6 text-txt-red">
                        Việc làm có thể bạn quan tâm
                    </h2>
                }
                <div className="bg-white shadow-lg rounded-lg p-8 w-full text-center">
                    <span>{onlyFavorites ? "Bạn chưa lưu công việc nào." : "Không có công việc phù hợp với bộ lọc hiện tại."}</span>
                </div>
            </div>
        );
    }

    const toggleFavorite = async (jobId: string) => {
        if (!isAuthenticated) {
            handleLoginRedirect();
            return;
        }

        const job: MergedJob | undefined = jobs.find((j) => j.jobId === jobId);
        if (!job) return;

        try {
            if (job.favorite) {
                await removeFavorite(job.favorite.favoriteId);

                setJobs((prev) =>
                    prev.map((j) =>
                        j.jobId === jobId
                            ? { ...j, favorite: undefined }
                            : j
                    )
                );
            } else {
                const res = await addFavorite({ jobId });

                const newFavorite: Favorite = res.data;

                setJobs((prev) =>
                    prev.map((j) =>
                        j.jobId === jobId
                            ? { ...j, favorite: newFavorite }
                            : j
                    )
                );
            }
        } catch (err) {
            console.error("toggleFavorite error:", err);
        }
    };



    return (
        <div className={`w-full ${gridNumber === 3 ? "py-14 px-[100px]" : "py-0 px-[50px]"} flex flex-col items-center`}>
            <h2 className={`${gridNumber === 3 ? "block" : "hidden"} text-3xl font-semibold mb-10 text-txt-red`}>
                Việc làm có thể bạn quan tâm
            </h2>

            <div className={`grid grid-cols-${gridNumber} gap-8 w-full`}>
                {displayedJobs.map((job) => {
                    const company = job.company;
                    return (
                        <div
                            key={job.jobId}
                            className={`flex ${gridNumber === 3 ? "flex-col" : "flex-row"} bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:scale-105 transition-transform`}
                        >
                            <div className={`flex flex-col ${gridNumber === 3 ? "w-full" : "w-2/3"} pr-4`}>
                                <div className="flex items-center mb-4">
                                    <img
                                        src={
                                            company?.logoUrl
                                                ? `${MINIO_ENDPOINT}/datn/${company.logoUrl}`
                                                : "/company-default.svg"
                                        }
                                        alt="Logo công ty"
                                        className="w-20 h-20 rounded-md object-cover border"
                                        onError={(e) => (e.currentTarget.src = "/company-default.svg")}
                                    />

                                    <div className="flex flex-col ml-5 text-left">
                                        <p className="text-sm text-gray-500 mb-1 line-clamp-1">
                                            {company?.location || job.location}
                                        </p>
                                        <span className="font-semibold text-txt-red text-base line-clamp-1 block">
                                            {company?.companyName || "Công ty chưa xác định"}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="font-semibold text-lg line-clamp-2 text-left cursor-pointer" onClick={() => handleViewDetailJob(job.jobId)}>
                                        {job.title}
                                    </div>

                                    <div className="text-txt-red mt-2 mb-4 text-left">
                                        {job.minSalary && job.maxSalary
                                            ? `${Number(job.minSalary).toLocaleString("vi-VN")} - ${Number(job.maxSalary).toLocaleString("vi-VN")} VNĐ`
                                            : "Thoả thuận"}
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
                                            <i className="fa fa-user" /> {job.quantity} vị trí
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
                            </div>

                            <div className={`flex flex-col ${gridNumber === 3 ? "w-full" : "w-1/3"} pb-4 items-end justify-end gap-2`}>
                                <div className="flex flex-row gap-4 items-center">
                                    {isAuthenticated && (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(job.jobId);
                                            }}
                                            className={`
                                            flex items-center cursor-pointer gap-2 px-3 py-2 border-[1px] rounded-full transition-colors
                                            ${job.favorite
                                                    ? "bg-background-red text-white border-txt-red"
                                                    : "text-txt-red border-background-red hover:border-txt-red hover:text-white hover:bg-background-red"
                                                }
                                        `}
                                        >
                                            <i className={`fa-heart text-lg ${job.favorite ? "fa-solid" : "fa-regular"}`}></i>
                                        </div>
                                    )}
                                    <Button variant="seek" onClick={() => handleViewDetailJob(job.jobId)}>Ứng tuyển</Button>
                                </div>

                                <span className="text-sm text-gray-500 text-right">
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
                                                : `${formatted} (Hết hạn)`;
                                        })()}
                                    </span>
                                </span>

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default JobsList;
