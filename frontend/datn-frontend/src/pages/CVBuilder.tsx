import { useState } from "react";
import "../styles/CVBuilder.css";
import ReactMarkdown from "react-markdown";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";

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
}

type DataJson = Record<SectionId, string>;

// ================== SAMPLE JSON ==================
const layout_json: LayoutJson =
{
    layout: {
        columns: 3,
        rows: [
            {
                id: "header",
                colSpan: 3,
                columns: [
                    { id: "avatar_col", colSpan: 1, sections: ["avatar"] },
                    { id: "info_col", colSpan: 2, sections: ["name", "position", "summary"] }
                ]
            },
            {
                id: "main_info",
                colSpan: 3,
                columns: [
                    { id: "col1", colSpan: 1, sections: ["education", "personal_info", "skills", "certificates"] },
                    { id: "col2", colSpan: 2, sections: ["experience", "projects"] },
                ]
            }
        ]
    }
};

const theme_json: ThemeJson = {
    color: "#333",
    size: 13,
    colorTitle: "#1976d2",
    sizeTitle: 16,
    colorName: "#1976d2",
    sizeName: 24,
    colorPosition: "#1976d2",
    sizePosition: 18,
    alignTextTitle: "left",
    alignTextName: "center",
    alignTextPosition: "center",
    borderRadiusAvatar: 100,
    sizeAvatar: 150
};

const initialData: DataJson = {
    avatar: "![image](https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg)",
    name: "Nguyễn Văn A",
    position: "Fullstack Developer",
    summary: "Lập trình viên với hơn 3 năm kinh nghiệm trong phát triển ứng dụng web. Thành thạo Node.js, React, và cơ sở dữ liệu SQL/NoSQL. Đam mê xây dựng sản phẩm tối ưu hiệu suất và trải nghiệm người dùng.",
    personal_info: `
- Email: nguyenvana@example.com
- Số điện thoại: 0987 654 321
- Địa chỉ: 123 Lê Lợi, Hà Nội
- LinkedIn: linkedin.com/in/nguyenvana
- GitHub: github.com/nguyenvana
  `,
    skills: `
- Frontend: React, Redux, HTML5, CSS3, TailwindCSS
- Backend: Node.js, Express.js, NestJS
- Database: MySQL, MongoDB, PostgreSQL
- DevOps: Docker, CI/CD, GitHub Actions
- Ngôn ngữ: JavaScript, TypeScript, Python
  `,
    certificates: `
- AWS Certified Cloud Practitioner – 2023
- Google Professional Cloud Developer – 2022
- TOEIC 850 – 2021
  `,
    experience: `
**Fullstack Developer – Công ty ABC (2022 – nay)**
- Thiết kế và phát triển hệ thống quản lý khách hàng (CRM).
- Triển khai API RESTful và GraphQL.
- Tối ưu hiệu suất ứng dụng, giảm 30% thời gian tải trang.

**Backend Developer – Công ty XYZ (2020 – 2022)**
- Xây dựng hệ thống quản lý đơn hàng cho eCommerce.
- Viết test tự động với Jest và Mocha.
- Tham gia thiết kế kiến trúc microservices.
  `,
    projects: `
**Hệ thống Chatbot hỗ trợ khách hàng**
- Công nghệ: Node.js, React, MongoDB
- Vai trò: Leader – phân công công việc, review code, triển khai Docker.
- Kết quả: Giảm 40% thời gian phản hồi khách hàng.

**Website thương mại điện tử**
- Công nghệ: ReactJS, NestJS, PostgreSQL
- Vai trò: Fullstack Developer
- Kết quả: Hỗ trợ 5000+ người dùng hoạt động hàng ngày.
  `,
    education: `
**Đại học Bách Khoa Hà Nội (2016 – 2020)**
- Chuyên ngành: Công nghệ thông tin
- GPA: 3.45/4
  `
};


// ================== COMPONENT ==================
export default function CVBuilder() {
    const [data, setData] = useState<DataJson>(initialData);

    const handleChange = (key: SectionId, value: string) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const renderInputs = () => {
        return (
            <div className="form-group">
                {Object.keys(data).map((key) => (
                    <div key={key} style={{ marginBottom: 16 }}>
                        <label className="form-label text-left" htmlFor={key}>{key.toUpperCase()}</label>
                        <div data-color-mode="light">
                            <MDEditor
                                value={data[key as SectionId]}
                                onChange={val => handleChange(key as SectionId, val || "")}
                                height={150}
                                previewOptions={{}} // Tắt live preview
                                preview="edit"
                            />
                        </div>
                    </div>
                ))}
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
                        style={{ width: theme_json.sizeAvatar, height: theme_json.sizeAvatar, objectFit: 'cover', borderRadius: theme_json.borderRadiusAvatar, boxShadow: '0 2px 8px #ccc' }}
                    />
                </div>
            );
        }
        if (sectionId === "name") {
            return (
                <div key={sectionId} className="cv-section" style={{ textAlign: theme_json.alignTextName, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: theme_json.sizeName, letterSpacing: 1, color: theme_json.colorName }}>
                        <ReactMarkdown>{rawContent}</ReactMarkdown>
                    </span>
                </div>
            );
        }
        if (sectionId === "position") {
            return (
                <div key={sectionId} className="cv-section" style={{ textAlign: theme_json.alignTextPosition, marginBottom: 12 }}>
                    <span style={{ fontWeight: 600, fontSize: theme_json.sizePosition, color: theme_json.colorPosition }}>
                        <ReactMarkdown>{rawContent}</ReactMarkdown>
                    </span>
                </div>
            );
        }
        if (sectionId === "summary") {
            return (
                <div key={sectionId} className="cv-section" style={{ marginBottom: 16 }}>
                    <div className="cv-section-content" style={{ color: theme_json.color, fontSize: theme_json.size, wordBreak: 'break-word', textAlign: 'left' }}>
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
                        style={{ color: theme_json.colorTitle, textAlign: theme_json.alignTextTitle, fontSize: theme_json.sizeTitle }}
                    >
                        PERSONAL INFO
                    </h3>
                    <div className="cv-section-content" style={{ color: theme_json.color, fontSize: theme_json.size, wordBreak: 'break-word' }}>
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
                    style={{ color: theme_json.colorTitle, textAlign: theme_json.alignTextTitle, fontSize: theme_json.sizeTitle }}
                >
                    {sectionId.toUpperCase()}
                </h3>
                <div className="cv-section-content" style={{ color: theme_json.color, fontSize: theme_json.size, wordBreak: 'break-word' }}>
                    <ReactMarkdown>{rawContent}</ReactMarkdown>
                </div>
            </div>
        );
    };

    const renderPreview = () => {
        return layout_json.layout.rows.map(row => {
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
        window.print();
    };

    return (
        <div className="cv-builder px-[100px]">
            <div className="cv-left">
                <div className="flex justify-between">
                    <h2 className="font-bold text-left mb-4">Nhập thông tin CV</h2>
                    <Button onClick={handleExportCV}>Xuất CV</Button>
                </div>
                {renderInputs()}
            </div>
            <div
                className="cv-right"
            >
                {renderPreview()}
            </div>
        </div>
    );
}
