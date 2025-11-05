import { useEffect, useRef, useState } from "react";
import "../styles/CVBuilder.css";
import ReactMarkdown from "react-markdown";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { getTemplateDetail, getCV, updateCV } from "@/api/recruitApi";
import { getAllFilesByMeApi, uploadFileApi, deleteFileApi } from "@/api/userApi";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";
import { translateSection } from "@/utils/translateSection";

type SectionId =
    | "avatar"
    | "name"
    | "position"
    | "summary"
    | "personal_info"
    | "skills"
    | "certificates"
    | "experience"
    | "projects"
    | "education";

interface Column {
    id: string;
    colSpan?: number;
    sections: SectionId[];
}

interface Row {
    id: string;
    colSpan: number;
    columns: Column[];
}

interface LayoutJson {
    layout: {
        columns: number;
        rows: Row[];
    };
}

interface ThemeJson {
    color: string; // màu chính của CV
    size: number; // size chữ chính của CV
    colorTitle: string; // màu của các title như Experience, Skill
    sizeTitle: number; // size chữ của các title
    colorName: string; // màu của tên CV
    sizeName: number; // size chữ của tên CV
    colorPosition: string; // màu của tên vị trí
    sizePosition: number; // size chữ của tên vị trí
    alignTextTitle: "left" | "center" | "right"; // vị trí căn lề của các title
    alignTextName: "left" | "center" | "right"; // vị trí căn lề của tên
    alignTextPosition: "left" | "center" | "right"; // vị trí căn lề của tên vị trí
    borderRadiusAvatar: number; // bo góc cho avatar
    sizeAvatar: number; // kích thước của avatar
    language: "vi" | "en"; // ngôn ngữ của CV
}

type DataJson = Record<SectionId, string>;


