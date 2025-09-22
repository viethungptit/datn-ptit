import React from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const companies = [
    {
        logo: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
        name: "ITC JSC",
        location: "Hà Nội",
        industry: "Công nghệ",
        link: "/companies/ytb9wk953f2wwni",
        jobs: 24
    },
    {
        logo: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
        name: "ABC Corp PTIT Group PTIT Group PTIT Group",
        location: "Hồ Chí Minh PTIT Group PTIT Group",
        industry: "Marketing và truyền thông. PTIT Group",
        link: "#",
        jobs: 18
    },
    {
        logo: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
        name: "XYZ Solutions",
        location: "Đà Nẵng",
        industry: "Phần mềm",
        link: "#",
        jobs: 30
    },
    {
        logo: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
        name: "PTIT Group PTIT Group PTIT Group PTIT Group PTIT Group",
        location: "Hà Nội",
        industry: "Công nghệ và giáo dục.",
        link: "#",
        jobs: 12
    },
    {
        logo: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
        name: "ITC JSC",
        location: "Hà Nội",
        industry: "Công nghệ",
        link: "/companies/ytb9wk953f2wwni",
        jobs: 24
    },
    {
        logo: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
        name: "ABC Corp PTIT Group PTIT Group PTIT Group",
        location: "Hồ Chí Minh PTIT Group PTIT Group",
        industry: "Marketing và truyền thông. PTIT Group",
        link: "#",
        jobs: 18
    },
    {
        logo: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
        name: "XYZ Solutions",
        location: "Đà Nẵng",
        industry: "Phần mềm",
        link: "#",
        jobs: 30
    },
    {
        logo: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
        name: "PTIT Group PTIT Group PTIT Group PTIT Group PTIT Group",
        location: "Hà Nội",
        industry: "Công nghệ và giáo dục.",
        link: "#",
        jobs: 12
    }
];

const CompaniesList: React.FC = () => {

    const navigate = useNavigate();

    const handleViewAll = () => {
        navigate("/companies");
    }

    const handleViewDetailCompany = () => {
        navigate("/companies/1");
    }

    return (
        <div className="w-full py-14 flex flex-col items-center bg-gray-100 px-[100px]">
            <h2 className="text-3xl font-semibold mb-10 text-txt-red">Nhà tuyển dụng tiêu biểu</h2>
            <div className="grid grid-cols-5 gap-5 w-full">
                {companies.map((company, idx) => (
                    <div key={idx}
                        onClick={handleViewDetailCompany}
                        className="flex flex-col items-center bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:scale-105 transition-transform cursor-pointer">
                        <img src={company.logo} alt={company.name} className="w-28 h-28 rounded-md object-cover mb-4 mr-4" />
                        <div className="flex flex-col gap-2">
                            <span className="font-semibold text-base text-txt-red w-[220px] text-center line-clamp-2">{company.name}</span>
                            <p className="text-sm text-gray-700 line-clamp-2 w-[220px] text-center truncate">{company.industry}</p>
                            <span className="text-sm text-gray-500 text-center">{company.jobs} việc làm</span>
                        </div>
                    </div>
                ))}
            </div>
            <Button onClick={handleViewAll} variant="seek" size="lg" className="mt-10">Xem tất cả</Button>
        </div>
    );
};

export default CompaniesList;
