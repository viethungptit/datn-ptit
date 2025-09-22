import CVPreview from "@/components/CVTemplate/CVPreview";
import LayoutEditor from "@/components/CVTemplate/LayoutEditor";
import ThemeConfigEditor from "@/components/CVTemplate/ThemeConfigEditor";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const initialData: Record<string, string> =
{
    avatar: "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg",
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


interface Theme {
    color: string;
    size: number;
    colorTitle: string;
    sizeTitle: number;
    colorName: string;
    sizeName: number;
    colorPosition: string;
    sizePosition: number;
    alignTextTitle: string;
    alignTextName: string;
    alignTextPosition: string;
    borderRadiusAvatar: number;
    sizeAvatar: number;
    [key: string]: string | number; // index signature for dynamic access
}

const defaultTheme: Theme = {
    color: "#333333",
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

interface LayoutJson {
    layout: {
        columns: number;
        rows: Row[];
    };
}

interface Row {
    id: string;
    colSpan: number;
    columns: Column[];
}

interface Column {
    id: string;
    sections: string[];
    colSpan?: number;
}

interface Template {
    id: string;
    name: string;
    layout_json: LayoutJson;
}

function getDefaultLayout(): LayoutJson {
    return {
        layout: {
            columns: 3,
            rows: [],
        },
    };
}

function loadTemplates(): Template[] {
    try {
        return JSON.parse(localStorage.getItem("cv_templates_demo") || "[]");
    } catch {
        return [];
    }
}

function CVTemplateBuilder() {
    const [editing, setEditing] = useState<Template | null>(null);
    const [theme, setTheme] = useState({ ...defaultTheme });

    useEffect(() => {
        const loaded = loadTemplates();
        if (loaded.length > 0) {
            setEditing({ ...loaded[0] });
        } else {
            handleNew();
        }
    }, []);

    function handleNew() {
        const newTpl: Template = {
            id: "tpl-" + Date.now(),
            name: "Template mới",
            layout_json: getDefaultLayout(),
        };
        setEditing(newTpl);
    }

    function handleLayoutChange(newLayout: LayoutJson) {
        if (!editing) return;
        setEditing({ ...editing, layout_json: newLayout });
    }

    function handleThemeChange(newTheme: typeof defaultTheme) {
        setTheme(newTheme);
    }

    function handleCreateTemplate() {
        if (!editing) return;
        // Log ra theme_json và layout_json dạng object
        console.log('theme_json:', theme);
        console.log('layout_json:', editing.layout_json);
    }

    return (
        <div className="px-[100px]">
            <div className="flex justify-end">
                <Button className="ml-2" onClick={handleCreateTemplate}>Tạo template</Button>
            </div>
            {
                editing && (
                    <div className="bg-white rounded shadow p-2 mb-6">
                        <LayoutEditor
                            layout={editing.layout_json}
                            onChange={handleLayoutChange}
                        />
                    </div>
                )
            }
            <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                    <ThemeConfigEditor theme={theme} onChange={handleThemeChange} />
                </div>
                <div className="col-span-2">
                    <CVPreview layout_json={editing?.layout_json} initialData={initialData} theme={theme} />
                </div>
            </div>

        </div >
    );
}


export default CVTemplateBuilder;
