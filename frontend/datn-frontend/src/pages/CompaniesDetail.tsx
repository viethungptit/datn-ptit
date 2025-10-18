import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

// Dummy data for companies
const companies = [
    {
        id: 1,
        companyName: 'CÔNG TY TNHH SX TM NGUYÊN VẬT LIỆU MỚI TRUNG VIỆT',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
        coverImg: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200',
        industry: 'Technology',
        company_size: '500-1000',
        location: 'Hà Nội, Việt Nam',
        website: 'https://techinnovators.com https://techinnovators.com',
        description: 'GIỚI THIỆU CHUNG PALFISH - Trường Quốc tế PalFish Singapore là tổ chức giáo dục trực tuyến dành cho trẻ em trong độ tuổi 3-12 tuổi lớn nhất thế giới với hơn 60 triệu trẻ em ở 163 quốc gia sử dụng, mạng lưới 50 nghìn giáo viên quốc tế. - Được thành lập từ năm 2015, PalFish có trụ sở chính được đặt tại Singapore với các văn phòng...;',
        jobs: [
            { id: 1, title: 'Frontend Developer', location: 'Hà Nội', salary: '20-30 triệu', type: 'Full-time' },
            { id: 2, title: 'Backend Developer', location: 'Hà Nội', salary: '25-35 triệu', type: 'Full-time' },
        ],
    },
    {
        id: 2,
        companyName: 'Green Energy Co.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
        coverImg: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
        industry: 'Energy',
        company_size: '200-500',
        location: 'TP. Hồ Chí Minh, Việt Nam',
        website: 'https://greenenergy.com',
        description: 'Năng lượng xanh cho tương lai.',
        jobs: [
            { id: 1, title: 'Kỹ sư Năng lượng', location: 'TP. Hồ Chí Minh', salary: '18-25 triệu', type: 'Full-time' },
        ],
    },
];

const CompaniesDetail = () => {
    const { companyId } = useParams();
    const company = companies.find(c => c.id === Number(companyId));

    if (!company) return <div className="p-10 text-center text-xl">Không tìm thấy công ty!</div>;

    return (
        <div>
            <div className="px-[100px] py-10">
                <div className="relative rounded-xl overflow-hidden mb-8">
                    <img src={company.coverImg} alt="cover" className="w-full h-[400px] object-cover" />
                    <div className="absolute left-[20px] bottom-[20px] w-3/4 flex items-center bg-white rounded-xl shadow-lg p-4">
                        <img src={company.logo} alt="logo" className="h-36 w-36 object-contain rounded-lg border-2 mr-6" />
                        <div className='w-full'>
                            <h1 className="text-2xl text-left font-semibold mb-2 line-clamp-2">{company.companyName}</h1>
                            <div className="flex flex-row justify-between text-gray-600">
                                <span className='w-1/3 text-left truncate'><i className="fa-solid fa-industry"></i> {company.industry}</span>
                                <span className='w-1/3 text-left truncate'><i className="fa-regular fa-building"></i> {company.company_size} nhân viên</span>
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
                        {company.jobs.map(job => (
                            <div key={job.id} className="bg-white rounded shadow p-6 flex flex-col md:flex-row items-center justify-between">
                                <div className='text-left mb-4 md:mb-0'>
                                    <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                                    <div className="text-gray-600 text-sm mb-2">{job.location} | {job.type}</div>
                                    <div className="text-red-500 font-semibold">{job.salary}</div>
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