// ================== COMPONENT ==================
export default function CVEditTemplate() {
    const { cvId } = useParams();
    const navigate = useNavigate();
    const [draftData, setDraftData] = useState<DataJson>({} as DataJson);
    const previewRef = useRef<HTMLDivElement | null>(null);
    const [data, setData] = useState<DataJson>({} as DataJson);
    const [themeJson, setThemeJson] = useState<ThemeJson>();
    const [layoutJson, setLayoutJson] = useState<LayoutJson>();
    const [title, setTitle] = useState<string>("");
    const [templateId, setTemplateId] = useState<string>("");
    const [showFileModal, setShowFileModal] = useState(false);
    const [files, setFiles] = useState<Array<any>>([]);
    const [uploading, setUploading] = useState(false);

    const fetchData = async () => {
        if (!cvId) return;
        try {
            const res1 = await getCV(cvId);
            const parsedData = res1.data.dataJson;
            setData(parsedData);
            setDraftData(parsedData);
            setTitle(res1.data.title || "");
            setTemplateId(res1.data.templateId);
            if (res1.data.templateId) {
                const res2 = await getTemplateDetail(res1.data.templateId);
                setThemeJson(JSON.parse(res2.data.themeJson));
                setLayoutJson(JSON.parse(res2.data.layoutJson));
            }
        } catch (err) {
            console.error("Failed to fetch CV or template:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [cvId]);

    const handleChange = (key: SectionId, value: string) => {
        setDraftData(prev => ({ ...prev, [key]: value }));
    };

    const fetchFiles = async () => {
        try {
            const res = await getAllFilesByMeApi();
            const data = res.data || res.data?.data || [];
            // Try to handle possible shapes
            const list = Array.isArray(data) ? data : (res.data?.data || []);
            setFiles(list);
        } catch (err) {
            console.error('Failed to fetch files', err);
            toast.error('Không thể lấy danh sách ảnh');
        }
    };

    const handleUploadFile = async (file: File | null) => {
        if (!file) return;
        try {
            setUploading(true);
            const form = new FormData();
            // API expects the file field name to be 'file'
            form.append('file', file);
            const res = await uploadFileApi(form);
            toast.success('Tải ảnh lên thành công');
            await fetchFiles();
            return res;
        } catch (err: any) {
            console.error('Upload failed', err);
            const msg = err?.response?.data?.message || err?.message || 'Tải lên thất bại';
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (fileId: string) => {
        try {
            await deleteFileApi(fileId);
            toast.success('Xóa ảnh thành công');
            await fetchFiles();
        } catch (err: any) {
            console.error('Delete failed', err);
            const msg = err?.response?.data?.message || err?.message || 'Xóa thất bại';
            toast.error(msg);
        }
    };

    const handleSelectFile = (fileUrl: string) => {
        // set as plain URL so renderSection will show it
        setDraftData(prev => ({ ...prev, avatar: fileUrl }));
        setShowFileModal(false);
    };

    const handleTitleChange = (value: string) => {
        setTitle(value);
    }

    const labelFor = (sec: SectionId) => {
        const lang = (themeJson?.language as string) || 'vi';
        const SECTION_LABELS: Record<string, Record<SectionId, string>> = {
            vi: {
                avatar: 'ẢNH',
                name: 'HỌ VÀ TÊN',
                position: 'VỊ TRÍ',
                summary: 'TÓM TẮT',
                personal_info: 'THÔNG TIN CÁ NHÂN',
                skills: 'KỸ NĂNG',
                certificates: 'CHỨNG CHỈ',
                experience: 'KINH NGHIỆM',
                projects: 'DỰ ÁN',
                education: 'HỌC VẤN',
            },
            en: {
                avatar: 'AVATAR',
                name: 'NAME',
                position: 'POSITION',
                summary: 'SUMMARY',
                personal_info: 'PERSONAL INFO',
                skills: 'SKILLS',
                certificates: 'CERTIFICATES',
                experience: 'EXPERIENCE',
                projects: 'PROJECTS',
                education: 'EDUCATION',
            }
        };
        return SECTION_LABELS[lang]?.[sec] || sec.toUpperCase();
    };

    const renderInputs = () => {
        return (
            <div className="form-group">
                {Object.keys(draftData).map((key) => {
                    if (key === 'avatar') {
                        return (
                            <div key={key} style={{ marginBottom: 16 }}>
                                <label className="form-label text-left" htmlFor={key}>{translateSection(key as SectionId)}</label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id={key}
                                        placeholder="URL ảnh hoặc để trống"
                                        value={draftData[key as SectionId] || ''}
                                        onChange={e => handleChange(key as SectionId, e.target.value)}
                                        className="w-full"
                                    />
                                    <Button onClick={() => { setShowFileModal(true); fetchFiles(); }}>Chọn ảnh</Button>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    {draftData[key as SectionId] ? (
                                        // preview
                                        <img src={draftData[key as SectionId]} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
                                    ) : (
                                        <div style={{ width: 120, height: 120, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chưa có ảnh</div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={key} style={{ marginBottom: 16 }}>
                            <label className="form-label text-left" htmlFor={key}>{translateSection(key as SectionId)}</label>
                            <div data-color-mode="light">
                                <MDEditor
                                    value={draftData[key as SectionId]}
                                    onChange={val => handleChange(key as SectionId, val || "")}
                                    height={150}
                                    previewOptions={{}} // Tắt live preview
                                    preview="edit"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderSection = (sectionId: SectionId) => {
        const rawContent = data[sectionId] || "";
        if (sectionId === "avatar") {
            // Nếu là markdown image thì lấy src, nếu là url thì dùng luôn
            let imgSrc = rawContent;
            const match = rawContent.match(/!\[.*?\]\((.*?)\)/);
            if (match) imgSrc = match[1];
            return (
                <div key={sectionId} className="cv-section" style={{ marginBottom: 16 }}>
                    <img
                        src={imgSrc}
                        alt="avatar"
                        style={{ width: themeJson?.sizeAvatar, height: themeJson?.sizeAvatar, objectFit: 'cover', borderRadius: themeJson?.borderRadiusAvatar, boxShadow: '0 2px 8px #ccc' }}
                    />
                </div>
            );
        }
        if (sectionId === "name") {
            return (
                <div key={sectionId} className="cv-section" style={{ textAlign: themeJson?.alignTextName, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: themeJson?.sizeName, letterSpacing: 1, color: themeJson?.colorName }}>
                        <ReactMarkdown>{rawContent}</ReactMarkdown>
                    </span>
                </div>
            );
        }
        if (sectionId === "position") {
            return (
                <div key={sectionId} className="cv-section" style={{ textAlign: themeJson?.alignTextPosition, marginBottom: 12 }}>
                    <span style={{ fontWeight: 600, fontSize: themeJson?.sizePosition, color: themeJson?.colorPosition }}>
                        <ReactMarkdown>{rawContent}</ReactMarkdown>
                    </span>
                </div>
            );
        }
        if (sectionId === "summary") {
            return (
                <div key={sectionId} className="cv-section" style={{ marginBottom: 16 }}>
                    <div className="cv-section-content" style={{ color: themeJson?.color, fontSize: themeJson?.size, wordBreak: 'break-word', textAlign: 'left' }}>
                        <ReactMarkdown>{rawContent}</ReactMarkdown>
                    </div>
                </div>
            );
        }
        if (sectionId === "personal_info") {
            return (
                <div key={sectionId} className="cv-section">
                    <h3
                        className="cv-section-title"
                        style={{ color: themeJson?.colorTitle, textAlign: themeJson?.alignTextTitle, fontSize: themeJson?.sizeTitle }}
                    >
                        {labelFor('personal_info')}
                    </h3>
                    <div className="cv-section-content" style={{ color: themeJson?.color, fontSize: themeJson?.size, wordBreak: 'break-word' }}>
                        <ReactMarkdown>{rawContent}</ReactMarkdown>
                    </div>
                </div>
            )
        }
        // Các mục còn lại giữ nguyên
        return (
            <div key={sectionId} className="cv-section">
                <h3
                    className="cv-section-title"
                    style={{ color: themeJson?.colorTitle, textAlign: themeJson?.alignTextTitle, fontSize: themeJson?.sizeTitle }}
                >
                    {labelFor(sectionId as SectionId)}
                </h3>
                <div className="cv-section-content" style={{ color: themeJson?.color, fontSize: themeJson?.size, wordBreak: 'break-word' }}>
                    <ReactMarkdown>{rawContent}</ReactMarkdown>
                </div>
            </div>
        );
    };

    const renderPreview = () => {
        return layoutJson?.layout?.rows.map(row => {
            // Tính tổng colSpan của các column trong row
            const totalColSpan = row.columns.reduce((sum, col) => sum + (col.colSpan || 1), 0);
            return (
                <div
                    key={row.id}
                    className="cv-row"
                    style={{ display: 'grid', gridTemplateColumns: `repeat(${totalColSpan}, 1fr)` }}
                >
                    {row.columns.map(col => (
                        <div
                            key={col.id}
                            className="cv-col text-left"
                            style={{ gridColumn: `span ${col.colSpan || 1}` }}
                        >
                            {col.sections.map(sec => renderSection(sec))}
                        </div>
                    ))}
                </div>
            );
        });
    };

    const handleExportCV = () => {
        setData(draftData);
    };

    const handleBack = () => {
        navigate("/manage-cvs");
    };

    const handleCreateCV = async (isNavigate: boolean) => {
        try {
            if (!title) {
                toast.error('Vui lòng nhập tên CV');
                return;
            }
            if (!cvId) {
                toast.error('Id CV không hợp lệ');
                return;
            }
            await new Promise<void>((resolve) => {
                setData(draftData);
                setTimeout(() => resolve(), 200);
            });

            const form = new FormData();
            form.append('title', title || '');
            form.append('dataJson', JSON.stringify(draftData || {}));
            form.append('templateId', templateId || '');
            await updateCV(cvId, form);
            if (isNavigate) {
                navigate("/manage-cvs");
                toast.success('Lưu CV thành công');
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Lưu CV thất bại';
            toast.error(msg);
            console.error('Failed to create CV', err);
        }
    }

    return (
        <div className="cv-builder px-[100px]">
            <div className="cv-left">
                <div className="flex flex-col justify-between">
                    <h2 className="font-bold text-left mb-2">Nhập thông tin CV</h2>
                    <Input placeholder="Tên CV" className="w-full max-w-lg mb-2" value={title} onChange={e => handleTitleChange(e.target.value)} />
                    <div className="flex justify-between pb-5">
                        <Button onClick={handleBack}>Hủy</Button>
                        <Button onClick={handleExportCV}>Xem trước</Button>
                        <Button variant="login" onClick={() => handleCreateCV(true)}>Lưu</Button>
                    </div>
                </div>
                {renderInputs()}
            </div>
            <div
                className="cv-right"
                ref={previewRef}
            >
                {renderPreview()}
            </div>

            <Dialog open={showFileModal} onOpenChange={setShowFileModal}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Chọn ảnh từ hệ thống</DialogTitle>
                        <DialogDescription>
                            Chọn một ảnh có sẵn hoặc tải ảnh mới lên.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mb-4">
                        <label className="block mb-2 font-medium">Tải ảnh lên</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadFile(e.target.files?.[0] || null)}
                            disabled={uploading}
                            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                                                   file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                                                   file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 
                                                   cursor-pointer"
                        />
                        {uploading && (
                            <p className="mt-2 text-sm text-blue-600 animate-pulse">Đang tải...</p>
                        )}
                    </div>

                    {/* File List Section */}
                    <div>
                        <h4 className="text-lg font-semibold mb-3">Ảnh của bạn</h4>

                        {files && files.length > 0 ? (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                                {files.map((f: any) => (
                                    <div
                                        key={f.fileId || f.id || f.fileName}
                                        className="border rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <img
                                            src={`${MINIO_ENDPOINT}/datn/${f.fileUrl}`}
                                            alt={f.fileName}
                                            className="w-full h-[200px] object-cover rounded-md mb-2"
                                        />
                                        <h4
                                            className="text-sm line-clamp-3 break-words leading-snug"
                                            title={f.fileName}
                                        >
                                            {f.fileName}
                                        </h4>
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                variant="default"
                                                className="flex-1"
                                                onClick={() => handleSelectFile(`${MINIO_ENDPOINT}/datn/${f.fileUrl}`)}
                                            >
                                                Chọn
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="flex-1"
                                                onClick={() => handleDeleteFile(f.fileId)}
                                            >
                                                Xóa
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm text-center py-6 border rounded-lg">
                                Chưa có ảnh. Vui lòng tải lên.
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button variant="outline">Đóng</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
