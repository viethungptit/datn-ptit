import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

const jobs = [
    {
        id: 1,
        title: 'Frontend Developer',
        salary: '20-30 triệu',
        experience: '1-2 năm',
        deadline: '30/09/2025',
        location: 'Duy Tân, Cầu Giấy, Hà Nội, Việt Nam',
        description: `
        Mô tả công việc
        Phiên dịch viên cho các phòng ban: Phòng Kế toán - Tài chính, Hành chính, ... trong các cuộc họp tại Công ty;
        Phiên dịch các văn bản, tài liệu từ Tiếng Việt sang Tiếng Trung và ngược lại;
        Soạn thảo và dịch các văn bản, biên bản, hợp đồng, ... theo yêu cầu công việc;
        Thực hiện một số công việc khác theo yêu cầu của Trưởng phòng Kế toán và Ban Giám đốc Công ty.

        Yêu cầu ứng viên
        Tốt nghiệp chuyên ngành Ngôn ngữ Trung Quốc hoặc các chuyên ngành khác có liên quan;
        Ưu tiên ứng viên đã có kinh nghiệm làm phiên dịch viên tại các công ty Trung Quốc, chuyên ngành Kế toán, mạnh về số liệu;
        Sử dụng thành thạo 4 kỹ năng tiếng Trung: nghe, nói, đọc, viết;
        Tác phong làm việc chuyên nghiệp, trách nhiệm trong công việc;
        Sử dụng thành thạo tin học văn phòng;
        Ưu tiên phiên dịch tuổi < 1996.

        Quyền lợi
        Lương thỏa thuận theo năng lực từ 12.000.000 - 17.000.000vnđ;
        Làm việc tại Văn phòng, môi trường làm việc chuyên nghiệp;
        Đầy đủ các chế độ phúc lợi theo Luật lao động và theo chế độ chính sách của Công ty.

        Địa điểm làm việc
        - Hồ Chí Minh: 183 Đường Số 7, Phường An Lạc, Bình Tân
        Thời gian làm việc
        Thứ 2 - Thứ 6 (từ 08:00 đến 17:00)
        Thứ 7 (từ 08:00 đến 11:30)
        Nghỉ trưa: 11h30- 13h00

        Cách thức ứng tuyển
        Ứng viên nộp hồ sơ trực tuyến bằng cách bấm Ứng tuyển ngay dưới đây.
        `,
        quantity: 2,
        type: 'Full-time',
        tags: ['React', 'JavaScript', 'CSS', 'UI/UX'],
        categories: ['IT', 'Developer', 'Ngôn ngữ', 'Kế toán'],
        company: {
            name: 'CÔNG TY TNHH SX TM NGUYÊN VẬT LIỆU MỚI TRUNG VIỆT',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png',
            size: '500-1000',
            industry: 'Technology',
            address: 'Hà Nội, Việt Nam',
            website: 'https://techinnovators.com',
        },
    },
];

