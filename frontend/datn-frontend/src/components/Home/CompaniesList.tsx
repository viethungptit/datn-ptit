import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { getAllCompaniesApi } from "@/api/userApi";
import type { Company } from "@/pages/Admin/CompanyManagement";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";


const CompaniesList: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        getAllCompaniesApi().then((response) => {
            setCompanies(response.data);
        });
    }, []);

    const handleViewAll = () => {
        navigate("/companies");
    }

    const handleViewDetailCompany = (id: string) => {
        navigate(`/companies/${id}`);
    }

    return (
        <div className="w-full py-14 flex flex-col items-center bg-gray-100 px-[100px]">
            <h2 className="text-3xl font-semibold mb-10 text-txt-red">Nhà tuyển dụng tiêu biểu</h2>
            <div className="grid grid-cols-5 gap-5 w-full">
                {companies.map((company, idx) => (
                    <div key={idx}
                        onClick={() => handleViewDetailCompany(company.companyId)}
                        className="flex flex-col items-center bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:scale-105 transition-transform cursor-pointer">
                        <img
                            src={company.logoUrl ? `${MINIO_ENDPOINT}/datn/${company.logoUrl}` : '/default-logo.png'}
                            alt={company.companyName} className="w-28 h-28 rounded-md object-cover mb-4 mr-4" />
                        <div className="flex flex-col gap-2">
                            <span className="font-semibold text-base text-txt-red w-[220px] text-center line-clamp-2">{company.companyName}</span>
                            <p className="text-sm text-gray-700 line-clamp-2 w-[220px] text-center truncate">{company.industry}</p>
                            <span className="text-sm text-gray-500 text-center">{company.companySize} việc làm</span>
                        </div>
                    </div>
                ))}
            </div>
            <Button onClick={handleViewAll} variant="seek" size="lg" className="mt-10">Xem tất cả</Button>
        </div>
    );
};

export default CompaniesList;
