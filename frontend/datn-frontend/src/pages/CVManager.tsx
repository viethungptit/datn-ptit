import { useState } from 'react';
import { Button } from '../components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../components/ui/dropdown-menu';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

// Dummy data for CVs
const sampleCVs = [
    {
        id: 1,
        name: 'CV Nguyen Van A Software Engineer',
        type: 'template',
        url: '#',
        img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        updatedAt: '20-09-2025',
    },
    {
        id: 2,
        name: 'CV Nguyen Van B Designer',
        type: 'template',
        url: '#',
        img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
        updatedAt: '18-09-2025',
    },
];
const uploadedCVs = [
    {
        id: 3,
        name: 'CV_Nguyen_Van_C.pdf',
        type: 'uploaded',
        url: '#',
        img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
        updatedAt: '21-09-2025',
    },
];

const CVManager = () => {
    const [templateCVs] = useState(sampleCVs);
    const [uploadedCVList] = useState(uploadedCVs);
    const navigate = useNavigate();

    const handleCreateCV = () => {
        navigate("/cv-templates");
    };

    const handleUploadCV = () => {
        navigate("/upload-cv");
    };

    const editCV = () => {
        navigate("/manage-cvs/1");
    }

    const previewCV = () => {
        navigate("/preview-cv/1");
    }


    return (
        <div className='flex flex-col gap-8'>
            <div className="px-[100px] py-8 flex flex-col gap-8">
                {/* CV theo mẫu */}
                <div className='shadow-md p-6 rounded-md border'>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">CV đã tạo theo mẫu</h2>
                        <Button variant="login" onClick={handleCreateCV}>Tạo CV theo mẫu</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {templateCVs.map(cv => (
                            <div key={cv.id} className="border rounded p-4 flex flex-col items-center relative">
                                <img src={cv.img} alt={cv.name}
                                    onClick={previewCV}
                                    className="w-full h-[350px] object-cover rounded mb-2 cursor-pointer" />
                                <span className="font-semibold mb-2 line-clamp-2 cursor-pointer" onClick={previewCV}>{cv.name}</span>
                                <span className="text-xs text-gray-500 mb-2">Cập nhật: {cv.updatedAt}</span>
                                <div className="absolute bottom-5 right-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="w-10 h-10 flex items-center justify-center border bg-gray-100 hover:bg-gray-200 rounded-full shadow focus:outline-none">
                                            <i className="fa-solid fa-ellipsis"></i>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => alert('Tải về CV: ' + cv.name)}>Tải về</DropdownMenuItem>
                                            <DropdownMenuItem onClick={editCV}>Chỉnh sửa</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => alert('Đổi tên CV: ' + cv.name)}>Đổi tên</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => alert('Xóa CV: ' + cv.name)}>Xóa</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* CV tải lên */}
                <div className='shadow-md p-6 rounded-md border'>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">CV tải lên từ máy tính</h2>
                        <Button variant="login" onClick={handleUploadCV}>Tải CV từ máy tính</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {uploadedCVList.map(cv => (
                            <div key={cv.id} className="border rounded p-4 flex flex-col items-center relative">
                                <img src={cv.img} alt={cv.name}
                                    onClick={previewCV}
                                    className="w-full h-[350px] object-cover rounded mb-2 cursor-pointer" />
                                <span className="font-semibold mb-1 cursor-pointer" onClick={previewCV}>{cv.name}</span>
                                <span className="text-xs text-gray-500 mb-2">Cập nhật: {cv.updatedAt}</span>
                                <div className="absolute bottom-5 right-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full shadow focus:outline-none">
                                            <i className="fa-solid fa-ellipsis"></i>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => alert('Tải về CV: ' + cv.name)}>Tải về</DropdownMenuItem>
                                            <DropdownMenuItem onClick={editCV}>Chỉnh sửa</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => alert('Đổi tên CV: ' + cv.name)}>Đổi tên</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => alert('Xóa CV: ' + cv.name)}>Xóa</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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

export default CVManager;