const JobDetail = () => {
    const { jobId } = useParams();
    const job = jobs.find(j => j.id === Number(jobId));

    if (!job) return <div className="p-10 text-center text-xl">Không tìm thấy công việc!</div>;

    return (
        <div>
            <div className='flex justify-center px-[100px] py-14' style={{ background: 'linear-gradient(to bottom, #ff9fb0 0%, #fff 100%)' }}>
                <h1 className="text-3xl font-semibold text-txt-red">{job.title}</h1>
            </div>
            <div className="flex flex-col md:flex-row gap-8 px-[100px] py-10">
                <div className="md:w-3/4 w-full bg-white rounded-xl shadow p-8 flex flex-col border gap-6">
                    <div className="flex flex-row justify-between gap-6">
                        <div className="flex flex-row items-center gap-3 text-gray-700 w-1/3">
                            <div className="flex items-center justify-center w-10 h-10 bg-[#ffe3ea] rounded-full border-2 border-[#d90429] mb-2">
                                <i className="fa-solid fa-sack-dollar text-[#d90429]"></i>
                            </div>
                            <div className='flex flex-col'>
                                <span className="text-left text-sm">Mức lương</span>
                                <span className="text-left font-semibold">{job.salary}</span>
                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-3 text-gray-700 w-1/3">
                            <div className="flex items-center justify-center w-10 h-10 bg-[#ffe3ea] rounded-full border-2 border-[#d90429] mb-2">
                                <i className="fa-solid fa-hourglass-half text-[#d90429]"></i>
                            </div>
                            <div className='flex flex-col'>
                                <span className="text-left text-sm">Kinh nghiệm</span>
                                <span className="text-left font-semibold">{job.experience}</span>
                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-3 text-gray-700 w-1/3">
                            <div className="flex items-center justify-center px-2 w-10 h-10 bg-[#ffe3ea] rounded-full border-2 border-[#d90429] mb-2">
                                <i className="fa-solid fa-location-dot text-[#d90429]"></i>
                            </div>
                            <div className='flex flex-col'>
                                <span className="text-left text-sm">Địa điểm</span>
                                <span className="text-left font-semibold line-clamp-1">{job.location}</span>
                            </div>
                        </div>
                    </div>
                    <span className="text-left text-gray-600">Hạn nộp hồ sơ: <span className="font-semibold">{job.deadline}</span></span>
                    <div className="flex items-center justify-between">
                        <Button variant="seek" className='w-1/3'>Ứng tuyển ngay</Button>
                        <div
                            className="flex items-center cursor-pointer gap-2 px-3 py-2 border-[1px] text-txt-red border-background-red rounded-full hover:border-txt-red hover:text-white hover:bg-background-red transition-colors"
                        >
                            <i className="fa-regular fa-heart text-lg"></i>
                        </div>
                    </div>
                    <div className='text-left border-t-2 pt-5'>
                        <h2 className="text-lg font-semibold mb-2">Chi tiết công việc</h2>
                        <p className="text-gray-700 text-base whitespace-pre-line">{job.description}</p>
                    </div>
                </div>
                <div className="md:w-1/4 w-full bg-white rounded-xl shadow p-6 flex flex-col border gap-6">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <img src={job.company.logo} alt="logo" className="h-40 w-40 object-contain rounded-md border" />
                        <div>
                            <h2 className="text-lg font-semibold">{job.company.name}</h2>
                            <div className="text-base mb-1">{job.company.industry}</div>
                            <div className="text-base mb-1">Quy mô: {job.company.size}</div>
                            <div className="text-base mb-1">{job.company.address}</div>
                            <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-base">{job.company.website}</a>
                        </div>
                    </div>
                    <div className="mb-4 flex flex-col gap-3">
                        <div className="flex flex-row items-center gap-3 text-gray-700">
                            <div className="flex items-center justify-center w-9 h-9 bg-[#ffe3ea] rounded-full border-2 border-[#d90429]">
                                <i className="fa-solid fa-users text-[#d90429]"></i>
                            </div>
                            <div className='flex flex-col'>
                                <span className="text-left text-sm">Số lượng</span>
                                <span className="text-left font-semibold">{job.quantity}</span>
                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-3 text-gray-700">
                            <div className="flex items-center justify-center w-9 h-9 bg-[#ffe3ea] rounded-full border-2 border-[#d90429]">
                                <i className="fa-solid fa-briefcase text-[#d90429]"></i>
                            </div>
                            <div className='flex flex-col'>
                                <span className="text-left text-sm">Hình thức</span>
                                <span className="text-left font-semibold">{job.type}</span>
                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-3 text-gray-700">
                            <div className="flex items-center justify-center w-9 h-9 bg-[#ffe3ea] rounded-full border-2 border-[#d90429]">
                                <i className="fa-solid fa-calendar-day text-[#d90429]"></i>
                            </div>
                            <div className='flex flex-col'>
                                <span className="text-left text-sm">Hạn nộp</span>
                                <span className="text-left font-semibold">{job.deadline}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-base text-left font-semibold mb-2">Kĩ năng cần có</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.tags.map(tag => (
                                <span key={tag} className="bg-[#d90429] text-white px-3 py-1 rounded-full text-xs font-medium">{tag}</span>
                            ))}
                        </div>
                        <h2 className="text-base text-left font-semibold mb-2 mt-5">Doanh mục nghề</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.categories.map(category => (
                                <span key={category} className="bg-[#d90429] text-white px-3 py-1 rounded-full text-xs font-medium">{category}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default JobDetail;
