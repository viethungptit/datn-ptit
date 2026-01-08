import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import {
    addFavorite,
    filterJobsApiWithPagination,
    getFavorites,
    removeFavorite,
    getCVMe,
} from "@/api/recruitApi";
import { getAllCompaniesApi } from "@/api/userApi";
import { getRecommendedJob } from "@/api/recommendApi";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";
import { selectIsAuthenticated } from "@/redux/authSlice";
import { useSelector } from "react-redux";
import Pagination from "../Pagination/Pagination";

/* ================== TYPES ================== */

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
}

interface Favorite {
    favoriteId: string;
    jobId: string;
    userId: string;
}

interface MergedJob extends Job {
    company?: Company;
    favorite?: Favorite;
    aiScore?: number;
}

interface JobsListProps {
    gridNumber?: number;
    filters?: Record<string, string | string[] | number | undefined>;
    onlyFavorites?: boolean;
}

/* ================== MAP ================== */

const jobTypeMap: Record<string, string> = {
    full_time: "Toàn thời gian",
    part_time: "Bán thời gian",
    internship: "Thực tập",
    freelance: "Freelance",
};

/* ================== COMPONENT ================== */

const JobsList: React.FC<JobsListProps> = ({
    gridNumber = 3,
    filters = {},
    onlyFavorites = false,
}) => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const [jobs, setJobs] = useState<MergedJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [pageSize] = useState(gridNumber === 3 ? 6 : 10);
    const [totalPages, setTotalPages] = useState(1);

    /* ================== RESET PAGE WHEN FILTER CHANGE ================== */
    useEffect(() => {
        setPage(0);
    }, [filters]);

    /* ================== MAIN EFFECT ================== */
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                /* ---------- 1. LOAD JOB + COMPANY + FAVORITE ---------- */
                const promises: Promise<any>[] = [
                    filterJobsApiWithPagination(filters, page, pageSize),
                    getAllCompaniesApi(),
                ];

                if (isAuthenticated) {
                    promises.push(getFavorites());
                } else {
                    promises.push(Promise.resolve({ data: [] }));
                }

                const [jobRes, companyRes, favoriteRes] = await Promise.all(promises);

                const jobList: Job[] = jobRes?.data?.data || [];
                const companyList: Company[] = companyRes?.data || [];
                const favoriteList: Favorite[] = favoriteRes?.data || [];

                setTotalPages(jobRes?.data?.totalPages ?? 1);

                /* ---------- 2. LOAD CV IDS FOR AI ---------- */
                let aiScoreMap = new Map<string, number>();

                if (isAuthenticated) {
                    const uploadRes = await getCVMe("upload");
                    const uploaded = uploadRes?.data || [];

                    let cvIds = uploaded.map((c: any) => c.cvId).filter(Boolean);

                    if (cvIds.length === 0) {
                        const systemRes = await getCVMe("system");
                        cvIds = (systemRes?.data || [])
                            .slice(0, 2)
                            .map((c: any) => c.cvId)
                            .filter(Boolean);
                    }

                    if (cvIds.length > 0) {
                        const recRes = await getRecommendedJob(cvIds);
                        (recRes?.data || []).forEach(
                            (r: { job_id: string; score: number }) => {
                                aiScoreMap.set(r.job_id, r.score);
                            }
                        );
                    }
                }

                /* ---------- 3. MERGE DATA ---------- */
                let merged: MergedJob[] = jobList.map((job) => ({
                    ...job,
                    company: companyList.find(
                        (c) => c.companyId === job.companyId
                    ),
                    favorite: favoriteList.find(
                        (f) => f.jobId === job.jobId
                    ),
                    aiScore: aiScoreMap.get(job.jobId),
                }));

                /* ---------- 4. SORT BY AI SCORE ---------- */
                merged.sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));

                setJobs(merged);
            } catch (err) {
                console.error("JobsList error:", err);
                setError("Không thể tải danh sách việc làm");
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filters, page, isAuthenticated]);

    /* ================== FAVORITE ================== */
    const toggleFavorite = async (jobId: string) => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const job = jobs.find((j) => j.jobId === jobId);
        if (!job) return;

        try {
            if (job.favorite) {
                await removeFavorite(job.favorite.favoriteId);
                setJobs((prev) =>
                    prev.map((j) =>
                        j.jobId === jobId ? { ...j, favorite: undefined } : j
                    )
                );
            } else {
                const res = await addFavorite({ jobId });
                setJobs((prev) =>
                    prev.map((j) =>
                        j.jobId === jobId ? { ...j, favorite: res.data } : j
                    )
                );
            }
        } catch (err) {
            console.error("toggleFavorite error:", err);
        }
    };

    /* ================== FILTER FAVORITES ================== */
    const displayedJobs = onlyFavorites
        ? jobs.filter((j) => j.favorite)
        : jobs;

    /* ================== UI STATES ================== */
    if (loading) {
        return <div className="py-14 text-center">Đang tải danh sách việc làm...</div>;
    }

    if (error) {
        return <div className="py-14 text-center text-red-500">{error}</div>;
    }

    if (displayedJobs.length === 0) {
        return (
            <div className="py-14 text-center">
                {onlyFavorites
                    ? "Bạn chưa lưu công việc nào."
                    : "Không có công việc phù hợp."}
            </div>
        );
    }

    /* ================== RENDER ================== */
    return (
        <div className="w-full py-14 px-[100px]">
            <div className={`grid grid-cols-${gridNumber} gap-8`}>
                {displayedJobs.map((job) => {
                    const company = job.company;

                    return (
                        <div
                            key={job.jobId}
                            className={`flex ${gridNumber === 3 ? "flex-col" : "flex-row"} 
            bg-white rounded-xl shadow-lg p-6 border border-gray-100 
            hover:scale-105 transition-transform`}
                        >
                            {/* ===== LEFT CONTENT ===== */}
                            <div className={`flex flex-col ${gridNumber === 3 ? "w-full" : "w-2/3"} pr-4`}>
                                {/* COMPANY */}
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

                                {/* JOB INFO */}
                                <div className="mb-4">
                                    <div
                                        className="font-semibold text-lg line-clamp-2 text-left cursor-pointer"
                                        onClick={() => navigate(`/jobs/${job.jobId}`)}
                                    >
                                        {job.title}
                                    </div>

                                    <div className="text-txt-red mt-2 mb-2 text-left">
                                        {job.minSalary && job.maxSalary
                                            ? `${Number(job.minSalary).toLocaleString("vi-VN")} - ${Number(job.maxSalary).toLocaleString("vi-VN")} VNĐ`
                                            : "Thoả thuận"}
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                                        <span className="flex items-center gap-1">
                                            <i className="fa fa-list" />
                                            {job.jobType ? (jobTypeMap[job.jobType] ?? job.jobType) : "N/A"}
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
                                    {job.aiScore !== undefined && (
                                        <div className="text-txt-red font-semibold mb-2 text-left">
                                            Độ tương thích: {(job.aiScore * 100).toFixed(0)}%
                                            <i className="fa-solid fa-user-astronaut ml-2" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ===== RIGHT ACTION ===== */}
                            <div
                                className={`flex flex-col ${gridNumber === 3 ? "w-full" : "w-1/3"} 
                pb-4 items-end justify-end gap-2`}
                            >
                                <div className="flex flex-row gap-4 items-center">
                                    {isAuthenticated && (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(job.jobId);
                                            }}
                                            className={`
                                flex items-center cursor-pointer gap-2 px-3 py-2 
                                border rounded-full transition-colors
                                ${job.favorite
                                                    ? "bg-background-red text-white border-txt-red"
                                                    : "text-txt-red border-background-red hover:border-txt-red hover:text-white hover:bg-background-red"
                                                }
                            `}
                                        >
                                            <i
                                                className={`fa-heart text-lg ${job.favorite ? "fa-solid" : "fa-regular"
                                                    }`}
                                            />
                                        </div>
                                    )}

                                    <Button variant="seek" onClick={() => navigate(`/jobs/${job.jobId}`)}>
                                        Ứng tuyển
                                    </Button>
                                </div>

                                {/* DEADLINE */}
                                <span className="text-sm text-gray-500 text-right">
                                    <span>Ngày hết hạn: </span>
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

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
};

export default JobsList;
