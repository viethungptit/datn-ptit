import "../styles/CVBuilder.css";
import ReactMarkdown from "react-markdown";

// Dùng lại sample layout, theme, data từ CVBuilder
const layout_json = {
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

const theme_json = {
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

const initialData = {
    avatar: "![image](https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg)",
    name: "Nguyễn Văn A",
    position: "Fullstack Developer",
    summary: "Lập trình viên với hơn 3 năm kinh nghiệm trong phát triển ứng dụng web. Thành thạo Node.js, React, và cơ sở dữ liệu SQL/NoSQL. Đam mê xây dựng sản phẩm tối ưu hiệu suất và trải nghiệm người dùng.",
    personal_info: `\n- Email: nguyenvana@example.com\n- Số điện thoại: 0987 654 321\n- Địa chỉ: 123 Lê Lợi, Hà Nội\n- LinkedIn: linkedin.com/in/nguyenvana\n- GitHub: github.com/nguyenvana\n  `,
    skills: `\n- Frontend: React, Redux, HTML5, CSS3, TailwindCSS\n- Backend: Node.js, Express.js, NestJS\n- Database: MySQL, MongoDB, PostgreSQL\n- DevOps: Docker, CI/CD, GitHub Actions\n- Ngôn ngữ: JavaScript, TypeScript, Python\n  `,
    certificates: `\n- AWS Certified Cloud Practitioner – 2023\n- Google Professional Cloud Developer – 2022\n- TOEIC 850 – 2021\n  `,
    experience: `\n**Fullstack Developer – Công ty ABC (2022 – nay)**\n- Thiết kế và phát triển hệ thống quản lý khách hàng (CRM).\n- Triển khai API RESTful và GraphQL.\n- Tối ưu hiệu suất ứng dụng, giảm 30% thời gian tải trang.\n\n**Backend Developer – Công ty XYZ (2020 – 2022)**\n- Xây dựng hệ thống quản lý đơn hàng cho eCommerce.\n- Viết test tự động với Jest và Mocha.\n- Tham gia thiết kế kiến trúc microservices.\n  `,
    projects: `\n**Hệ thống Chatbot hỗ trợ khách hàng**\n- Công nghệ: Node.js, React, MongoDB\n- Vai trò: Leader – phân công công việc, review code, triển khai Docker.\n- Kết quả: Giảm 40% thời gian phản hồi khách hàng.\n\n**Website thương mại điện tử**\n- Công nghệ: ReactJS, NestJS, PostgreSQL\n- Vai trò: Fullstack Developer\n- Kết quả: Hỗ trợ 5000+ người dùng hoạt động hàng ngày.\n  `,
    education: `\n**Đại học Bách Khoa Hà Nội (2016 – 2020)**\n- Chuyên ngành: Công nghệ thông tin\n- GPA: 3.45/4\n  `
};

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

type DataJson = Record<SectionId, string>;

const renderSection = (sectionId: SectionId, data: DataJson) => {
    const rawContent = data[sectionId] || "";
    if (sectionId === "avatar") {
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
            <div key={sectionId} className="cv-section" style={{ textAlign: theme_json.alignTextName as any, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: theme_json.sizeName, letterSpacing: 1, color: theme_json.colorName }}>
                    <ReactMarkdown>{rawContent}</ReactMarkdown>
                </span>
            </div>
        );
    }
    if (sectionId === "position") {
        return (
            <div key={sectionId} className="cv-section" style={{ textAlign: theme_json.alignTextPosition as any, marginBottom: 12 }}>
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
                    style={{ color: theme_json.colorTitle, textAlign: theme_json.alignTextTitle as any, fontSize: theme_json.sizeTitle }}
                >
                    PERSONAL INFO
                </h3>
                <div className="cv-section-content" style={{ color: theme_json.color, fontSize: theme_json.size, wordBreak: 'break-word' }}>
                    <ReactMarkdown>{rawContent}</ReactMarkdown>
                </div>
            </div>
        )
    }
    return (
        <div key={sectionId} className="cv-section">
            <h3
                className="cv-section-title"
                style={{ color: theme_json.colorTitle, textAlign: theme_json.alignTextTitle as any, fontSize: theme_json.sizeTitle }}
            >
                {sectionId.toUpperCase()}
            </h3>
            <div className="cv-section-content" style={{ color: theme_json.color, fontSize: theme_json.size, wordBreak: 'break-word' }}>
                <ReactMarkdown>{rawContent}</ReactMarkdown>
            </div>
        </div>
    );
};

const CVPreviewPage = () => {
    const data = initialData;
    return (
        <div className="cv-builder flex flex-col px-[100px] py-5">
            <div className="p-6 my-8 flex justify-center">
                <div className="cv-right">
                    {layout_json.layout.rows.map(row => {
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
                                        {col.sections.map(sec => renderSection(sec as SectionId, data))}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CVPreviewPage;
