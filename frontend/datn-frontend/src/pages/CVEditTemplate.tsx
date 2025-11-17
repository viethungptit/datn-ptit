import { useEffect, useRef, useState } from "react";
import "../styles/CVBuilder.css";
import ReactMarkdown from "react-markdown";
import MDEditor from "@uiw/react-md-editor";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { getTemplateDetail, getCV, updateCV } from "@/api/recruitApi";
import { suggestSectionCV } from "@/api/recommendApi";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import FilePickerDialog from '@/components/FilePicker/FilePickerDialog';
import { translateSection } from "@/utils/translateSection";
import { MINIO_ENDPOINT } from "@/api/serviceConfig";

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
    const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
    const [aiOptions, setAiOptions] = useState<Record<string, { style: string }>>({});
    const [aiSuggestions, setAiSuggestions] = useState<Record<string, { newText: string; originalText: string }>>({});

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

    const cleanMarkdown = (text?: string) => text?.replace(/\\/g, "") ?? "";

    const handleAISuggest = async (sectionId: SectionId) => {
        try {
            setAiLoading(prev => ({ ...prev, [sectionId]: true }));
            const opts = aiOptions[sectionId] || { style: 'professional' };
            const position = draftData.position || data.position || '';
            const payload = {
                language: themeJson?.language || 'vi',
                position,
                section: sectionId,
                content: draftData[sectionId] || '',
                styles: opts.style,
            };

            const res = await suggestSectionCV(payload);
            const suggestion = res?.data?.data || res?.data?.suggestion || res?.data?.content || res?.data || '';
            let suggestionText = suggestion?.suggested || suggestion?.text || suggestion || '';
            if (!suggestionText) {
                toast.error('Không nhận được gợi ý từ AI');
            } else {
                const original = draftData[sectionId] || '';
                const combined = original ? `~~${original}~~\n\n${suggestionText}` : suggestionText;
                setAiSuggestions(prev => ({ ...prev, [sectionId]: { newText: suggestionText, originalText: original } }));
                handleChange(sectionId, combined);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Gợi ý thất bại';
            toast.error('Lỗi hệ thống khi gợi ý AI. Vui lòng thử lại sau.');
            console.error('AI suggest failed', msg);
        } finally {
            setAiLoading(prev => ({ ...prev, [sectionId]: false }));
        }
    };

    const acceptSuggestion = (sectionId: SectionId) => {
        const sug = aiSuggestions[sectionId];
        if (!sug) return;
        handleChange(sectionId, sug.newText);
        setData(prev => ({ ...prev, [sectionId]: sug.newText }));
        setAiSuggestions(prev => {
            const copy = { ...prev } as any;
            delete copy[sectionId];
            return copy;
        });
    };

    const declineSuggestion = (sectionId: SectionId) => {
        const sug = aiSuggestions[sectionId];
        if (sug) {
            handleChange(sectionId, sug.originalText || '');
        }
        setAiSuggestions(prev => {
            const copy = { ...prev } as any;
            delete copy[sectionId];
            return copy;
        });
    };

    const handleSelectFile = (fileUrl: string) => {
        // set as plain URL so renderSection will show it
        setDraftData(prev => ({ ...prev, avatar: fileUrl }));
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
                                    <FilePickerDialog onSelect={handleSelectFile} trigger={<Button>Chọn ảnh</Button>} contentClassName="max-w-2xl" />
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    {draftData[key as SectionId] ? (
                                        // preview
                                        <img src={draftData[key as SectionId] === "/avatar-init.jpg" ? "/avatar-init.jpg" : `${MINIO_ENDPOINT}/datn/${draftData[key as SectionId]}`} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
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
                                    previewOptions={{}}
                                    preview={((draftData[key as SectionId] || "").includes('~~')) ? 'live' : 'edit'}
                                />
                            </div>

                            {/* AI Suggestion controls - only for certain sections */}
                            {['summary', 'experience', 'projects', 'education', 'skills', 'certificates'].includes(key as SectionId) && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm">Phong cách</label>
                                        <select
                                            className="border rounded px-2 py-1 text-sm"
                                            value={aiOptions[key as SectionId]?.style || 'professional'}
                                            onChange={(e) => setAiOptions(prev => ({ ...prev, [key as SectionId]: { ...(prev[key as SectionId] || { style: 'professional' }), style: e.target.value } }))}
                                        >
                                            <option value="professional">Chuyên nghiệp</option>
                                            <option value="concise">Ngắn gọn</option>
                                            <option value="impact">Ấn tượng</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Button
                                            variant="login"
                                            onClick={() => handleAISuggest(key as SectionId)}
                                            disabled={!!aiLoading[key as SectionId]}
                                        >
                                            {aiLoading[key as SectionId] ? 'Đang gợi ý...' : 'Gợi ý bằng AI'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {aiSuggestions[key as SectionId] && (
                                <div className="mt-3 flex items-center gap-2">
                                    <Button onClick={() => acceptSuggestion(key as SectionId)}>Chấp nhận</Button>
                                    <Button variant="destructive" onClick={() => declineSuggestion(key as SectionId)}>Từ chối</Button>
                                </div>
                            )}
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
                        src={imgSrc === "/avatar-init.jpg" ? "/avatar-init.jpg" : `${MINIO_ENDPOINT}/datn/${imgSrc}`}
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
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanMarkdown(rawContent)}</ReactMarkdown>
                    </span>
                </div>
            );
        }
        if (sectionId === "position") {
            return (
                <div key={sectionId} className="cv-section" style={{ textAlign: themeJson?.alignTextPosition, marginBottom: 12 }}>
                    <span style={{ fontWeight: 600, fontSize: themeJson?.sizePosition, color: themeJson?.colorPosition }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanMarkdown(rawContent)}</ReactMarkdown>
                    </span>
                </div>
            );
        }
        if (sectionId === "summary") {
            return (
                <div key={sectionId} className="cv-section" style={{ marginBottom: 16 }}>
                    <div className="cv-section-content" style={{ color: themeJson?.color, fontSize: themeJson?.size, wordBreak: 'break-word', textAlign: 'left' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanMarkdown(rawContent)}</ReactMarkdown>
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
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanMarkdown(rawContent)}</ReactMarkdown>
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
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanMarkdown(rawContent)}</ReactMarkdown>
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

            {/* File picker is provided by FilePickerDialog which is triggered next to the avatar input */}

        </div>
    );
}
