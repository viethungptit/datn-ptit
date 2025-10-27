import CVPreview from "@/components/CVTemplate/CVPreview";
import LayoutEditor from "@/components/CVTemplate/LayoutEditor";
import ThemeConfigEditor from "@/components/CVTemplate/ThemeConfigEditor";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { initialData, englishInitialData } from '@/data/initialData';


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
    language?: 'vi' | 'en' | string;
    [key: string]: string | number | undefined;
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
    sizeAvatar: 150,
    language: 'vi',
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
    name: string;
    layout_json: LayoutJson;
    theme_json: Theme;
}

function getDefaultLayout(): LayoutJson {
    return {
        layout: {
            columns: 3,
            rows: [],
        },
    };
}

function CVTemplateBuilder() {
    const [editing, setEditing] = useState<Template | null>(null);
    const [theme, setTheme] = useState<Theme>({ ...defaultTheme });

    const handleNew = () => {
        const newTpl: Template = {
            name: "Mẫu CV mới",
            layout_json: getDefaultLayout(),
            theme_json: { ...defaultTheme },
        };
        setEditing(newTpl);
    }

    useEffect(() => {
        handleNew();
    }, []);

    const handleLayoutChange = (newLayout: LayoutJson) => {
        if (!editing) return;
        setEditing({ ...editing, layout_json: newLayout });
    }

    const handleNameChange = (name: string) => {
        if (!editing) return;
        setEditing({ ...editing, name });
    }

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
    }

    const handleCreateTemplate = () => {
        if (!editing) return;
        console.log('theme_json:', editing.theme_json);
        console.log('layout_json:', editing.layout_json);
    }

    return (
        <div className="px-4 py-2">
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
                    <ThemeConfigEditor
                        theme={theme}
                        onChange={handleThemeChange as any}
                        templateName={editing?.name}
                        onTemplateNameChange={handleNameChange}
                    />
                </div>
                <div className="col-span-2">
                    <CVPreview layout_json={editing?.layout_json} initialData={theme.language === 'en' ? englishInitialData : initialData} theme={theme} />
                </div>
            </div>
            <div className="flex justify-end">
                <Button variant="login" onClick={handleCreateTemplate}>Lưu mẫu CV</Button>
            </div>
        </div >
    );
}


export default CVTemplateBuilder;
