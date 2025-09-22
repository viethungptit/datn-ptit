import { useRef, useState } from 'react';
import { Button } from '../components/ui/button';

const UploadCV = () => {
    const [file, setFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

    const handleUpload = () => {
        if (!file) {
            alert('Vui lòng chọn file trước khi tải lên!');
            return;
        }
        // Logic upload file
        alert('Đã tải lên file: ' + file.name);
    };

    return (
        <div className="py-6 px-[100px]">
            <div className='p-6 shadow-md border rounded-md flex flex-col items-center justify-center min-h-[70vh]'>
                <h2 className="text-2xl font-semibold text-txt-red mb-4">Tải lên CV</h2>
                <span className='mb-4'>Bạn đã có sẵn CV của mình, chỉ cần tải CV lên, hệ thống sẽ tự động đề xuất CV của bạn tới những nhà tuyển dụng uy tín.
                    <br />  Tiết kiệm thời gian, tìm việc thông minh, nắm bắt cơ hội và làm chủ đường đua nghề nghiệp của chính mình.</span>
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
                    <span className="text-xl text-gray-500 mb-2">
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
        </div>
    );
};

export default UploadCV;
