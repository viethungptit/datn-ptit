import Footer from "@/components/Home/Footer";
import React from "react";

// Data giống JobsList, bổ sung trường appliedAt, status, cvUrl
const appliedJobs = [
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
        companyLink: "/companies/ytb9wk953f2wwni",
        appliedAt: "2025-09-10",
        status: "Đã duyệt",
        cvUrl: "#"
    },
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
        companyLink: "#",
        appliedAt: "2025-09-15",
        status: "Chờ duyệt",
        cvUrl: "#"
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
        companyLink: "#",
        appliedAt: "2025-09-18",
        status: "Đã từ chối",
        cvUrl: "#"
    }
];

const AppliedJobs: React.FC = () => {
    return (
        <div className="flex flex-col items-center">
            <div className='w-full flex justify-center px-[100px] py-14' style={{ background: 'linear-gradient(to bottom, #ff9fb0 0%, #fff 100%)' }}>
                <h1 className="text-2xl font-semibold text-txt-red">Việc làm đã ứng tuyển</h1>
            </div>
            <div className="grid grid-cols-1 gap-8 w-full px-[100px] pb-10">
                {appliedJobs.map((job, idx) => (
                    <div key={idx} className="flex flex-col bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:scale-105 transition-transform cursor-pointer">
                        <div className="flex items-center mb-2 justify-between">
                            <div className="flex flex-row items-center">
                                <img src={job.companyLogo} alt="#" className="w-24 h-24 rounded-md object-cover" />
                                <div className="flex flex-col ml-5 text-left">
                                    <a href={job.companyLink} className="font-semibold text-txt-red text-base line-clamp-2 block">{job.companyName}</a>
                                    <a href={job.jobLink} className="font-semibold text-lg line-clamp-2 text-left truncate ">{job.jobTitle}</a>
                                    <div className="text-txt-red text-left">{job.salary} <span>VND</span></div>
                                </div>
                            </div>
                            <span className="flex items-center text-left gap-1">
                                <span className={`px-3 py-1 rounded-full text-white font-semibold ml-2 ${job.status === 'Đã duyệt' ? 'bg-green-500' : job.status === 'Chờ duyệt' ? 'bg-yellow-500' : 'bg-red-500'}`}>{job.status}</span>
                            </span>
                        </div>
                        <div className="mb-4">
                            <div className="flex gap-2 text-sm text-gray-600 mt-3">
                                <span className="flex items-center text-left gap-1"><i className="fa fa-list" />{job.jobType}</span>
                                <span className="flex items-center text-left gap-1"><i className="fa fa-calendar-alt" />{job.jobTime}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 text-left line-clamp-2">{job.address}</p>
                        </div>
                        <div className="mt-auto text-sm text-gray-400 flex items-center justify-between">
                            <span className="flex items-center text-left gap-1"><i className="fa fa-calendar-alt" />Ứng tuyển: {job.appliedAt}</span>
                            <a href={job.cvUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-txt-red text-white rounded hover:bg-red-700 transition-colors">Xem CV đã nộp</a>
                        </div>
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
};

export default AppliedJobs;
