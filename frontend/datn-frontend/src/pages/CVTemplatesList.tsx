import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const cvTemplates = [
    {
        id: 1,
        name: 'CV Mẫu Đơn Giản',
        img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: 2,
        name: 'CV Chuyên Nghiệp',
        img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: 3,
        name: 'CV Sáng Tạo',
        img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: 4,
        name: 'CV Hiện Đại',
        img: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: 5,
        name: 'CV Sinh Viên',
        img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    },
    {
        id: 6,
        name: 'CV Kinh Nghiệm',
        img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    },
];

const CVTemplatesList = () => {
    return (
        <div>
            <div className='flex flex-row px-[100px] py-28' style={{ background: 'linear-gradient(to bottom, #ff9fb0 0%, #fff 100%)' }}>
                <div className='w-full'>
                    <div className="text-center mb-6">
                        <p className="text-2xl font-bold text-txt-red mb-2">Các mẫu CV nổi bật mới nhất 2025</p>
                        <p className="text-base text-gray-700">Hãy chọn một mẫu CV phù hợp với bạn nhất để có thể nổi bật trong mắt nhà tuyển dụng.</p>
                    </div>
                </div>
            </div>
            <div className="px-[100px] py-8">
                <div className="grid grid-cols-4 gap-8">
                    {cvTemplates.map(template => (
                        <div key={template.id} className="border rounded-lg shadow p-4 flex flex-col">
                            <img src={template.img} alt={template.name} className="w-full h-[350px] object-cover rounded mb-3" />
                            <span className="font-semibold text-left text-lg mb-2">{template.name}</span>
                            <Button variant="seek" size="lg" className="w-full max-w-sm mt-4">Dùng mẫu</Button>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CVTemplatesList;
