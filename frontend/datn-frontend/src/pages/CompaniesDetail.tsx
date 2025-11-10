import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { getAllJobs } from '@/api/recruitApi';
import { getAllCompaniesApi } from '@/api/userApi';
import type { Job } from './Admin/JobManagement';
import type { Company } from './Admin/CompanyManagement';
import { MINIO_ENDPOINT } from '@/api/serviceConfig';

const CompaniesDetail = () => {
    const [companies, setCompanies] = useState<any[]>([]);
        
    useEffect(() => {
        Promise.all([getAllJobs(), getAllCompaniesApi()])
            .then(([jobsRes, compRes]) => {
                const jobList = jobsRes.data;
                const companyList = compRes.data;

                const merged = companyList.map((c: Company) => {
                    return {
                        ...c,
                        jobs: jobList.filter((j: Job) => j.companyId === c.companyId)
                    };
                });

                setCompanies(merged);
            })
            .catch(console.error);
    }, []);

    const { companyId } = useParams();
    const company = companies.find((c, index: number) => index === Number(companyId));

    if (!company) return <div className="p-10 text-center text-xl">Không tìm thấy công ty!</div>;

    return (
        <div>
            <div className="px-[100px] py-10">
                <div className="relative rounded-xl overflow-hidden mb-8">
                    <img 
                    src={company.coverImgUrl ? `${MINIO_ENDPOINT}/datn/${company.coverImgUrl}` : '/default-logo.png'}
                    alt="cover" className="w-full h-[400px] object-cover" />
                    <div className="absolute left-[20px] bottom-[20px] w-3/4 flex items-center bg-white rounded-xl shadow-lg p-4">
                        <img src={company.logoUrl ? `${MINIO_ENDPOINT}/datn/${company.logoUrl}` : '/default-logo.png'} alt="logo" className="h-36 w-36 object-cover rounded-lg border-2 mr-6" />
                        <div className='w-full'>
                            <h1 className="text-2xl text-left font-semibold mb-2 line-clamp-2">{company.companyName}</h1>
                            <div className="flex flex-row justify-between text-gray-600">
                                <span className='w-1/3 text-left truncate'><i className="fa-solid fa-industry"></i>Technology</span>
                                <span className='w-1/3 text-left truncate'><i className="fa-regular fa-building"></i> {company.companySize} nhân viên</span>
                                <span className='w-1/3 text-left truncate'><i className="fa-solid fa-link"></i> {company.website}</span>
                            </div>
                            <span className="text-left mt-2 block">{company.location}</span>
                        </div>
                    </div>
                </div>
                <div className="my-10 shadow-lg p-6 rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-3">Giới thiệu công ty</h2>
                    <p className="text-gray-700 text-left">{company.description}</p>
                </div>
                <div className='my-10 shadow-lg p-6 rounded-lg border'>
                    <h2 className="text-xl font-semibold mb-4 border-b pb-3">Danh sách công việc</h2>
                    <div className="grid grid-cols-1 gap-6">
                        {company.jobs.map((job: Job, index: number) => (
                            <div key={index} className="bg-white rounded shadow p-6 flex flex-col md:flex-row items-center justify-between">
                                <div className='text-left mb-4 md:mb-0'>
                                    <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                                    <div className="text-gray-600 text-sm mb-2">{job.location} | {job.jobType}</div>
                                    <div className="text-red-500 font-semibold">{job.salaryRange}</div>
                                </div>
                                <div className='flex flex-col md:flex-row items-center gap-4'>
                                    <div
                                        className="flex items-center cursor-pointer gap-2 px-3 py-2 border-[1px] text-txt-red border-background-red rounded-full hover:border-txt-red hover:text-white hover:bg-background-red transition-colors"
                                    >
                                        <i className="fa-regular fa-heart text-lg"></i>
                                    </div>
                                    <Button variant="seek">Ứng tuyển</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CompaniesDetail;
