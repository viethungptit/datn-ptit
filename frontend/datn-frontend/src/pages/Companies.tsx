import { getAllCompaniesApi, searchCompaniesApi } from '@/api/userApi';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Company } from './Admin/CompanyManagement';
import { MINIO_ENDPOINT } from '@/api/serviceConfig';

const Companies: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [keyword, setKeyword] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
        getAllCompaniesApi().then((response) => {
            setCompanies(response.data);
        });
    }, []);

    const handleViewDetailCompany = (id: string) => {
        navigate(`/companies/${id}`);
    }

    const searchCompany = () => {
        if (keyword.trim() === "") {
            getAllCompaniesApi().then((response) => {
                setCompanies(response.data);
            });
        } else {
            searchCompaniesApi(keyword).then((response) => {
                setCompanies(response.data);
            });
        }
    };

    return (
        <div>
            <div className='flex flex-row px-[100px] py-28' style={{ background: 'linear-gradient(to bottom, #ff9fb0 0%, #fff 100%)' }}>
                <div className='w-1/2'>
                    <div className="text-left mb-6">
                        <p className="text-2xl font-bold text-txt-red mb-2">Khám phá các công ty</p>
                        <p className="text-base text-gray-700">Tra cứu thông tin công ty và tìm kiếm nơi làm việc tốt nhất dành cho bạn</p>
                    </div>
                    <div className='flex flex-row items-center gap-4 mb-4 border rounded-full p-1 px-2 bg-white bg-opacity-70'>
                        <Input placeholder="Nhập tên công ty..."
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full p-2 border-none shadow-none outline-none rounded-full" />
                        <Button variant="seek" onClick={searchCompany}>Tìm kiếm</Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 px-[100px]">
                {companies.length > 0 ? companies.map((company, index) => (
                    <div key={index}
                        onClick={() => handleViewDetailCompany(company.companyId)}
                        className="bg-white rounded shadow p-4 flex flex-col hover:scale-105 transition-transform duration-200 cursor-pointer">
                        <img
                            src={company.coverImgUrl ? `${MINIO_ENDPOINT}/datn/${company.coverImgUrl}` : '/default-cover.png'}
                            alt="cover" className="h-40 w-full object-cover rounded mb-2" />
                        <div className="flex items-center mb-2">
                            <img
                                src={company.logoUrl ? `${MINIO_ENDPOINT}/datn/${company.logoUrl}` : '/default-logo.png'}
                                alt="logo" className="h-16 w-16 p-1 object-cover rounded-md mr-3 border" />
                            <div className='text-left'>
                                <h2 className="text-lg font-semibold">{company.companyName}</h2>
                                <span className="text-sm text-gray-500">{company.industry}</span>
                            </div>
                        </div>
                        <p className="text-gray-700 text-sm text-left mt-3 line-clamp-5">{company.description}</p>
                    </div>
                )) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <div className="bg-white shadow-lg rounded-lg p-8 w-full text-center">
                            <span>Không có công ty nào phù hợp với bộ lọc hiện tại.</span>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Companies;
