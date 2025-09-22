import { useState, useEffect, type ChangeEvent } from "react";
import ReactMarkdown from "react-markdown";

interface SectionInfo {
    key: string;
    label: string;
    required: boolean;
}

const SECTION_LIST: SectionInfo[] = [
    { key: "name", label: "Tên", required: true },
    { key: "position", label: "Vị trí", required: true },
    { key: "summary", label: "Tóm tắt", required: true },
    { key: "personal_info", label: "Thông tin cá nhân", required: true },
    { key: "skills", label: "Kỹ năng", required: true },
    { key: "certificates", label: "Chứng chỉ", required: true },
    { key: "experience", label: "Kinh nghiệm", required: true },
    { key: "projects", label: "Dự án", required: true },
    { key: "education", label: "Học vấn", required: true },
    { key: "avatar", label: "Ảnh đại diện", required: false },
];

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

interface RowEditorProps {
    row: Row;
    columnsCount: number;
    onChange: (row: Row) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    usedSections: string[];
    idx: number;
    totalRows: number;
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

function Backup() {
    const [editing, setEditing] = useState < Template | null > (null);
    const [jsonPreview, setJsonPreview] = useState < string > ("");
    const [theme, setTheme] = useState({ ...defaultTheme });

    useEffect(() => {
        const loaded = loadTemplates();
        if (loaded.length > 0) {
            setEditing({ ...loaded[0] });
        } else {
            handleNew();
        }
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (editing) {
            setJsonPreview(JSON.stringify(editing.layout_json, null, 2));
        }
    }, [editing]);

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
        <div>
            <div className="mb-4 flex justify-end">
                <button
                    className="btn btn-success px-4 py-2 rounded font-semibold"
                    onClick={handleCreateTemplate}
                >
                    Tạo template
                </button>
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

interface LayoutEditorProps {
    layout: LayoutJson;
    onChange: (layout: LayoutJson) => void;
}
function LayoutEditor({ layout, onChange }: LayoutEditorProps) {
    const [rows, setRows] = useState < Row[] > (layout.layout.rows);
    const [newRowColSpan, setNewRowColSpan] = useState < number > (1);

    useEffect(() => {
        onChange({ layout: { columns: 3, rows } });
        // eslint-disable-next-line
    }, [rows]);

    function handleNewRowColSpanChange(e: ChangeEvent<HTMLSelectElement>) {
        setNewRowColSpan(Number(e.target.value));
    }
    function addRow() {
        const newRow: Row = {
            id: "row-" + Date.now(),
            colSpan: newRowColSpan,
            columns: Array.from({ length: newRowColSpan }, (_, i) => ({
                id: `col-${Date.now()}-${i}`,
                sections: [],
                colSpan: 1,
            })),
        };
        setRows([...rows, newRow]);
    }
    function updateRow(idx: number, newRow: Row) {
        const newRows = rows.slice();
        newRows[idx] = newRow;
        setRows(newRows);
    }
    function deleteRow(idx: number) {
        setRows(rows.filter((_, i) => i !== idx));
    }
    function moveRow(idx: number, dir: number) {
        const newRows = rows.slice();
        const target = idx + dir;
        if (target < 0 || target >= newRows.length) return;
        [newRows[idx], newRows[target]] = [newRows[target], newRows[idx]];
        setRows(newRows);
    }

    // Collect all used sections in the layout
    const usedSections = rows.flatMap(row => row.columns.flatMap(col => col.sections));

    return (
        <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">Cấu hình chung</h2>
            <div className="mb-2">
                <label className="font-semibold">Số cột của dòng mới:</label>
                <select className="border rounded px-2 py-1 ml-2" value={newRowColSpan} onChange={handleNewRowColSpanChange}>
                    {[1, 2, 3].map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <button className="ml-4 btn btn-info" onClick={addRow}>
                    <i className="fa-xs mr-1 fa-solid fa-plus"></i>
                    Thêm dòng
                </button>
            </div>
            <div>
                {rows.map((row, idx) => (
                    <RowEditor
                        key={row.id}
                        row={row}
                        columnsCount={row.colSpan}
                        onChange={(newRow) => updateRow(idx, newRow)}
                        onDelete={() => deleteRow(idx)}
                        onMoveUp={() => moveRow(idx, -1)}
                        onMoveDown={() => moveRow(idx, 1)}
                        usedSections={usedSections}
                        idx={idx}
                        totalRows={rows.length}
                    />
                ))}
            </div>
        </div>
    );
}

function RowEditor({ row, onChange, onDelete, onMoveUp, onMoveDown, usedSections, idx, totalRows }: RowEditorProps) {
    const [cols, setCols] = useState < Column[] > (row.columns);
    useEffect(() => {
        onChange({ ...row, columns: cols });
    }, [cols]);

    function updateCol(colIdx: number, newCol: Column) {
        const newCols = cols.slice();
        newCols[colIdx] = newCol;
        setCols(newCols);
    }
    function deleteCol(colIdx: number) {
        setCols(cols.filter((_, i) => i !== colIdx));
    }
    function moveCol(colIdx: number, dir: number) {
        const newCols = cols.slice();
        const target = colIdx + dir;
        if (target < 0 || target >= newCols.length) return;
        [newCols[colIdx], newCols[target]] = [newCols[target], newCols[colIdx]];
        setCols(newCols);
    }

    return (
        <div className="border rounded p-2 mb-2 bg-gray-50">
            <div className="flex items-center mb-2">
                <span className="font-semibold">Dòng {idx + 1}</span>
                <button className="ml-2 btn btn-danger" onClick={onDelete}><i className="fa-solid fa-trash"></i></button>
                <button className={`ml-2 btn btn-secondary ${idx === 0 ? 'hidden' : ''}`} onClick={onMoveUp}><i className="fa-lg fa-solid fa-caret-up"></i></button>
                <button className={`ml-2 btn btn-secondary ${idx === totalRows - 1 ? 'hidden' : ''}`} onClick={onMoveDown}><i className="fa-lg fa-solid fa-caret-down"></i></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {cols.map((col, colIdx) => (
                    <ColumnEditor
                        key={col.id}
                        col={col}
                        onChange={(newCol) => updateCol(colIdx, newCol)}
                        onDelete={() => deleteCol(colIdx)}
                        onMoveUp={() => moveCol(colIdx, -1)}
                        onMoveDown={() => moveCol(colIdx, 1)}
                        usedSections={usedSections}
                        idx={colIdx}
                        totalCols={cols.length}
                    />
                ))}
            </div>
        </div>
    );
}

interface ColumnEditorProps {
    col: Column;
    onChange: (col: Column) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    usedSections: string[];
    idx: number;
    totalCols: number;
}
function ColumnEditor({ col, onChange, onMoveUp, onMoveDown, usedSections, idx, totalCols }: ColumnEditorProps) {
    const [sections, setSections] = useState < string[] > (col.sections);
    useEffect(() => {
        onChange({ ...col, sections });
        // eslint-disable-next-line
    }, [sections]);

    function addSection(section: string) {
        if (!sections.includes(section)) {
            setSections([...sections, section]);
        }
    }
    function removeSection(section: string) {
        setSections(sections.filter((s) => s !== section));
    }
    function moveSection(idx: number, dir: number) {
        const newSections = sections.slice();
        const target = idx + dir;
        if (target < 0 || target >= newSections.length) return;
        [newSections[idx], newSections[target]] = [newSections[target], newSections[idx]];
        setSections(newSections);
    }

    return (
        <div className="border rounded p-2 bg-white">
            <div className="flex items-center mb-2">
                <span className="font-semibold">Cột {idx + 1}</span>
                <button className={`ml-2 btn btn-secondary ${idx === 0 ? 'hidden' : ''}`} onClick={onMoveUp}>
                    <i className="fa-lg fa-solid fa-caret-left"></i>
                </button>
                <button className={`ml-2 btn btn-secondary ${idx === totalCols - 1 ? 'hidden' : ''}`} onClick={onMoveDown}>
                    <i className="fa-lg fa-solid fa-caret-right"></i>
                </button>
            </div>
            <SectionSelector
                selected={sections}
                onAdd={addSection}
                onRemove={removeSection}
                onMove={moveSection}
                usedSections={usedSections}
            />
        </div>
    );
}

interface SectionSelectorProps {
    selected: string[];
    onAdd: (section: string) => void;
    onRemove: (section: string) => void;
    onMove: (idx: number, dir: number) => void;
    usedSections: string[];
}
function SectionSelector({ selected, onAdd, onRemove, onMove, usedSections }: SectionSelectorProps) {
    return (
        <div>
            <div className="mb-2">
                <div className="flex flex-wrap gap-2 mt-1">
                    {SECTION_LIST.filter(sec => !selected.includes(sec.key) && !usedSections.includes(sec.key)).map((sec) => (
                        <button
                            key={sec.key}
                            className={`px-2 py-1 rounded border bg-gray-100 text-xs`}
                            onClick={() => onAdd(sec.key)}
                        >
                            {sec.label}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <ul className="mt-1">
                    {selected.map((sec, idx) => {
                        const info = SECTION_LIST.find((s) => s.key === sec);
                        return (
                            <li key={sec} className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-3 rounded border text-xs bg-green-100">{info?.label || sec}
                                    <button className="btn btn-danger ml-2" onClick={() => onRemove(sec)}><i className="fa-sm fa-solid fa-trash"></i></button>
                                </span>
                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        className={`${idx === 0 ? 'hidden' : ''} w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40`}
                                        onClick={() => onMove(idx, -1)}
                                    >
                                        <i className="fa-solid fa-caret-up text-sm"></i>
                                    </button>
                                    <button
                                        className={`${idx === selected.length - 1 ? 'hidden' : ''} w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40`}
                                        onClick={() => onMove(idx, 1)}
                                    >
                                        <i className="fa-solid fa-caret-down text-sm"></i>
                                    </button>
                                </div>

                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

interface JSONPreviewProps {
    json: string;
}
function JSONPreview({ json }: JSONPreviewProps) {
    return (
        <div className="bg-gray-100 rounded border p-4 overflow-x-auto">
            <h2 className="font-bold mb-2">Xem trước JSON</h2>
            <pre className="text-left text-xs overflow-x-auto whitespace-pre-wrap">{json}</pre>
        </div>
    );
}


interface ThemeConfigEditorProps {
    theme: typeof defaultTheme;
    onChange: (theme: typeof defaultTheme) => void;
}

function ThemeConfigEditor({ theme, onChange }: ThemeConfigEditorProps) {
    // Các trường size
    const sizeFields = [
        { key: "size", label: "Cỡ chữ chung" },
        { key: "sizeTitle", label: "Cỡ chữ tiêu đề" },
        { key: "sizeName", label: "Cỡ chữ tên" },
        { key: "sizePosition", label: "Cỡ chữ vị trí" },
        { key: "sizeAvatar", label: "Kích thước ảnh đại diện" },
        { key: "borderRadiusAvatar", label: "Bo góc ảnh đại diện" },
    ];
    // Các trường màu
    const colorFields = [
        { key: "color", label: "Màu chữ chung" },
        { key: "colorTitle", label: "Màu chữ tiêu đề" },
        { key: "colorName", label: "Màu chữ tên" },
        { key: "colorPosition", label: "Màu chữ vị trí" },
    ];
    // Các trường alignText
    const alignFields = [
        { key: "alignTextTitle", label: "Căn lề tiêu đề" },
        { key: "alignTextName", label: "Căn lề tên" },
        { key: "alignTextPosition", label: "Căn lề vị trí" },
    ];

    function handleSizeChange(key: string, value: number) {
        onChange({ ...theme, [key]: value });
    }
    function handleColorChange(key: string, value: string) {
        onChange({ ...theme, [key]: value });
    }
    function handleAlignChange(key: string, value: string) {
        onChange({ ...theme, [key]: value });
    }

    return (
        <div className="bg-white rounded border p-4 mb-2">
            <h2 className="font-bold mb-2">Cấu hình khác</h2>
            <div className="mb-4">
                <h3 className="font-semibold mb-1">Kích thước</h3>
                <div className="grid grid-cols-2 gap-4">
                    {sizeFields.map(f => (
                        <div key={f.key} className="flex items-center gap-2">
                            <label className="text-sm text-left w-32">{f.label}</label>
                            <input
                                type="number"
                                min={0}
                                value={Number(theme[f.key])}
                                onChange={e => handleSizeChange(f.key, Number(e.target.value))}
                                className="text-sm border rounded px-2 py-1 w-20"
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className="mb-4">
                <h3 className="font-semibold mb-1">Màu sắc</h3>
                <div className="grid grid-cols-2 gap-4">
                    {colorFields.map(f => (
                        <div key={f.key} className="flex items-center gap-2">
                            <label className="text-sm text-left w-28">{f.label}</label>
                            <input
                                type="color"
                                value={String(theme[f.key])}
                                onChange={e => handleColorChange(f.key, e.target.value)}
                                className="w-10 h-8"
                            />
                            <span className="text-xs text-left w-20">{String(theme[f.key])}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mb-4">
                <h3 className="font-semibold mb-1">Căn lề</h3>
                <div className="grid grid-cols-2 gap-4">
                    {alignFields.map(f => (
                        <div key={f.key} className="flex items-center gap-2">
                            <label className="text-sm text-left w-32">{f.label}</label>
                            <select
                                value={String(theme[f.key])}
                                onChange={e => handleAlignChange(f.key, e.target.value)}
                                className="text-sm border rounded px-2 py-1 w-24"
                            >
                                <option value="left">Trái</option>
                                <option value="center">Giữa</option>
                                <option value="right">Phải</option>
                            </select>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

interface ThemeJSONPreviewProps {
    json: string;
}

function ThemeJSONPreview({ json }: ThemeJSONPreviewProps) {
    return (
        <div className="bg-gray-100 rounded border p-4 overflow-x-auto">
            <h2 className="font-bold mb-2">Xem trước Theme JSON</h2>
            <pre className="text-left text-xs overflow-x-auto whitespace-pre-wrap">{json}</pre>
        </div>
    );
}


interface CVPreviewProps {
    layout_json?: LayoutJson;
    initialData: Record<string, string>;
    theme?: typeof defaultTheme;
}
function CVPreview({ layout_json, initialData, theme }: CVPreviewProps) {
    if (!layout_json) return null;
    const { rows } = layout_json.layout;

    const renderSection = (sec: string) => (
        <SectionPreview key={sec} section={sec} initialData={initialData} theme={theme} />
    );

    const renderPreview = () => {
        return rows.map(row => {
            const totalColSpan = row.columns.reduce((sum, col) => sum + (col.colSpan || 1), 0);
            return (
                <div
                    key={row.id}
                    className="cv-row mb-2"
                    style={{ display: 'grid', gridTemplateColumns: `repeat(${totalColSpan}, 1fr)`, gap: '8px' }}
                >
                    {row.columns.map(col => (
                        <div
                            key={col.id}
                            className="text-left rounded p-2 border-2 border-dashed"
                            style={{ gridColumn: `span ${col.colSpan || 1}` }}
                        >
                            {col.sections.map(sec => renderSection(sec))}
                        </div>
                    ))}
                </div>
            );
        });
    };

    return (
        <div className="border rounded p-4">
            <h2 className="font-bold mb-2">Xem trước</h2>
            {renderPreview()}
        </div>
    );
}

interface SectionPreviewProps {
    section: string;
    initialData: Record<string, string>;
    theme?: typeof defaultTheme;
}
function SectionPreview({ section, initialData, theme }: SectionPreviewProps) {
    if (section === "avatar") {
        return (
            <div className="flex justify-center mb-2">
                <img
                    src={initialData.avatar}
                    alt="avatar"
                    style={{
                        borderRadius: theme?.borderRadiusAvatar || 100,
                        width: theme?.sizeAvatar || 150,
                        height: theme?.sizeAvatar || 150,
                        objectFit: 'cover',
                    }}
                />
            </div>
        );
    }
    // Tùy chỉnh style cho từng section
    let style: React.CSSProperties = {
        color: theme?.color,
        fontSize: theme?.size,
    };
    let titleStyle: React.CSSProperties = {
        color: theme?.colorTitle,
        fontSize: theme?.sizeTitle,
        textAlign: theme?.alignTextTitle as React.CSSProperties['textAlign'],
    };
    if (section === "name") {
        style = {
            color: theme?.colorName,
            fontSize: theme?.sizeName,
            textAlign: theme?.alignTextName as React.CSSProperties['textAlign'],
            fontWeight: 700,
        };
    }
    if (section === "position") {
        style = {
            color: theme?.colorPosition,
            fontSize: theme?.sizePosition,
            textAlign: theme?.alignTextPosition as React.CSSProperties['textAlign'],
            fontWeight: 600,
        };
    }
    return (
        <div className="mb-2">
            <div className="font-semibold mb-1" style={titleStyle}>{section.toUpperCase()}</div>
            <div style={style}>
                <ReactMarkdown>{initialData[section] || ""}</ReactMarkdown>
            </div>
        </div>
    );
}

export default Backup;
