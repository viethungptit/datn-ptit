import { useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { toast } from 'react-toastify';
import { uploadCV } from '@/api/recruitApi';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const UploadCV = () => {
    const [file, setFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleUpload = async () => {
        try {
            if (!file) {
                toast.error('Vui lòng chọn file trước khi tải lên!');
                return;
            }
            const fd = new FormData();
            fd.append('cv', file);
            await uploadCV(fd);
            toast.success('Tải CV lên thành công');
            navigate('/manage-cvs');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Tải CV lên thất bại";
            toast.error(msg);
        }
    };

    return (
        <div>
            <div className='flex flex-col justify-center items-start px-[100px] py-14' style={{ background: 'linear-gradient(to bottom, #ff9fb0 0%, #fff 100%)' }}>
                <div className="text-left mb-6">
                    <p className="text-2xl font-bold text-txt-red mb-2">Tải lên CV</p>
                    <p className="text-base text-gray-700">Bạn đã có sẵn CV của mình, chỉ cần tải CV lên, hệ thống sẽ tự động đề xuất CV của bạn tới những nhà tuyển dụng uy tín.</p>
                </div>
            </div>
            <div className='px-[100px] py-10 rounded-md flex flex-col items-center justify-center'>
                <h2 className="text-2xl font-semibold text-txt-red mb-4"></h2>

                <div
                    className="w-full max-w-xl h-64 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 mb-6"
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={handleClick}
                >
                    <input
                        type="file"
                        accept=".doc,.docx,.pdf"
                        ref={inputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <i className="fa-solid fa-cloud-arrow-up fa-2xl mb-4"></i>
                    <span className="text-lg text-gray-500 mb-2">
                        Kéo thả hoặc chọn file CV
                    </span>
                    <span className="text-sm text-gray-400">(Hỗ trợ .doc, .docx, .pdf)</span>
                    {file && (
                        <span className="mt-4 text-txt-red font-semibold">{file.name}</span>
                    )}
                </div>
                <Button variant="login" size="lg" className="w-full max-w-xl" onClick={handleUpload}>
                    Tải lên CV
                </Button>
            </div>
            <Footer/>
        </div>
    );
};

export default UploadCV;
