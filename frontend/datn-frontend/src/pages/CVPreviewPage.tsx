import { useEffect, useRef, useState } from "react";
import "../styles/CVPreviewPage.css";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { getTemplateDetail, getCV } from "@/api/recruitApi";

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

export default function CVPreviewPage() {
    const { cvId } = useParams();
    const navigate = useNavigate();
    const previewRef = useRef<HTMLDivElement | null>(null);
    const [data, setData] = useState<DataJson>({} as DataJson);
    const [themeJson, setThemeJson] = useState<ThemeJson>();
    const [layoutJson, setLayoutJson] = useState<LayoutJson>();
    const [title, setTitle] = useState<string>("");

    const fetchData = async () => {
        if (!cvId) return;
        try {
            const res1 = await getCV(cvId);
            const parsedData = res1.data.dataJson;
            setData(parsedData);
            setTitle(res1.data.title || "");
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
        };

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

    const handleBack = () => {
        navigate("/manage-cvs");
    };

    const handleEditCV = (cvId: string) => {
        navigate(`/manage-cvs/${cvId}`);
    }

    const handleDownloadCV = async () => {
        setTimeout(() => {
            if (previewRef.current) {
                window.print();
            }
        }, 200);
    }

    return (
        <div className="flex flex-col items-center pb-10" style={{ backgroundImage: 'url(/background-preview.jpg)', backgroundSize: 'cover', minHeight: '100vh' }}>
            <div className="nav w-full bg-white sticky top-0 z-10 mb-10">
                <div className="flex justify-between items-center py-2 px-20">
                    <h3>{title}</h3>
                    <div className="flex gap-3">
                        <Button className="bg-white" onClick={handleBack}>Hủy</Button>
                        <Button variant="login" onClick={() => handleEditCV(cvId || '')}>Sửa CV</Button>
                        <Button variant="login" onClick={handleDownloadCV}>Tải CV PDF</Button>
                    </div>
                </div>
            </div>
            <div
                className="cv-content w-[58%] bg-white p-20"
                ref={previewRef}
            >
                {renderPreview()}
            </div>
        </div>
    );
}
