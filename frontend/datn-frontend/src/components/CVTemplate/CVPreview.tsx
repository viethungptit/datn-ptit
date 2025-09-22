import ReactMarkdown from "react-markdown";

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
    [key: string]: string | number;
}
interface CVPreviewProps {
    layout_json?: LayoutJson;
    initialData: Record<string, string>;
    theme?: Theme;
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
    theme?: Theme;
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

export default CVPreview;
