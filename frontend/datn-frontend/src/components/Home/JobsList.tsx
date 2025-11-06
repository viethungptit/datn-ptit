import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { getAllJobs } from "@/api/recruitApi";
import type { Job } from "@/pages/Admin/JobManagement";
import type { Company } from "@/pages/Admin/CompanyManagement";
import { getAllCompaniesApi } from "@/api/userApi";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";

interface JobsListProps {
    gridNumber?: number;
}

const JobsList: React.FC<JobsListProps> = ({ gridNumber }) => {
    const [jobs, setJobs] = useState<any[]>([]);
    const navigate = useNavigate();

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
                        companyLink: company?.website ?? "",
                        companyName: company?.name ?? "",
                    };
                });

                setJobs(merged);
            })
            .catch(console.error);
    }, []);

    const handleViewAll = () => {
        navigate("/jobs");
    }

    const handleViewDetailJob = (jobId: number) => {
        navigate(`/jobs/${jobId}`);
    }

    return (
        <div className={`w-full ${gridNumber === 3 ? 'py-14' : 'py-0'} flex flex-col items-center px-[100px]`}>
            <h2 className={`${gridNumber === 3 ? 'block' : 'hidden'} text-3xl font-semibold mb-10 text-txt-red`}>Việc làm có thể bạn quan tâm</h2>
            <div className={`grid grid-cols-${gridNumber} gap-8 w-full`}>
                {jobs.map((job, idx) => (
                    <div key={idx}
                        onClick={() => handleViewDetailJob(idx)}
                        className="flex flex-col bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:scale-105 transition-transform cursor-pointer">
                        <div className="flex items-center mb-4">
                            <img
                                src={job.companyLogo ? `${MINIO_ENDPOINT}/datn/${job.companyLogo}` : '/default-logo.png'}
                                alt="#" className="w-24 h-24 rounded-md object-cover" />
                            <div className="flex flex-col ml-5 text-left">
                                <p className="text-sm text-gray-500 mb-1 line-clamp-2">{job.location}</p>
                                <a href={job.companyLink} className="font-semibold text-txt-red text-base line-clamp-2 block">{job.companyName}</a>
                            </div>
                        </div>
                        <div className="mb-4">
                            <a href={job.jobLink} className="font-semibold text-lg line-clamp-2 text-left truncate ">{job.title}</a>
                            <div className="text-txt-red mt-2 mb-5 text-left">{job.salaryRange} <span>VND</span></div>
                            <div className="flex gap-2 text-sm text-gray-600 mt-3">
                                <span className="flex items-center text-left gap-1"><i className="fa fa-list" />{job.title}</span>
                                <span className="flex items-center text-left gap-1"><i className="fa fa-calendar-alt" />{job.jobType}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 text-left line-clamp-2">{job.location}</p>
                        </div>
                        <div className="mt-auto text-sm text-gray-400 flex items-center justify-between">
                            <span>Đã đăng 3 ngày trước</span>
                            <div
                                className="flex items-center cursor-pointer gap-2 px-3 py-2 border-[1px] text-txt-red border-background-red rounded-full hover:border-txt-red hover:text-white hover:bg-background-red transition-colors"
                            >
                                <i className="fa-regular fa-heart text-lg"></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Button onClick={handleViewAll} variant="seek" size="lg" className="mt-10">Xem tất cả</Button>
        </div>
    );
};

export default JobsList;
