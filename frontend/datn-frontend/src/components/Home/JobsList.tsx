import React from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const jobs = [
    {
        salary: "8.000.000đ - 10.000.000",
        companyLogo: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
        location: "Hà Nội",
        companyName: "ITC JSC",
        jobTitle: "Trợ Lý Dự Án",
        jobType: "Trợ lý",
        jobTime: "Fulltime",
        address: "Số 10, Ngõ 81, phố Linh Lang, phường Cống Vị, quận Ba Đình Số 10, Ngõ 81, phố Linh Lang, phường Cống Vị, quận Ba Đình",
        jobLink: "/jobs/tro-ly-du-an-itc-jsc-1202509191426",
        companyLink: "/companies/ytb9wk953f2wwni"
    },
    // Thêm 2 job mẫu nữa cho đủ grid-3
    {
        salary: "12.000.000đ - 15.000.000",
        companyLogo: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
        location: "Hồ Chí Minh Hồ Chí Minh Hồ Chí Minh Hồ Chí Minh",
        companyName: "ABC Corp Hồ Chí Minh Hồ Chí Minh",
        jobTitle: "Nhân viên Marketing Nhân viên Marketing",
        jobType: "Marketing",
        jobTime: "Parttime",
        address: "123 Đường Lê Lợi, Quận 1",
        jobLink: "#",
        companyLink: "#"
    },
    {
        salary: "20.000.000đ - 25.000.000 / 1 tháng 20.000.000đ - 25.000.000 / 1 tháng",
        companyLogo: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
        location: "Đà Nẵng",
        companyName: "XYZ Solutions",
        jobTitle: "Lập trình viên Frontend",
        jobType: "Lập trình viên",
        jobTime: "Fulltime",
        address: "456 Đường Trần Phú, Hải Châu",
        jobLink: "#",
        companyLink: "#"
    },
    {
        salary: "8.000.000đ - 10.000.000",
        companyLogo: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
        location: "Hà Nội",
        companyName: "ITC JSC",
        jobTitle: "Trợ Lý Dự Án",
        jobType: "Trợ lý",
        jobTime: "Fulltime",
        address: "Số 10, Ngõ 81, phố Linh Lang, phường Cống Vị, quận Ba Đình Số 10, Ngõ 81, phố Linh Lang, phường Cống Vị, quận Ba Đình",
        jobLink: "/jobs/tro-ly-du-an-itc-jsc-1202509191426",
        companyLink: "/companies/ytb9wk953f2wwni"
    },
    // Thêm 2 job mẫu nữa cho đủ grid-3
    {
        salary: "12.000.000đ - 15.000.000",
        companyLogo: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
        location: "Hồ Chí Minh Hồ Chí Minh Hồ Chí Minh Hồ Chí Minh",
        companyName: "ABC Corp Hồ Chí Minh Hồ Chí Minh",
        jobTitle: "Nhân viên Marketing Nhân viên Marketing",
        jobType: "Marketing",
        jobTime: "Parttime",
        address: "123 Đường Lê Lợi, Quận 1",
        jobLink: "#",
        companyLink: "#"
    },
    {
        salary: "20.000.000đ - 25.000.000 / 1 tháng 20.000.000đ - 25.000.000 / 1 tháng",
        companyLogo: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
        location: "Đà Nẵng",
        companyName: "XYZ Solutions",
        jobTitle: "Lập trình viên Frontend",
        jobType: "Lập trình viên",
        jobTime: "Fulltime",
        address: "456 Đường Trần Phú, Hải Châu",
        jobLink: "#",
        companyLink: "#"
    }
];

interface JobsListProps {
    gridNumber?: number;
}

const JobsList: React.FC<JobsListProps> = ({ gridNumber }) => {
    const navigate = useNavigate();

    const handleViewAll = () => {
        navigate("/jobs");
    }

    const handleViewDetailJob = () => {
        navigate("/jobs/1");
    }

    return (
        <div className={`w-full ${gridNumber === 3 ? 'py-14' : 'py-0'} flex flex-col items-center px-[100px]`}>
            <h2 className={`${gridNumber === 3 ? 'block' : 'hidden'} text-3xl font-semibold mb-10 text-txt-red`}>Việc làm có thể bạn quan tâm</h2>
            <div className={`grid grid-cols-${gridNumber} gap-8 w-full`}>
                {jobs.map((job, idx) => (
                    <div key={idx}
                        onClick={handleViewDetailJob}
                        className="flex flex-col bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:scale-105 transition-transform cursor-pointer">
                        <div className="flex items-center mb-4">
                            <img src={job.companyLogo} alt="#" className="w-24 h-24 rounded-md object-cover" />
                            <div className="flex flex-col ml-5 text-left">
                                <p className="text-sm text-gray-500 mb-1 line-clamp-2">{job.location}</p>
                                <a href={job.companyLink} className="font-semibold text-txt-red text-base line-clamp-2 block">{job.companyName}</a>
                            </div>
                        </div>
                        <div className="mb-4">
                            <a href={job.jobLink} className="font-semibold text-lg line-clamp-2 text-left truncate ">{job.jobTitle}</a>
                            <div className="text-txt-red mt-2 mb-5 text-left">{job.salary} <span>VND</span></div>
                            <div className="flex gap-2 text-sm text-gray-600 mt-3">
                                <span className="flex items-center text-left gap-1"><i className="fa fa-list" />{job.jobType}</span>
                                <span className="flex items-center text-left gap-1"><i className="fa fa-calendar-alt" />{job.jobTime}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 text-left line-clamp-2">{job.address}</p>
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
