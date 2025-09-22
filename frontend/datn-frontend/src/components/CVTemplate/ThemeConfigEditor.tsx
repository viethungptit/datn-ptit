
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

interface ThemeConfigEditorProps {
    theme: Theme;
    onChange: (theme: Theme) => void;
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
export default ThemeConfigEditor;
