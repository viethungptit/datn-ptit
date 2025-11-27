import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../components/ui/dropdown-menu';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { deleteCV, exportCV, getCVMe, updateNameCV, retryEmbeddingCV } from '@/api/recruitApi';
import { toast } from 'react-toastify';
import { MINIO_ENDPOINT } from '@/api/serviceConfig';

export type CVItem = {
    cvId: string;
    title: string;
    createdAt: string;
    statusEmbedding: string;
};

const STATUS_EMBEDDING = [
    { value: "pending", label: "Đang chờ" },
    { value: "embedded", label: "Hoàn tất" },
    { value: "failed", label: "Thất bại" },
];

const STATUS_EMBEDDING_MAP = Object.fromEntries(
    STATUS_EMBEDDING.map(item => [item.value, item.label])
);

const CVManager = () => {
    const [templateCVs, setTemplateCVs] = useState<CVItem[]>([]);
    const [uploadedCVList, setUploadedCVList] = useState<CVItem[]>([]);
    const [retryingEmbeddingsCV, setRetryingEmbeddingsCV] = useState<string[]>([]);
    const navigate = useNavigate();

    const handlePrintClick = async (cvId: string) => {
        try {
            const res = await exportCV(cvId);
            const pdfUrl = MINIO_ENDPOINT + "/datn/" + res.data.fileUrl;
            if (pdfUrl) {
                window.open(pdfUrl, "_blank");
            } else {
                console.error("Không tìm thấy link PDF trong response:", res);
            }
        } catch (error) {
            console.error("Error exporting CV:", error);
        }
    };

    const fetchTemplateCVs = async () => {
        const res = await getCVMe('system');
        setTemplateCVs(res.data);
    };

    const fetchUploadedCVs = async () => {
        const res = await getCVMe('upload');
        setUploadedCVList(res.data);
    };

    const handleCreateCV = () => navigate("/cv-templates");
    const handleUploadCV = () => navigate("/upload-cv");
    const editCV = (cvId: string) => navigate(`/manage-cvs/${cvId}`);

    const previewCV = (cvId: string) => {
        const url = `/preview-cvs/${cvId}`;
        window.open(url, '_blank');
    };

    // state for inline renaming
    const [editing, setEditing] = useState<null | { cvId: string; value: string; listType: 'template' | 'uploaded' }>(null);

    const renameCV = async (cvId: string, newName: string) => {
        try {
            await updateNameCV(cvId, newName);
            toast.success("Đổi tên CV thành công");
        } catch (error) {
            toast.error("Đổi tên CV thất bại");
            console.error("Error renaming CV:", error);
            throw error;
        }
    }

    const deleteCVs = async (cvId: string, listType: 'template' | 'uploaded') => {
        try {
            await deleteCV(cvId);
            toast.success("Xóa CV thành công");
            if (listType === 'template') {
                setTemplateCVs(prev => prev.filter(cv => cv.cvId !== cvId));
            } else {
                setUploadedCVList(prev => prev.filter(cv => cv.cvId !== cvId));
            }
        } catch (error) {
            toast.error("Xóa CV thất bại");
            console.error("Error deleting CV:", error);
            throw error;
        }
    }

    const handleRetryEmbeddingCV = async (cvId: string) => {
        try {
            setRetryingEmbeddingsCV(prev => Array.from(new Set([...prev, cvId])));
            const res = await retryEmbeddingCV(cvId);
            const updated = res?.data;
            if (updated) {
                setTemplateCVs(prev => prev.map(cv => cv.cvId === cvId ? { ...cv, ...updated } : cv));
                setUploadedCVList(prev => prev.map(cv => cv.cvId === cvId ? { ...cv, ...updated } : cv));
            }
            toast.success('Khởi chạy lại embedding CV thành công');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Khởi chạy lại embedding CV thất bại';
            toast.error(msg);
        } finally {
            setRetryingEmbeddingsCV(prev => prev.filter(id => id !== cvId));
        }
    }

    const startEditing = (cvId: string, currentTitle: string, listType: 'template' | 'uploaded') => {
        setEditing({ cvId, value: currentTitle, listType });
    };

    const cancelEditing = () => setEditing(null);

    const saveEditing = async () => {
        if (!editing) return;
        const { cvId, value, listType } = editing;
        const trimmed = value.trim();
        if (!trimmed) return;
        try {
            await renameCV(cvId, trimmed);

            if (listType === 'template') {
                setTemplateCVs(prev => prev.map(cv => cv.cvId === cvId ? { ...cv, title: trimmed } : cv));
            } else {
                setUploadedCVList(prev => prev.map(cv => cv.cvId === cvId ? { ...cv, title: trimmed } : cv));
            }

            setEditing(null);
        } catch (err) {
            console.error('Failed to save new name', err);
        }
    };

    useEffect(() => {
        fetchTemplateCVs();
        fetchUploadedCVs();
    }, []);

    return (
        <div className="flex flex-col gap-8">
            <div className='flex justify-center flex-col py-14' style={{ background: 'linear-gradient(to bottom, #ff9fb0 0%, #fff 100%)' }}>
                <p className="text-2xl font-bold text-txt-red mb-2">CV của bạn</p>
                <p className="text-base text-gray-700">Hãy chuẩn bị một CV thật ấn tượng để chinh phục nhà tuyển dụng</p>
            </div>
            <div className="px-[100px] pb-20 flex flex-col gap-8">
                {/* CV theo mẫu */}
                <div className='shadow-md p-6 rounded-md border'>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">CV đã tạo theo mẫu</h2>
                        <Button variant="login" onClick={handleCreateCV}>Tạo CV theo mẫu</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-4 overflow-y-auto max-h-[600px]">
                        {templateCVs.length === 0 ? (
                            <p className='text-left'>Chưa có CV nào</p>
                        ) : (
                            templateCVs.map(cv => (
                                <div key={cv.cvId} className="border rounded p-4 flex flex-col items-center relative">
                                    <div className="h-32 flex items-center justify-center">
                                        <i className="fa-solid fa-file fa-5x text-btn-red"></i>
                                    </div>
                                    {editing && editing.cvId === cv.cvId && editing.listType === 'template' ? (
                                        <div className="w-full flex flex-col items-start gap-2">
                                            <input
                                                className="w-full border rounded px-2 py-1"
                                                value={editing.value}
                                                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEditing();
                                                    if (e.key === 'Escape') cancelEditing();
                                                }}
                                                autoFocus
                                            />
                                            <div className="flex gap-2 py-2">
                                                <Button variant="login" onClick={saveEditing}>Lưu</Button>
                                                <Button onClick={cancelEditing}>Hủy</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <span
                                            className="font-semibold mb-3 line-clamp-2 max-w-[300px] cursor-pointer"
                                        >
                                            {cv.title}
                                        </span>
                                    )}
                                    <span className="text-sm text-gray-900 mb-1">
                                        Trạng thái phân tích: {STATUS_EMBEDDING_MAP[cv.statusEmbedding || ''] || ''}
                                    </span>
                                    <span className="text-sm text-gray-900 mb-1">
                                        Ngày tạo: {cv.createdAt ? new Date(cv.createdAt).toLocaleDateString('vi-VN') : ''}
                                    </span>

                                    <div className="absolute bottom-5 right-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="w-10 h-10 flex items-center justify-center border bg-gray-100 hover:bg-gray-200 rounded-full shadow focus:outline-none">
                                                <i className="fa-solid fa-ellipsis"></i>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => previewCV(cv.cvId)}>Xem trước</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => editCV(cv.cvId)}>Chỉnh sửa</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => startEditing(cv.cvId, cv.title, 'template')}>Đổi tên</DropdownMenuItem>
                                                {cv.statusEmbedding === 'failed' && (
                                                    <DropdownMenuItem onClick={() => handleRetryEmbeddingCV(cv.cvId)}>
                                                        {retryingEmbeddingsCV.includes(cv.cvId) ? (
                                                            <span className="flex items-center gap-2"><i className="fa-solid fa-arrows-rotate animate-spin"></i>Đang thử lại</span>
                                                        ) : (
                                                            'Phân tích lại'
                                                        )}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => deleteCVs(cv.cvId, 'template')}>Xóa CV</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                {/* CV tải lên */}
                <div className='shadow-md p-6 rounded-md border'>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">CV tải lên từ máy tính</h2>
                        <Button variant="login" onClick={handleUploadCV}>Tải CV từ máy tính</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-4 overflow-y-auto max-h-[600px]">
                        {uploadedCVList.length === 0 ? (
                            <p className='text-left'>Chưa có CV nào</p>
                        ) : (
                            uploadedCVList.map(cv => (
                                <div key={cv.cvId} className="border rounded p-4 flex flex-col items-center relative">
                                    <div className="h-32 flex items-center justify-center">
                                        <i className="fa-solid fa-folder-open fa-5x text-btn-red"></i>
                                    </div>
                                    {editing && editing.cvId === cv.cvId && editing.listType === 'uploaded' ? (
                                        <div className="w-full flex flex-col items-start gap-2">
                                            <input
                                                className="w-full border rounded px-2 py-1"
                                                value={editing.value}
                                                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEditing();
                                                    if (e.key === 'Escape') cancelEditing();
                                                }}
                                                autoFocus
                                            />
                                            <div className="flex gap-2 py-2">
                                                <Button variant="login" onClick={saveEditing}>Lưu</Button>
                                                <Button onClick={cancelEditing}>Hủy</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <span
                                            className="font-semibold line-clamp-2 max-w-[300px] mb-3 cursor-pointer"
                                        >
                                            {cv.title}
                                        </span>
                                    )}
                                    <span className="text-sm text-gray-900 mb-1">
                                        Trạng thái phân tích: {STATUS_EMBEDDING_MAP[cv.statusEmbedding || ''] || ''}
                                    </span>
                                    <span className="text-sm text-gray-900 mb-1">
                                        Ngày tạo: {cv.createdAt ? new Date(cv.createdAt).toLocaleDateString('vi-VN') : ''}
                                    </span>

                                    <div className="absolute bottom-5 right-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full shadow focus:outline-none">
                                                <i className="fa-solid fa-ellipsis"></i>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handlePrintClick(cv.cvId)}>Xem trước</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => startEditing(cv.cvId, cv.title, 'uploaded')}>Đổi tên</DropdownMenuItem>
                                                {cv.statusEmbedding === 'failed' && (
                                                    <DropdownMenuItem onClick={() => handleRetryEmbeddingCV(cv.cvId)}>
                                                        {retryingEmbeddingsCV.includes(cv.cvId) ? (
                                                            <span className="flex items-center gap-2"><i className="fa-solid fa-arrows-rotate animate-spin"></i>Đang thử lại</span>
                                                        ) : (
                                                            'Phân tích lại'
                                                        )}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => deleteCVs(cv.cvId, 'uploaded')}>Xóa</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CVManager;
