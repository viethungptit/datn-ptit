import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const companies = [
    {
        id: 1,
        name: 'Tech Innovators',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
        coverImg: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200',
        description: 'GIỚI THIỆU CHUNG PALFISH - Trường Quốc tế PalFish Singapore là tổ chức giáo dục trực tuyến dành cho trẻ em trong độ tuổi 3-12 tuổi lớn nhất thế giới với hơn 60 triệu trẻ em ở 163 quốc gia sử dụng, mạng lưới 50 nghìn giáo viên quốc tế. - Được thành lập từ năm 2015, PalFish có trụ sở chính được đặt tại Singapore với các văn phòng...',
        industry: 'Technology',
    },
    {
        id: 2,
        name: 'Green Energy Co.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
        coverImg: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
        description: 'GIỚI THIỆU CHUNG PALFISH - Trường Quốc tế PalFish Singapore là tổ chức giáo dục trực tuyến dành cho trẻ em trong độ tuổi 3-12 tuổi lớn nhất thế giới với hơn 60 triệu trẻ em ở 163 quốc gia sử dụng, mạng lưới 50 nghìn giáo viên quốc tế. - Được thành lập từ năm 2015, PalFish có trụ sở chính được đặt tại Singapore với các văn phòng...',
        industry: 'Energy',
    },
    {
        id: 3,
        name: 'Health First',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
        coverImg: 'https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=1200',
        description: 'GIỚI THIỆU CHUNG PALFISH - Trường Quốc tế PalFish Singapore là tổ chức giáo dục trực tuyến dành cho trẻ em trong độ tuổi 3-12 tuổi lớn nhất thế giới với hơn 60 triệu trẻ em ở 163 quốc gia sử dụng, mạng lưới 50 nghìn giáo viên quốc tế. - Được thành lập từ năm 2015, PalFish có trụ sở chính được đặt tại Singapore với các văn phòng...',
        industry: 'Healthcare',
    },
    {
        id: 4,
        name: 'Tech Innovators',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
        coverImg: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200',
        description: 'GIỚI THIỆU CHUNG PALFISH - Trường Quốc tế PalFish Singapore là tổ chức giáo dục trực tuyến dành cho trẻ em trong độ tuổi 3-12 tuổi lớn nhất thế giới với hơn 60 triệu trẻ em ở 163 quốc gia sử dụng, mạng lưới 50 nghìn giáo viên quốc tế. - Được thành lập từ năm 2015, PalFish có trụ sở chính được đặt tại Singapore với các văn phòng...',
        industry: 'Technology',
    },
    {
        id: 5,
        name: 'Green Energy Co.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
        coverImg: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
        description: 'GIỚI THIỆU CHUNG PALFISH - Trường Quốc tế PalFish Singapore là tổ chức giáo dục trực tuyến dành cho trẻ em trong độ tuổi 3-12 tuổi lớn nhất thế giới với hơn 60 triệu trẻ em ở 163 quốc gia sử dụng, mạng lưới 50 nghìn giáo viên quốc tế. - Được thành lập từ năm 2015, PalFish có trụ sở chính được đặt tại Singapore với các văn phòng...',
        industry: 'Energy',
    },
    {
        id: 6,
        name: 'Health First',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
        coverImg: 'https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=1200',
        description: 'GIỚI THIỆU CHUNG PALFISH - Trường Quốc tế PalFish Singapore là tổ chức giáo dục trực tuyến dành cho trẻ em trong độ tuổi 3-12 tuổi lớn nhất thế giới với hơn 60 triệu trẻ em ở 163 quốc gia sử dụng, mạng lưới 50 nghìn giáo viên quốc tế. - Được thành lập từ năm 2015, PalFish có trụ sở chính được đặt tại Singapore với các văn phòng...',
        industry: 'Healthcare',
    },
    {
        id: 1,
        name: 'Tech Innovators',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
        coverImg: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200',
        description: 'GIỚI THIỆU CHUNG PALFISH - Trường Quốc tế PalFish Singapore là tổ chức giáo dục trực tuyến dành cho trẻ em trong độ tuổi 3-12 tuổi lớn nhất thế giới với hơn 60 triệu trẻ em ở 163 quốc gia sử dụng, mạng lưới 50 nghìn giáo viên quốc tế. - Được thành lập từ năm 2015, PalFish có trụ sở chính được đặt tại Singapore với các văn phòng...',
        industry: 'Technology',
    },
    {
        id: 2,
        name: 'Green Energy Co.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
        coverImg: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
        description: 'GIỚI THIỆU CHUNG PALFISH - Trường Quốc tế PalFish Singapore là tổ chức giáo dục trực tuyến dành cho trẻ em trong độ tuổi 3-12 tuổi lớn nhất thế giới với hơn 60 triệu trẻ em ở 163 quốc gia sử dụng, mạng lưới 50 nghìn giáo viên quốc tế. - Được thành lập từ năm 2015, PalFish có trụ sở chính được đặt tại Singapore với các văn phòng...',
        industry: 'Energy',
    },
    {
        id: 3,
        name: 'Health First',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
        coverImg: 'https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=1200',
        description: 'GIỚI THIỆU CHUNG PALFISH - Trường Quốc tế PalFish Singapore là tổ chức giáo dục trực tuyến dành cho trẻ em trong độ tuổi 3-12 tuổi lớn nhất thế giới với hơn 60 triệu trẻ em ở 163 quốc gia sử dụng, mạng lưới 50 nghìn giáo viên quốc tế. - Được thành lập từ năm 2015, PalFish có trụ sở chính được đặt tại Singapore với các văn phòng...',
        industry: 'Healthcare',
    },
    {
        id: 4,
        name: 'Tech Innovators',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
        coverImg: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200',
        description: 'GIỚI THIỆU CHUNG PALFISH - Trường Quốc tế PalFish Singapore là tổ chức giáo dục trực tuyến dành cho trẻ em trong độ tuổi 3-12 tuổi lớn nhất thế giới với hơn 60 triệu trẻ em ở 163 quốc gia sử dụng, mạng lưới 50 nghìn giáo viên quốc tế. - Được thành lập từ năm 2015, PalFish có trụ sở chính được đặt tại Singapore với các văn phòng...',
        industry: 'Technology',
    },
    {
        id: 5,
        name: 'Green Energy Co.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
        coverImg: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
        description: 'GIỚI THIỆU CHUNG PALFISH - Trường Quốc tế PalFish Singapore là tổ chức giáo dục trực tuyến dành cho trẻ em trong độ tuổi 3-12 tuổi lớn nhất thế giới với hơn 60 triệu trẻ em ở 163 quốc gia sử dụng, mạng lưới 50 nghìn giáo viên quốc tế. - Được thành lập từ năm 2015, PalFish có trụ sở chính được đặt tại Singapore với các văn phòng...',
        industry: 'Energy',
    },
    {
        id: 6,
        name: 'Health First',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
        coverImg: 'https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=1200',
        description: 'GIỚI THIỆU CHUNG PALFISH - Trường Quốc tế PalFish Singapore là tổ chức giáo dục trực tuyến dành cho trẻ em trong độ tuổi 3-12 tuổi lớn nhất thế giới với hơn 60 triệu trẻ em ở 163 quốc gia sử dụng, mạng lưới 50 nghìn giáo viên quốc tế. - Được thành lập từ năm 2015, PalFish có trụ sở chính được đặt tại Singapore với các văn phòng...',
        industry: 'Healthcare',
    },
];


const Companies: React.FC = () => {
    const navigate = useNavigate();

    const handleViewDetailCompany = () => {
        navigate("/companies/1");
    }

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
                            className="w-full p-2 border-none shadow-none outline-none rounded-full" />
                        <Button variant="seek">Tìm kiếm</Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 px-[100px]">
                {companies.map(company => (
                    <div key={company.id}
                        onClick={handleViewDetailCompany}
                        className="bg-white rounded shadow p-4 flex flex-col hover:scale-105 transition-transform duration-200 cursor-pointer">
                        <img src={company.coverImg} alt="cover" className="h-40 w-full object-cover rounded mb-2" />
                        <div className="flex items-center mb-2">
                            <img src={company.logo} alt="logo" className="h-16 w-16 p-1 object-contain rounded-md mr-3 border" />
                            <div className='text-left'>
                                <h2 className="text-lg font-semibold">{company.name}</h2>
                                <span className="text-sm text-gray-500">{company.industry}</span>
                            </div>
                        </div>
                        <p className="text-gray-700 text-sm text-left mt-3 line-clamp-5">{company.description}</p>
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
};

export default Companies;
