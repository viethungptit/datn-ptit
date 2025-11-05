import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../components/ui/dropdown-menu';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { deleteCV, exportCV, getCVMe, updateNameCV } from '@/api/recruitApi';
import { toast } from 'react-toastify';

export type CVItem = {
    cvId: string;
    title: string;
    createdAt: string;
    statusEmbedding: string;
};

const CVManager = () => {
    const [templateCVs, setTemplateCVs] = useState<CVItem[]>([]);
    const [uploadedCVList, setUploadedCVList] = useState<CVItem[]>([]);
    const navigate = useNavigate();

    const handlePrintClick = async (cvId: string) => {
        try {
            const res = await exportCV(cvId);
            const pdfUrl = res.data.fileUrl;
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
    const previewCV = (cvId: string) => navigate(`/preview-cvs/${cvId}`);

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
        <div className='flex flex-col gap-8'>
            <div className="px-[100px] py-8 flex flex-col gap-8">
                {/* CV theo mẫu */}
                <div className='shadow-md p-6 rounded-md border'>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">CV đã tạo theo mẫu</h2>
                        <Button variant="login" onClick={handleCreateCV}>Tạo CV theo mẫu</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
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
                                            className="font-semibold mb-2 line-clamp-2 cursor-pointer"
                                        >
                                            {cv.title}
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-500 mb-2">
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
                    <div className="grid grid-cols-4 gap-4">
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
                                            className="font-semibold mb-1 cursor-pointer"
                                        >
                                            {cv.title}
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-500 mb-2">
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
